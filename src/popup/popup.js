document.addEventListener("DOMContentLoaded", () => {

    // 로그인 상태 확인
    const loginRedirect = document.getElementById('loginRedirect');
    if (loginRedirect) {
        loginRedirect.addEventListener('click', () => {
            window.open('./login/login.html', '_blank');
        });
    }

    // 환경설정 버튼 -> 새 탭
    const settingsBtn = document.getElementById("settingsBtn");
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/settings/settings.html")
            });
        });
    }

    // 이력조회 버튼 -> 새 탭
    const historyBtn = document.getElementById("historyBtn");
    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/history/history.html")
            });
        });
    }

    // 요약하기 버튼
    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
        summarizeBtn.addEventListener("click", async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

                // 현재 탭이 유효한지 확인
                chrome.tabs.sendMessage(tab.id, { action: "getText" }, (response) => {
                    if (chrome.runtime.lastError || !response || !response.text) {
                        console.error("본문 추출 실패", chrome.runtime.lastError);
                        updateResult("본문 추출 중 오류가 발생했습니다.");
                        return;
                    }

                    const url = tab.url;
                    const pageText = response.text;

                    // 사용자 설정 가져오기
                    chrome.storage.local.get(
                        ["summaryLanguage", "summaryFontSize", "summaryOutputFormat"],
                        (settings) => {
                            const language = settings.summaryLanguage || "한국어";
                            const fontSize = settings.summaryFontSize || 5;
                            const outputFormat = settings.summaryOutputFormat || "inline";

                            chrome.storage.local.set({ savedUrl: url, savedText: pageText }, () => {
                                console.log("본문 저장 완료");
                                updateResult(pageText, fontSize);
                            });


                            // 서버에 전송
                            sendToServer(url, pageText, language, fontSize, outputFormat);
                        });
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
function sendToServer(url, text, language, fontSize, outputFormat) {
    fetch("http://localhost:5000/api/summary/url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url, text, language, fontSize })
    })
        .then(response => response.json())
        .then(data => {
            console.log("서버 요약 결과:", data);
            const summary = data.summary || "요약 결과를 받지 못했습니다.";

            // outputFormat에 따라 다르게 출력
            if (outputFormat === "popup") {
                // 팝업창으로 출력
                const popup = window.open("", "summaryPopup", "width=400,height=300");
                if (popup) {
                    popup.document.body.innerHTML = `<p style="font-size:${fontSize}px;">${summary}</p>`;
                } else {
                    alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
                }
            } else {
                // 인라인 출력
                updateResult(summary);
            }
        })
        .catch(err => {
            console.error("서버 오류:", err);
            updateResult("서버 요청 중 오류가 발생했습니다.");
        });
}
