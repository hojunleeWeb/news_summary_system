const params = new URLSearchParams(location.search);
const summary = params.get("text");

document.getElementById("summaryText").textContent = summary || "요약할 내용이 없습니다.";
