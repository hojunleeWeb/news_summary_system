let resultDiv = document.getElementById("result");

//pc 버전
let fetch_url = "http://192.168.0.67:5000";
//노트북 버전
//let fetch_url = "http://192.168.0.128:5000";

// 로그인 상태 확인
const loginRedirect = document.getElementById("loginRedirect");
if (loginRedirect) {
    loginRedirect.addEventListener("click", () => {
        window.open("./login/login.html", "_blank");
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

    if (tab && tab.url) {
        const currentUrl = tab.url;

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                function: extractNewData,
                args: [currentUrl],
            },
            //함수를 실행한 이후 서버가 전송한 데이터를 가지고 할 로직을 정의 ->
            async (injectionResults) => {
                console.log(injectionResults);
                if (chrome.runtime.lastError) {
                    resultDiv.textContent = "데이터 추출 중 오류가 발생했습니다.";
                    console.error(chrome.runtime.lastError.message);
                    return;
                }
                if (injectionResults && injectionResults.length > 0 && injectionResults[0].result) {
                    const [extractedText, isYoutube] = injectionResults[0].result;
                    // 즉, inejctionResults는 extractNewData()가 반환하는 값을 의미, [0]를 넣는것을 보면 해당 리턴값은 배열인듯?
                    // 유튜브 영상의 경우 영상을 텍스트로 변환하는 후처리를 서버에서 진행하기 때문에 텍스트가 없이 null이 들어온다.

                    // Promise를 사용하여 chrome.tabs.query를 await로 처리
                    const currentTabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (currentTabs && currentTabs.length > 0) {
                        //const currentUrl = currentTabs[0].url;
                        // 기사 안의 전체 텍스트와 url을 인자로 get_summary 함수를 실행 ->
                        // 서버로 전체 기사와 url을 포함해 POST 요청을 보내고 요약본을 받는다
                        if (isYoutube) {
                            //유튜브 영상의 경우
                            //extractedText = null
                            //currentUrl을 가지고 서버단에서 파일을 다운받아 변환하는 로직이 추가되어야한다.
                            const summarized_text = get_summary(extractedText, currentUrl, true);
                        } else {
                            const summarized_text = get_summary(extractedText, currentUrl, false);
                        }
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
    }
});
function extractNewData(url) {
    //해당 함수의 리턴값은 요약을 진행할 전체 텍스트를 의미
    //현재는 네이버뉴스 한정 -> url을 바탕으로 유튜브 사이트인지 네이버 기사 사이트 인지 판별이 필요
    //네이버 뉴스 페이지 기준 제목 부분(text 부분만)

    const pattern = /^https?:\/\/www\.(?:youtube\.com|youtu\.be)/;
    let IsYoutube = fasle;
    if (pattern.test(url)) {
        //유튜브 영상을 제공받은 경우 -> py코드를 통과시켜야한다? ->
        //텍스트를 보내지말고, 파라미터에 따라 서버가 첫번째 인자가 네이버 뉴스 텍스트인지, 아니면 유튜브 영상이라 아무것도 없는지
        //를 인식하게 하자.
        IsYoutube = true;
        return null, true;
    } else {
        //네애버 뉴스를 제공받은 경우
        const titleElement = document.querySelector(".media_end_head_title");
        const newsTitle = titleElement ? titleElement.innerText : null;

        //네이버 뉴스 페이지 기준 본문 부분(text 부분만)
        const newsAreaElement = document.getElementById("dic_area");
        let newsArea = newsAreaElement ? newsAreaElement.innerText : null;
    }

    if (newsArea) {
        newsArea = newsArea.replace(/\n/g, ""); // 모든 줄바꿈 제거 (정규 표현식 사용)
    }

    if (!newsArea) {
        return "뉴스 본문을 찾을 수 없습니다.";
    } else if (newsTitle) {
        return `${newsTitle}\n${newsArea}`, IsYoutube; // 제목과 본문을 함께 반환 (필요에 따라 수정)
    } else {
        return newsArea, IsYoutube; // 제목이 없을 경우 본문만 반환
    }
}

//기사 전체 텍스트와 해당 기사가 게재된 url을 인자로 받아 서버로 POST 요청을 전송
function get_summary(inputText, url, IsYoutube = false) {
    if (IsYoutube) {
        //youbute 영상의 경우 inputText = null -> 데이터 후처리를 서버단에서 처리하기 때문에
        fetch(fetch_url + "/post_summary", {
            // "/post_summary"
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: url, text: inputText, IsYoutube: true }),
        })
            .then((response) => response.json())
            .then((data) => {
                resultDiv.textContent = data.response || data.error || "응답 없음";
            })
            .catch((error) => {
                resultDiv.textContent = "통신 오류: " + error;
            });
    } else {
        if (inputText) {
            fetch(fetch_url + "/post_summary", {
                // "/post_summary"
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url, text: inputText, IsYoutube: false }),
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
}
