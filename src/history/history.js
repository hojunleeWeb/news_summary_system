document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 history.js loaded");

  //더미 데이터
  const testHistory = [
    {
      title: "SKT, '찾아가는 유심 교체·재설정 서비스' 19일 시작",
      url: "https://n.news.naver.com/article/052/0002194215?sid=101",
      date: "2025-05-17",
      summary: "SKT는 새로운 고객 편의 향상을 위해 유심 교체와 재설정 서비스를 19일부터 시작한다. 이는..."
    },
    {
      title: "윤석열 탈당 선언...",
      url: "https://n.news.naver.com/article/052/0002194324?cds=news_media_pc&type=editn",
      date: "2025-05-16",
      summary: "윤석열 대통령이 전격 탈당을 선언하면서 정치권에 큰 파장이 예상된다. 탈당 배경에는..."
    }
  ];

  const history = testHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = document.getElementById("historyList");

  list.innerHTML = ""; // 초기화
  if (history.length === 0) {
    list.innerHTML = `<tr><td colspan="4">저장된 이력이 없습니다.</td></tr>`;
    return;
  }

  history.forEach((item, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.title}</td>
      <td><a href="${item.url}" target="_blank">${item.url}</a></td>
      <td>${item.date}</td>
      <td>
        <div id="summary-${index}" class="summary-preview">${item.summary.slice(0, 30)}...</div>
        <button class="toggle-btn" data-index="${index}">▼</button>
      </td>
    `;
    list.appendChild(row);
  });

  // 토글 기능 추가
  document.querySelectorAll(".toggle-btn").forEach(button => {
    button.addEventListener("click", () => {
      const idx = button.getAttribute("data-index");
      const summaryDiv = document.getElementById(`summary-${idx}`);
      const fullText = history[idx].summary;

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

});
