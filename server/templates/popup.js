let resultDiv = document.getElementById("result");

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
        async (injectionResults) => {
            console.log(injectionResults);
            if (chrome.runtime.lastError) {
                resultDiv.textContent = "데이터 추출 중 오류가 발생했습니다.";
                console.error(chrome.runtime.lastError.message);
                return;
            }

            if (injectionResults && injectionResults.length > 0 && injectionResults[0].result) {
                const extractedText = injectionResults[0].result;
                // Promise를 사용하여 chrome.tabs.query를 await로 처리
                const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                if (currentTabs && currentTabs.length > 0) {
                    const currentUrl = currentTabs[0].url;
                    console.log("추출된 텍스트:", extractedText);
                    // 기사 안의 전체 텍스트와 url을 인자로 get_summary 함수를 실행 ->
                    // 서버로 전체 기사와 url을 포함해 POST 요청을 보내고 요약본을 받는다
                    const summarized_text = get_summary(extractedText, currentUrl);
                    console.log(summarized_text);
                    resultDiv.textContent = summarized_text;
                } else {
                    console.log("현재 탭의 URL을 가져올 수 없습니다.");
                    //get_summary(extractedText, null); // URL을 null로 전달하거나 다른 처리
                }
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

//기사 전체 텍스트와 해당 기사가 게재된 url을 인자로 받아 서버로 POST 요청을 전송
function get_summary(inputText, url) {
    if (inputText) {
        fetch("http://192.168.0.128:5000/post_summary", {
            // "/predict" -> "/post_summary" 로 수정
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url, text: inputText }),
        })
            .then((response) => response.json())
            .then((data) => {
                resultDiv.textContent = data.response || data.error || "응답 없음";
            })
            .catch((error) => {
                resultDiv.textContent = "통신 오류: " + error;
            });
    } else {
        resultDiv.textContent = "입력 값이 없습니다.";
    }
}
