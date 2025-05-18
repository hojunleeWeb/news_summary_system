document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.querySelector("select"); // 기존 select가 2개라면 바꿔야 함
  const fontSizeSlider = document.querySelector("input[type='range']");
  const outputFormatSelect = document.getElementById("summaryOutputFormat");

  // 저장된 설정 불러오기
  chrome.storage.local.get(
    ["summaryLanguage", "summaryFontSize", "summaryOutputFormat"],
    (data) => {
      if (data.summaryLanguage) languageSelect.value = data.summaryLanguage;
      if (data.summaryFontSize !== undefined) fontSizeSlider.value = data.summaryFontSize;
      if (data.summaryOutputFormat) outputFormatSelect.value = data.summaryOutputFormat;
    }
  );

  // 언어 변경 시 저장
  languageSelect.addEventListener("change", () => {
    chrome.storage.local.set({ summaryLanguage: languageSelect.value });
  });

  // 글자 크기 변경 시 저장
  fontSizeSlider.addEventListener("input", () => {
    chrome.storage.local.set({ summaryFontSize: fontSizeSlider.value });
  });

  // 요약문 출력형식 변경 시 저장
  outputFormatSelect.addEventListener("change", () => {
    chrome.storage.local.set({ summaryOutputFormat: outputFormatSelect.value });
  });
});
