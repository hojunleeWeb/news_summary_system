// popup/popup.js

import { setupSettings } from "../setting/setting.js";
import { setupSignupHandlers } from "../login/signup.js";
import { setupLoginHandlers } from "../login/login.js";
import { updateResult } from "../utils/updateResult.js"; //
import { sendSummaryRequest } from "../utils/sendSummaryRequest.js"; // 요약 요청을 보내는 함수

// 서버 URL 설정
let fetch_url = "http://192.168.0.127:5000";

document.addEventListener("DOMContentLoaded", () => {
    // 요소들 캐싱
    const loginRedirect = document.getElementById("loginRedirect");
    const loginContainer = document.getElementById("login-container");
    const settingsContainer = document.getElementById("settings-container");
    const summarizeBtn = document.getElementById("summarizeBtn");
    // const resultDiv = document.getElementById("result"); // 이제 임포트해서 사용하므로 여기서 제거
    const historyBtn = document.getElementById("historyBtn");

    // settings.js에 정의된 setupSettings 함수 호출
    setupSettings(settingsContainer, loginContainer, updateResult); // updateResult 함수를 인자로 전달

    // 로그인 상태를 업데이트하는 함수.
    // 이 함수는 login.js와 popup.js 모두에서 사용되므로 상위 스코프에 정의합니다.
    const updateLoginState = () => {
        const user = localStorage.getItem("user");
        const isLoggedIn = user && JSON.parse(user).isLoggedIn;

        if (isLoggedIn) {
            const userData = JSON.parse(user);
            loginRedirect.innerHTML = `<span class="username">${userData.email}</span> (로그아웃)`;
            console.log("로그인 상태:", userData.email);
            return true; // 로그인 상태를 반환
        } else {
            loginRedirect.innerHTML = `<span class="username">로그인</span>`;
            console.log("로그아웃 상태");
            return false; // 로그인 상태를 반환
        }
    };

    // 페이지 로드 시 로그인 상태 확인 및 UI 업데이트
    updateLoginState();

    // login.js의 setupLoginHandlers 함수 호출
    setupLoginHandlers(fetch_url, loginRedirect, loginContainer, summarizeBtn, updateResult, updateLoginState); // updateResult 함수 전달
    // signup.js의 setupSignupHandlers 함수 호출
    setupSignupHandlers(fetch_url, loginContainer, summarizeBtn, updateResult); // updateResult 함수 전달

    // 로그인 리디렉션 버튼 (로그인 컨테이너 토글)

    // 이력조회 버튼 -> 새 탭
    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/history/history.html"),
            });
        });
    }

    // 요약하기 버튼 클릭 이벤트
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            updateResult("페이지 데이터 추출 중..."); // 임포트된 updateResult 사용
            settingsContainer.style.display = "none";
            loginContainer.style.display = "none";

            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (!tab || !tab.id || !tab.url) {
                    updateResult("활성 탭 정보를 가져올 수 없습니다.");
                    console.error("활성 탭 정보를 가져올 수 없습니다.");
                    return;
                }
                if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
                    updateResult("이 페이지는 요약할 수 없습니다.");
                    return;
                }
                const pageData = await getPageData(tab.id, tab.url, tab.title);
                console.log("popup.js: 추출된 페이지 데이터:", pageData);
                if (pageData.urlType === "unsupported") {
                    updateResult("죄송합니다. 현재 페이지는 요약이 지원되지 않습니다.");
                    return;
                } else if (pageData.urlType !== "youtube" && (!pageData.text || pageData.text.length < 50)) {
                    updateResult("페이지 본문 추출에 실패했거나, 충분한 텍스트를 찾을 수 없습니다.");
                    console.error("본문 추출 실패: 텍스트 길이가 너무 짧거나 없음.", pageData);
                    return;
                }
                const settings = await new Promise((resolve) => {
                    chrome.storage.local.get(["summaryLanguage", "summaryFontSize", "summaryOutputFormat"], (items) =>
                        resolve(items)
                    );
                });
                //const language = settings.summaryLanguage || "한국어";
                const fontSize = settings.summaryFontSize || 14;
                const outputFormat = settings.summaryOutputFormat || "inline";

                await sendSummaryRequest(
                    pageData.url,
                    pageData.text,
                    pageData.title,
                    //language,
                    fontSize,
                    outputFormat,
                    pageData.isYoutube,
                    fetch_url
                );
            } catch (error) {
                console.error("요약 과정 중 오류 발생:", error);
                updateResult(`오류가 발생했습니다: ${error.message}`);
            }
        });
    }
});

