chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "send-selection",
        title: "Send selection to popup",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "send-selection") {
        // 드래그한 텍스트를 저장
        chrome.storage.local.set({ selectedText: info.selectionText });
    }
});
