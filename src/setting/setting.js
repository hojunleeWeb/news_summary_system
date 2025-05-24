// popup/setting.js

/**
 * 환경설정 폼 관련 이벤트 핸들러를 설정합니다.
 * @param {HTMLElement} settingsContainer - 환경설정 컨테이너 DOM 요소
 * @param {HTMLElement} loginContainer - 로그인 폼 컨테이너 DOM 요소
 * @param {function} updateResult - 결과 메시지를 표시하는 콜백 함수
 */
export function setupSettings(settingsContainer, loginContainer, updateResult) {
    // 모든 설정 관련 요소는 setupSettings 함수 내부에서 캐싱
    const settingsBtn = document.getElementById("settingsBtn");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    //const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const summaryFontSizeInput = document.getElementById("summaryFontSize");
    const summaryOutputFormatSelect = document.getElementById("summaryOutputFormat");

    // 환경설정 버튼 클릭 이벤트
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            if (settingsContainer.style.display === "none" || settingsContainer.style.display === "") {
                settingsContainer.style.display = "block";
                // 로그인 컨테이너 숨기기 (만약 팝업에 있다면)
                loginContainer.style.display = "none";
                summarizeBtn.style.display = "none"; // 요약 버튼 숨기기
                updateResult(""); // 설정창 열 때 결과 메시지 초기화
            } else {
                settingsContainer.style.display = "none";
                summarizeBtn.style.display = "block"; // 설정창 닫을 때 요약 버튼 보이기
            }
        });
    }

    // 환경설정 저장 버튼
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            const fontSize = summaryFontSizeInput.value;
            const outputFormat = summaryOutputFormatSelect.value;

            chrome.storage.local.set(
                {
                    summaryFontSize: fontSize,
                    summaryOutputFormat: outputFormat,
                },
                () => {
                    console.log("환경설정 저장 완료:", { fontSize, outputFormat });
                    settingsContainer.style.display = "none"; // 설정 저장 후 창 닫기
                    updateResult("설정이 저장되었습니다.", resultDiv); // resultDiv를 인자로 전달
                    setTimeout(() => {
                        resultDiv.textContent = "";
                    }, 2000); // 2초 후 메시지 사라짐
                }
            );
        });
    }

    // 환경설정 닫기 버튼
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", () => {
            settingsContainer.style.display = "none";
            updateResult(""); // updateResult 사용
        });
    }

    // 초기 설정 로드
    chrome.storage.local.get(["summaryLanguage", "summaryFontSize", "summaryOutputFormat"], (items) => {
        if (summaryLanguageSelect && items.summaryLanguage) {
            summaryLanguageSelect.value = items.summaryLanguage;
        }
        if (summaryFontSizeInput && items.summaryFontSize) {
            summaryFontSizeInput.value = items.summaryFontSize;
        }
        if (summaryOutputFormatSelect && items.summaryOutputFormat) {
            summaryOutputFormatSelect.value = items.summaryOutputFormat;
        }
    });
}
