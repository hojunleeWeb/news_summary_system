document.addEventListener("DOMContentLoaded", () => {
    console.log("history.js 로드됨");

    const historyBtn = document.getElementById("historyBtn");

    // 이력조회 버튼 -> 새 탭
    if (historyBtn) {
        historyBtn.addEventListener("click", () => {
            chrome.tabs.create({
                url: chrome.runtime.getURL("src/history/history.html"),
            });
        });
    }
});
