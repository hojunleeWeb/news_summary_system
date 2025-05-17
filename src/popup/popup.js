document.getElementById("summarizeBtn").addEventListener("click", async () => {
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


    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: extractAndSummarize,
        },
        (injectionResults) => {
            const resultDiv = document.getElementById("result");
            if (chrome.runtime.lastError) {
                resultDiv.textContent = "요약 중 오류가 발생했습니다.";
                console.error(chrome.runtime.lastError.message);
                return;
            }

            const summary = injectionResults[0].result;
            resultDiv.textContent = summary || "본문을 찾을 수 없습니다.";
        }
    );
});

// 웹페이지에서 본문 텍스트를 추출하고 간단히 요약하는 함수
function extractAndSummarize() {
    const allParagraphs = Array.from(document.querySelectorAll("p"));

    // 의미 있는 문단(글자 수 기준으로 필터링)
    const meaningfulParagraphs = allParagraphs.filter((p) => p.innerText.length > 50);

    const text = meaningfulParagraphs.map((p) => p.innerText.trim()).join(" ");
    if (!text) return "의미 있는 본문을 찾지 못했습니다.";

    // 아주 간단한 요약: 앞에서 5문장 추출
    const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 5);
    return sentences.join(" ");
}

function extractNewsBasedOnNaverNews() {
    //네이버 뉴스 페이지 기준 제목 부분(text 부분만)
    const newsTitle = document.querySelector(".media_end_head_title").innerText;

    //네이버 뉴스 페이지 기준 본문 부분(text 부분만)
    const newsArea = document.getElementById("dic_area").innerText;
    newsArea = newsArea.replace("\n", ""); // 줄띄움 제거

    if (!newsArea) return "뉴스 본문을 찾을 수 없습니다.";

    // 아주 간단한 요약: 앞에서 5문장 추출
    const sentences = newsArea.split(/(?<=[.!?])\s+/).slice(0, 5);
    return sentences.join(" ");
}
