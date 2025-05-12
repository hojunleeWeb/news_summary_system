document.getElementById("summarizeBtn").addEventListener("click", async () => {
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        function: extractAndSummarize,
      },
      (injectionResults) => {
        const resultDiv = document.getElementById("result");
        if (chrome.runtime.lastError) {
          resultDiv.textContent = "요약 중 오류가 발생했습니다.";
          console.error(chrome.runtime.lastError.message);
          return;
        }
  
        const summary = injectionResults[0].result;
        resultDiv.textContent = summary || "본문을 찾을 수 없습니다.";
      }
    );
  });
  
  // 웹페이지에서 본문 텍스트를 추출하고 간단히 요약하는 함수
  function extractAndSummarize() {
    const allParagraphs = Array.from(document.querySelectorAll("p"));
  
    // 의미 있는 문단(글자 수 기준으로 필터링)
    const meaningfulParagraphs = allParagraphs.filter(p => p.innerText.length > 50);
  
    const text = meaningfulParagraphs.map(p => p.innerText.trim()).join(" ");
    if (!text) return "의미 있는 본문을 찾지 못했습니다.";
  
    // 아주 간단한 요약: 앞에서 5문장 추출
    const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 5);
    return sentences.join(" ");

    
  }
  