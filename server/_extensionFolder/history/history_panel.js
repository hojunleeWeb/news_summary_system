// src/history/history_panel.js

document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");
    const dateFilterContainer = document.getElementById("dateFilterContainer");

    let currentSelectedDate = null; // 현재 선택된 날짜 (초기에는 모든 날짜 표시)

    // 요약 이력 (및 이미지 캡션)을 로드하고 날짜별로 그룹화하는 함수
    const loadAndGroupHistory = (callback) => {
        chrome.storage.local.get(["summaryHistory"], (result) => {
            const historyArray = result.summaryHistory || [];
            const groupedHistory = {}; // 날짜별로 그룹화할 객체

            // 최신 날짜순으로 정렬
            historyArray.sort((a, b) => new Date(b.date) - new Date(a.date));

            historyArray.forEach((entry) => {
                const date = new Date(entry.date).toISOString().split("T")[0]; // YYYY-MM-DD 형식의 날짜 문자열
                if (!groupedHistory[date]) {
                    groupedHistory[date] = [];
                }
                groupedHistory[date].push(entry);
            });
            callback(groupedHistory);
        });
    };

    // 날짜 목록을 렌더링하는 함수 (변경 없음)
    const renderDateFilters = (groupedHistory) => {
        dateFilterContainer.innerHTML = "";

        const dates = Object.keys(groupedHistory).sort((a, b) => new Date(b) - new Date(a));

        if (dates.length === 0) {
            dateFilterContainer.innerHTML = "<p>저장된 이력이 없습니다.</p>";
            return;
        }

        dates.forEach((date) => {
            const dateButton = document.createElement("button");
            dateButton.classList.add("date-filter-button");
            if (date === currentSelectedDate) {
                dateButton.classList.add("active");
            }
            dateButton.textContent = new Date(date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            dateButton.addEventListener("click", () => {
                currentSelectedDate = date;
                renderHistory(groupedHistory[date]);
                renderDateFilters(groupedHistory);
            });
            dateFilterContainer.appendChild(dateButton);
        });

        const allButton = document.createElement("button");
        allButton.textContent = "전체 보기";
        allButton.classList.add("date-filter-button");
        if (!currentSelectedDate) {
            allButton.classList.add("active");
        }
        allButton.addEventListener("click", () => {
            currentSelectedDate = null;
            renderHistory(Object.values(groupedHistory).flat());
            renderDateFilters(groupedHistory);
        });
        dateFilterContainer.prepend(allButton);
    };

    // 실제 이력 항목을 렌더링하는 함수
    const renderHistory = (historyToRender) => {
        if (!historyToRender || historyToRender.length === 0) {
            historyList.innerHTML = '<p class="no-history">선택된 날짜에 저장된 요약 이력이 없습니다.</p>';
            return;
        }

        historyList.innerHTML = ""; // 기존 내용 초기화

        // 요약본을 얻은 순서대로 보여주기 (저장된 날짜의 오름차순으로 정렬)
        historyToRender.sort((a, b) => new Date(a.date) - new Date(b.date));

        historyToRender.forEach((entry) => {
            const listItem = document.createElement("li");
            listItem.classList.add("history-item");

            const itemHeader = document.createElement("div");
            itemHeader.classList.add("history-item-header");

            const itemTitle = document.createElement("h3");
            // 이미지 캡션 항목인 경우 제목을 "이미지 캡션" 등으로 설정할 수 있습니다.
            itemTitle.textContent = entry.title || entry.url || "제목 없음";
            itemHeader.appendChild(itemTitle);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "삭제";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", () => {
                chrome.storage.local.get(["summaryHistory"], (result) => {
                    let fullHistory = result.summaryHistory || [];
                    // 고유 ID가 없으므로 date, summary, title, url, img_captions를 모두 비교하여 고유성 확보
                    const updatedHistory = fullHistory.filter(
                        (item) =>
                            !(
                                item.date === entry.date &&
                                item.summary === entry.summary &&
                                item.title === entry.title &&
                                item.url === entry.url &&
                                JSON.stringify(item.img_captions) === JSON.stringify(entry.img_captions)
                            )
                    );
                    chrome.storage.local.set({ summaryHistory: updatedHistory }, () => {
                        console.log("이력 삭제됨:", entry.title || entry.url);
                        loadAndGroupHistory((grouped) => {
                            renderDateFilters(grouped);
                            if (currentSelectedDate) {
                                renderHistory(grouped[currentSelectedDate] || []);
                            } else {
                                renderHistory(Object.values(grouped).flat());
                            }
                        });
                    });
                });
            });
            itemHeader.appendChild(deleteButton);
            listItem.appendChild(itemHeader);

            // 요약 내용 (summary) 렌더링
            if (entry.summary) {
                const itemSummary = document.createElement("p");
                itemSummary.classList.add("summary-content");
                itemSummary.textContent = entry.summary;
                itemSummary.addEventListener("click", () => {
                    itemSummary.classList.toggle("expanded");
                });
                listItem.appendChild(itemSummary);
            }

            // 이미지 캡션 (img_captions) 렌더링
            if (entry.img_captions && entry.img_captions.length > 0) {
                const captionsContainer = document.createElement("div");
                captionsContainer.classList.add("history-image-captions-container"); // history 패널 내 스타일링을 위한 클래스

                entry.img_captions.forEach(([img_src, caption_text], imgIndex) => {
                    const captionItem = document.createElement("div");
                    captionItem.classList.add("history-image-caption-item");

                    const imgElement = document.createElement("img");
                    imgElement.src = img_src;
                    imgElement.alt = `이미지 ${imgIndex + 1}`;
                    imgElement.classList.add("history-captioned-image");
                    captionItem.appendChild(imgElement);

                    const captionTextElement = document.createElement("p");
                    captionTextElement.textContent = caption_text;
                    captionTextElement.classList.add("history-caption-text");
                    captionItem.appendChild(captionTextElement);

                    captionsContainer.appendChild(captionItem);
                });
                listItem.appendChild(captionsContainer); // 이미지 캡션 컨테이너를 리스트 아이템에 추가
            }

            const itemDate = document.createElement("p");
            itemDate.classList.add("history-date");
            itemDate.textContent = new Date(entry.date).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
            listItem.appendChild(itemDate);

            historyList.appendChild(listItem);
        });
    };

    // 초기 로딩 시: 날짜별로 그룹화하고 날짜 필터를 렌더링한 후, 전체 이력을 보여줍니다.
    loadAndGroupHistory((grouped) => {
        renderDateFilters(grouped);
        renderHistory(Object.values(grouped).flat());
    });

    // 새로운 요약이 저장될 때마다 사이드 패널을 업데이트
    chrome.storage.onChanged.addListener((changes, namespace) => {
        // summaryHistory 변경만 감지
        if (namespace === "local" && changes.summaryHistory) {
            console.log("요약/이미지 이력 변경 감지, 사이드 패널 업데이트");
            loadAndGroupHistory((grouped) => {
                renderDateFilters(grouped);
                if (currentSelectedDate && grouped[currentSelectedDate]) {
                    renderHistory(grouped[currentSelectedDate]);
                } else {
                    renderHistory(Object.values(grouped).flat());
                }
            });
        }
    });
});
