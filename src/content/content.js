//페이지 내 본문 텍스트 추출 
function extractPageText() {
    const selectors = ["article", "main", "div", "section"];
    let text = "";  //본문 텍스트 저장할 변수

    //텍스트 길이가 500자 이상이면 본문으로 간주하고 저장
    for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && el.innerText.length > 500) {
            text = el.innerText.trim();
            break;
        }
    }
    //본문이 없으면 body에서 텍스트 추출
    if (!text) {
        text = document.body.innerText.trim();
    }

    //본문 텍스트가 200자 이상이면 본문으로 간주하고 저장
    return text.length > 200 ? text : "본문을 찾을 수 없습니다.";
}

//크롬 확장 프로그램으로 전달
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getText") {
        const text = extractPageText();
        sendResponse({ text });
    }
});
