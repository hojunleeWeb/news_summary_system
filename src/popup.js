chrome.storage.local.get("selectedText", (data) => {
    document.getElementById("output").textContent = data.selectedText || "(No text received yet)";
});
