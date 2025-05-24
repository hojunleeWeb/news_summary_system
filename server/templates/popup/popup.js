// popup/popup.js

// 서버 URL 설정
let fetch_url = "http://192.168.0.127:5000"; // 노트북 버전 - 스카

document.addEventListener("DOMContentLoaded", () => {
    // 로그인 리디렉션 버튼
    const loginRedirect = document.getElementById("loginRedirect");
    if (loginRedirect) {
        loginRedirect.addEventListener("click", () => {
            const login_container = document.getElementById("login-container");
            if (login_container.style.display === "none" || login_container.style.display === "") {
                login_container.style.display = "block";
            } else {
                login_container.style.display = "none";
            }
        });
    }

    // 환경설정 버튼 -> 새 탭
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/settings/settings.html"),
            });
        });
    }

    // 이력조회 버튼 -> 새 탭
    const historyBtn = document.getElementById("historyBtn");
    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/history/history.html"),
            });
        });
    }

    // 요약하기 버튼 클릭 이벤트
    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            updateResult("페이지 데이터 추출 중..."); // 사용자 피드백 시작
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                if (!tab || !tab.id || !tab.url) {
                    updateResult("활성 탭 정보를 가져올 수 없습니다.");
                    console.error("활성 탭 정보를 가져올 수 없습니다.");
                    return;
                }

                // getPageData 함수를 호출하여 페이지 데이터를 추출
                const pageData = await getPageData(tab.id, tab.url, tab.title);

                console.log("popup.js: 추출된 페이지 데이터:", pageData);

                // URL 유형 및 추출된 텍스트 유효성 검사
                if (pageData.urlType === "unsupported") {
                    updateResult("죄송합니다. 현재 페이지는 요약이 지원되지 않습니다.");
                    return;
                } else if (pageData.urlType !== "youtube" && (!pageData.text || pageData.text.length < 50)) {
                    // 유튜브가 아닌데 텍스트 길이가 짧으면 실패로 간주
                    updateResult("페이지 본문 추출에 실패했거나, 충분한 텍스트를 찾을 수 없습니다.");
                    console.error("본문 추출 실패: 텍스트 길이가 너무 짧거나 없음.", pageData);
                    return;
                }

                // 사용자 설정 가져오기
                const settings = await new Promise((resolve) => {
                    chrome.storage.local.get(["summaryLanguage", "summaryFontSize", "summaryOutputFormat"], (items) =>
                        resolve(items)
                    );
                });
                const language = settings.summaryLanguage || "한국어";
                const fontSize = settings.summaryFontSize || 5;
                const outputFormat = settings.summaryOutputFormat || "inline";

                // 서버 요청
                await sendSummaryRequest(
                    pageData.url,
                    pageData.text,
                    pageData.title,
                    language, // 사용자 설정 전달
                    fontSize, // 사용자 설정 전달
                    outputFormat, // 사용자 설정 전달
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

// 결과 메시지 업데이트 함수
function updateResult(message) {
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
        resultDiv.textContent = message;
    }
}

/**
 * 현재 탭의 URL을 기반으로 페이지 데이터를 추출합니다.
 * 이 함수는 chrome.scripting.executeScript를 사용하여 필요시 페이지 내 스크립트를 실행합니다.
 * @param {number} tabId - 현재 활성 탭의 ID
 * @param {string} currentUrl - 현재 탭의 URL
 * @param {string} defaultTitle - 현재 탭의 기본 제목
 * @returns {object} { url: string, urlType: string, text: string|null, title: string, isYoutube: boolean }
 */
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
        // 유튜브는 텍스트 추출 없이 URL만 전달 (서버에서 처리)
    } else if (NAVER_NEWS_PATTERN.test(currentUrl)) {
        urlType = "naver_news";
        // 네이버 뉴스 기사 본문 추출 (scripting API 사용)
        try {
            const scriptResults = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: () => {
                    // 이 함수는 웹 페이지 컨텍스트에서 실행됩니다.
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
        // 일반 웹페이지 본문 추출 (scripting API 사용)
        try {
            const scriptResults = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                function: () => {
                    // 이 함수는 웹 페이지 컨텍스트에서 실행됩니다.
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

// sendSummaryRequest 함수는 별도 파일에 있으므로 여기에 정의하지 않습니다.
// 대신, popup.js 상단에 <script src="경로/to/sendSummaryRequest.js"></script>와 같이
// HTML에서 로드하거나, 또는 모듈 시스템을 사용해야 합니다.
