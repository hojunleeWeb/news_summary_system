document.addEventListener("DOMContentLoaded", () => {
    console.log("history.js 로드됨");

    const list = document.getElementById("historyList");
    const loadingRow = `<tr><td colspan="4">이력 불러오는 중...</td></tr>`;
    list.innerHTML = loadingRow;

    // Chrome Storage에서 세션 ID 가져오기
    chrome.storage.local.get(["sessionId"], async (result) => {
        const sessionId = result.sessionId;

        if (sessionId) {
            await fetchHistory(sessionId);
        } else {
            list.innerHTML = `<tr><td colspan="4">로그인 정보가 없습니다.</td></tr>`;
            console.warn("세션 ID가 없습니다.");
        }
    });

    async function fetchHistory(sessionId) {
        try {
            const response = await fetch(fetch_url + "/get_record", {
                // 서버 주소 확인
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user_id: sessionId }),
            });

            if (!response.ok) {
                list.innerHTML = `<tr><td colspan="4">이력 불러오기 실패: ${response.status}</td></tr>`;
                console.error("이력 불러오기 실패:", response.status);
                return;
            }

            const data = await response.json();
            displayHistory(data);
        } catch (error) {
            list.innerHTML = `<tr><td colspan="4">이력 불러오는 중 오류 발생: ${error.message}</td></tr>`;
            console.error("이력 불러오는 중 오류 발생:", error);
        }
    }

    function displayHistory(historyData) {
        list.innerHTML = ""; // 기존 내용 비우기

        if (historyData.length === 0) {
            list.innerHTML = `<tr><td colspan="4">저장된 이력이 없습니다.</td></tr>`;
            return;
        }

        const sortedHistory = historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        sortedHistory.forEach((item, index) => {
            const row = document.createElement("tr");
            const date = new Date(item.timestamp).toLocaleDateString();
            const title = item.url; // title이 서버에서 제공되지 않으므로 url을 임시로 사용

            row.innerHTML = `
                <td>${title.slice(0, 50)}...</td>
                <td><a href="${item.url}" target="_blank">${item.url}</a></td>
                <td>${date}</td>
                <td>
                    <div id="summary-${index}" class="summary-preview">${item.response.slice(0, 30)}...</div>
                    <button class="toggle-btn" data-index="${index}">▼</button>
                </td>
            `;
            list.appendChild(row);
        });

        // 토글 기능 추가 (이미 존재하므로 다시 바인딩)
        document.querySelectorAll(".toggle-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const idx = button.getAttribute("data-index");
                const summaryDiv = document.getElementById(`summary-${idx}`);
                const fullText = sortedHistory[idx].response;

                if (summaryDiv.classList.contains("expanded")) {
                    summaryDiv.textContent = fullText.slice(0, 30) + "...";
                    summaryDiv.classList.remove("expanded");
                    button.textContent = "▼";
                } else {
                    summaryDiv.textContent = fullText;
                    summaryDiv.classList.add("expanded");
                    button.textContent = "▲";
                }
            });
        });
    }
});
