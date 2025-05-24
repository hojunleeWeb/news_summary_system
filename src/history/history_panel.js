// src/history/history_panel.js

document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");

    // 요약 이력을 로드하고 렌더링하는 함수
    const loadAndRenderHistory = () => {
        chrome.storage.local.get(["summaryHistory"], (result) => {
            const historyArray = result.summaryHistory || [];

            if (historyArray.length === 0) {
                historyList.innerHTML = '<p class="no-history">저장된 요약 이력이 없습니다.</p>';
                return;
            }

            historyList.innerHTML = ""; // 기존 내용 초기화
            historyArray.forEach((entry) => {
                const listItem = document.createElement("li");
                listItem.classList.add("history-item");

                const itemTitle = document.createElement("h3");
                itemTitle.textContent = entry.title || entry.url || "제목 없음";
                listItem.appendChild(itemTitle);

                const itemSummary = document.createElement("p");
                itemSummary.classList.add("summary-content");
                itemSummary.textContent = entry.summary;
                listItem.appendChild(itemSummary);

                const itemDate = document.createElement("p");
                itemDate.classList.add("history-date");
                itemDate.textContent = new Date(entry.date).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                listItem.appendChild(itemDate);

                // 요약 내용 클릭 시 확장/축소 토글
                itemSummary.addEventListener("click", () => {
                    itemSummary.classList.toggle("expanded");
                });

                historyList.appendChild(listItem);
            });
        });
    };

    // 사이드 패널 로드 시 이력 렌더링
    loadAndRenderHistory();

    // 새로운 요약이 저장될 때마다 사이드 패널을 업데이트
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.summaryHistory) {
            console.log("요약 이력 변경 감지, 사이드 패널 업데이트");
            loadAndRenderHistory();
        }
    });
});