// getPageData, sendSummaryRequest 함수는 popup.js에 그대로 유지
async function getPageData(tabId, currentUrl, defaultTitle) {
    const YOUTUBE_PATTERN = /^https?:\/\/www\.(?:youtube\.com|youtu\.be)/;
    const NAVER_NEWS_PATTERN = /^https?:\/\/n\.news\.naver\.com\/article\/(\d+)\/(\d+)(?:\?.*)?$/;

    let urlType = "unsupported";
    let extractedText = null;
    let pageTitle = defaultTitle || "제목 없음";
    let isYoutube = false;

    if (YOUTUBE_PATTERN.test(currentUrl)) {
        urlType = "youtube";
        isYoutube = true;
    } else if (NAVER_NEWS_PATTERN.test(currentUrl)) {
        urlType = "naver_news";
        try {
            const scriptResults = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: () => {
                    const titleElement = document.querySelector(".media_end_head_title");
                    const newsTitle = titleElement ? titleElement.innerText.trim() : document.title;
                    const newsAreaElement = document.getElementById("dic_area");
                    let newsArea = newsAreaElement ? newsAreaElement.innerText.trim() : null;

                    if (newsArea) {
                        newsArea = newsArea
                            .replace(/\n\s*\n/g, "\n")
                            .replace(/\s\s+/g, " ")
                            .trim();
                    } else {
                        newsArea = document.body.innerText.trim();
                        if (newsArea.length > 5000) {
                            newsArea = newsArea.substring(0, 5000) + "... (전문이 아닐 수 있음)";
                        }
                    }
                    return { text: newsArea, title: newsTitle };
                },
            });

            if (scriptResults && scriptResults.length > 0 && scriptResults[0].result) {
                extractedText = scriptResults[0].result.text;
                pageTitle = scriptResults[0].result.title;
            } else {
                console.warn("getPageData: 네이버 뉴스 스크립트 결과 없음 또는 유효하지 않음:", scriptResults);
            }
        } catch (error) {
            console.error("getPageData: 네이버 뉴스 데이터 추출 스크립트 오류:", error);
        }
    } else {
        urlType = "general_webpage";
        try {
            const scriptResults = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: () => {
                    let extracted = null;
                    const selectors = ["article", "main", "div.article-body", "section", "body"];
                    for (const selector of selectors) {
                        const el = document.querySelector(selector);
                        if (el && el.innerText && el.innerText.length > 200) {
                            extracted = el.innerText.trim();
                            break;
                        }
                    }
                    if (!extracted) {
                        extracted = document.body.innerText.trim();
                        if (extracted.length > 5000) {
                            extracted = extracted.substring(0, 5000) + "... (전문이 아닐 수 있음)";
                        }
                    }
                    return { text: extracted, title: document.title || "제목 없음" };
                },
            });

            if (scriptResults && scriptResults.length > 0 && scriptResults[0].result) {
                extractedText = scriptResults[0].result.text;
                pageTitle = scriptResults[0].result.title;
            } else {
                console.warn("getPageData: 일반 웹페이지 스크립트 결과 없음 또는 유효하지 않음:", scriptResults);
            }
        } catch (error) {
            console.error("getPageData: 일반 웹페이지 데이터 추출 스크립트 오류:", error);
        }
    }

    return {
        url: currentUrl,
        urlType: urlType,
        text: extractedText,
        title: pageTitle,
        isYoutube: isYoutube,
    };
}
