document.addEventListener("DOMContentLoaded", () => {
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

    // 요약하기 버튼
    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                //로그 출력
                console.log("현재 탭:", tab);

                // 현재 탭이 유효한지 확인
                chrome.tabs.sendMessage(tab.id, { action: "getTextAndTitle" }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.text) {
                        console.error("본문 추출 실패", chrome.runtime.lastError);
                        updateResult("본문 추출 중 오류가 발생했습니다.");
                        return;
                    }

                    const url = tab.url;
                    const pageText = response.text;
                    const pageTitle = response.title;

                    // 로그 출력
                    console.log("요약 요청 데이터:", {
                        url: url,
                        title: pageTitle,
                        textLength: pageText.length,
                        date: new Date().toISOString(),
                    });

                    // 사용자 설정 가져오기
                    chrome.storage.local.get(
                        ["summaryLanguage", "summaryFontSize", "summaryOutputFormat"],
                        (settings) => {
                            const language = settings.summaryLanguage || "한국어";
                            const fontSize = settings.summaryFontSize || 5;
                            const outputFormat = settings.summaryOutputFormat || "inline";
                            // 서버에 전송
                            sendToServer(url, pageText, language, fontSize, outputFormat, (summary) => {
                                //로그 출력
                                console.log("서버로부터 받은 요약:", summary);

                                saveHistory(url, pageText, pageTitle, summary);
                            });
                        }
                    );
                });
            } catch (error) {
                console.error("오류 발생:", error);
                updateResult("오류가 발생했습니다.");
            }
        });
    }
});

// 결과 메시지 업데이트
function updateResult(message) {
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
        resultDiv.textContent = message;
    }
}

// 서버에 POST 요청 보내는 함수
function sendToServer(url, text, language, fontSize, outputFormat, callback) {
    fetch("http://localhost:5000/api/summary/url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, text, language, fontSize }),
    })
        .then((response) => response.json())
        .then((data) => {
            const summary = data.summary || "요약 결과를 받지 못했습니다.";

            if (outputFormat === "popup") {
                const popup = window.open("", "summaryPopup", "width=400,height=300");
                if (popup) {
                    popup.document.body.innerHTML = `<p style="font-size:${fontSize}px;">${summary}</p>`;
                } else {
                    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
                }
            } else {
                updateResult(summary);
            }

            if (callback) callback(summary);
        })
        .catch((err) => {
            console.error("서버 오류:", err);
            updateResult("서버 요청 중 오류가 발생했습니다.");
        });
}

//이력 날짜순 정렬 저장
function saveHistory(url, text, title, summary) {
    const today = new Date().toISOString();

    chrome.storage.local.get(["summaryHistory"], (result) => {
        const historyArray = result.summaryHistory || [];

        const newEntry = {
            url,
            text,
            title,
            summary,
            date: today,
        };

        historyArray.unshift(newEntry);

        // 최신 날짜 순으로 정렬
        historyArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        chrome.storage.local.set({ summaryHistory: historyArray }, () => {
            console.log("요약 이력 저장 완료");
        });
    });
}
