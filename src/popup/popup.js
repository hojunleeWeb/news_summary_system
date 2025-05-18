document.addEventListener("DOMContentLoaded", () => {
    
    // 로그인 상태 확인
     const loginRedirect = document.getElementById('loginRedirect');
    if (loginRedirect) {
        loginRedirect.addEventListener('click', () => {
            window.open('./login/login.html', '_blank'); // 새 탭에서 열기
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

                    // url과 본문 텍스트를 저장
                    chrome.storage.local.set({ savedUrl: url, savedText: pageText }, () => {
                        console.log("본문 저장 완료");
                        updateResult(pageText);  // 확인용 출력
                    });

                    //서버에 url과 본문 텍스트 전송
                    sendToServer(url, pageText);
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
function sendToServer(url, text) {
    fetch("http://localhost:5000/api/summary/url", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ url, text })
    })
        .then(response => response.json())
        .then(data => {
            console.log("서버 요약 결과:", data);
            updateResult(data.summary || "요약 결과를 받지 못했습니다.");
        })
        .catch(err => {
            console.error("서버 오류:", err);
            updateResult("서버 요청 중 오류가 발생했습니다.");
        });
}
