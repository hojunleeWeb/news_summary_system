chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "contextSummarize",
        title: "이 페이지 요약하기",
        contexts: ["page"],
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "contextSummarize") {
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: extractAndSummarize,
            },
            (results) => {
                const summary = results[0].result || "요약 실패 또는 본문 없음";
                const url = `summary/summary.html?text=${encodeURIComponent(summary)}`;
                chrome.windows.create({
                    url: url,
                    type: "popup",
                    width: 400,
                    height: 300,
                });
            }
        );
    }
});

function extractAndSummarize() {
    const allParagraphs = Array.from(document.querySelectorAll("p"));
    const meaningfulParagraphs = allParagraphs.filter((p) => p.innerText.length > 50);
    const text = meaningfulParagraphs.map((p) => p.innerText.trim()).join(" ");
    if (!text) return "의미 있는 본문을 찾지 못했습니다.";

    const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 5);
    return sentences.join(" ");
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "contextSummarize") {
        console.log("[ONECLICK] 우클릭 요약 기능 실행됨");

        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                func: extractAndSummarize,
            },
            (results) => {
                const summary = results[0]?.result || "요약 실패 또는 본문 없음";

                console.log("[ONECLICK] 요약 결과:", summary);

                const url = `summary/summary.html?text=${encodeURIComponent(summary)}`;
                chrome.windows.create({
                    url: url,
                    type: "popup",
                    width: 400,
                    height: 300,
                });
            }
        );
    }
});
