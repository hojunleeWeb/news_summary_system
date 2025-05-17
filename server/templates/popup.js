document.getElementById("summarizeBtn").addEventListener("click", async () => {
    // // 환경설정 버튼 -> 새 탭
    // const settingsBtn = document.getElementById("settingsBtn");
    // if (settingsBtn) {
    //     settingsBtn.addEventListener("click", () => {
    //         chrome.tabs.create({
    //             url: chrome.runtime.getURL("src/settings/settings.html"),
    //         });
    //     });
    // }

    // // 이력조회 버튼 -> 새 탭
    // const historyBtn = document.getElementById("historyBtn");
    // if (historyBtn) {
    //     historyBtn.addEventListener("click", () => {
    //         chrome.tabs.create({
    //             url: chrome.runtime.getURL("src/history/history.html"),
    //         });
    //     });
    // }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            function: extractNewData,
        },
        (injectionResults) => {
            console.log(injectionResults);
            const resultDiv = document.getElementById("result");
            if (chrome.runtime.lastError) {
                resultDiv.textContent = "데이터 추출 중 오류가 발생했습니다.";
                console.error(chrome.runtime.lastError.message);
                return;
            }

            if (injectionResults && injectionResults.length > 0 && injectionResults[0].result) {
                const extractedText = injectionResults[0].result;
                console.log("추출된 텍스트:", extractedText);
                // 추출된 텍스트를 사용하여 서버에 요약 요청 등을 보낼 수 있습니다.
                resultDiv.textContent = "데이터 추출 완료. 콘솔에서 확인하세요.";
                // 추가적으로 요약 기능을 여기에 통합하거나, 추출된 텍스트를 팝업에 표시할 수 있습니다.
            } else {
                resultDiv.textContent = "해당 페이지에서 데이터를 찾을 수 없습니다.";
            }
        }
    );
});

function extractNewData() {
    //현재는 네이버뉴스 한정
    //네이버 뉴스 페이지 기준 제목 부분(text 부분만)
    const titleElement = document.querySelector(".media_end_head_title");
    const newsTitle = titleElement ? titleElement.innerText : null;

    //네이버 뉴스 페이지 기준 본문 부분(text 부분만)
    const newsAreaElement = document.getElementById("dic_area");
    let newsArea = newsAreaElement ? newsAreaElement.innerText : null;

    if (newsArea) {
        newsArea = newsArea.replace(/\n/g, ""); // 모든 줄바꿈 제거 (정규 표현식 사용)
    }

    if (!newsArea) {
        return "뉴스 본문을 찾을 수 없습니다.";
    } else if (newsTitle) {
        return `${newsTitle}\n${newsArea}`; // 제목과 본문을 함께 반환 (필요에 따라 수정)
    } else {
        return newsArea; // 제목이 없을 경우 본문만 반환
    }
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
