let resultDiv = document.getElementById("result");

//pc 버전
//let fetch_url = "http://192.168.0.67:5000";
//노트북 버전 - 핫스팟
//let fetch_url = "http://192.168.96.187:5000";
//노트북 버전 - 스카
let fetch_url = "http://192.168.0.127:5000";

// 로그인 상태 확인
const loginRedirect = document.getElementById("loginRedirect");
if (loginRedirect) {
    loginRedirect.addEventListener("click", () => {
        let login_container = document.getElementById("login-container");
        if (login_container.style.display == "none") {
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

document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let resultDiv = document.getElementById("result");

    if (tab && tab.url) {
        const currentUrl = tab.url;
        const pattern = /^https?:\/\/www\.(?:youtube\.com|youtu\.be)/;
        let isYoutube = false;
        let extractedText = null;

        if (pattern.test(currentUrl)) {
            // 유튜브 URL인 경우
            isYoutube = true;
            // extractedText는 서버에서 URL을 기반으로 처리하므로 null로 유지
            get_summary(null, currentUrl, true, fetch_url);
        } else {
            // 네이버 뉴스 URL인 경우
            try {
                const result = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const titleElement = document.querySelector(".media_end_head_title");
                        const newsTitle = titleElement ? titleElement.innerText : null;
                        const newsAreaElement = document.getElementById("dic_area");
                        let newsArea = newsAreaElement ? newsAreaElement.innerText : null;
                        if (newsArea) {
                            newsArea = newsArea.replace(/\n/g, "");
                        }
                        return newsTitle ? `${newsTitle}\n${newsArea}` : newsArea;
                    },
                });

                if (chrome.runtime.lastError) {
                    resultDiv.textContent = "데이터 추출 중 오류가 발생했습니다.";
                    console.error(chrome.runtime.lastError.message);
                    return;
                }

                if (result && result.length > 0 && result[0].result) {
                    extractedText = result[0].result;
                    get_summary(extractedText, currentUrl, false, fetch_url);
                } else {
                    resultDiv.textContent = "해당 페이지에서 데이터를 찾을 수 없습니다.";
                }
            } catch (error) {
                resultDiv.textContent = "데이터 추출 중 오류 발생: " + error;
                console.error(error);
            }
        }
    }
});
