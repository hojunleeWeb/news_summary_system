//이력 날짜순 정렬 저장
//1. 요청을 보내면 자동으로 로컬상에서 보여지게 할 것인가 -> 이걸로 해야할듯 하다.
//2. 이력 조회 버튼을 누르면 서버에서 이력을 가져와서 보여줄 것인가. -> 이게 나을 것 같다. -> 비로그인시 문제가 있네;;
function renderHistory(url, text, title, summary) {
    const today = new Date().toISOString();

    chrome.storage.local.get(["summaryHistory"], (result) => {
        const historyArray = result.summaryHistory || [];

        const newEntry = {
            url,
            text,
            title,
            summary,
            date: today,
        };

        historyArray.unshift(newEntry);

        // 최신 날짜 순으로 정렬
        historyArray.sort((a, b) => new Date(b.date) - new Date(a.date));

        chrome.storage.local.set({ summaryHistory: historyArray }, () => {
            console.log("요약 이력 저장 완료");
        });
    });
}
