/**
 * 환경설정 폼 관련 이벤트 핸들러를 설정합니다.
 * @param {HTMLElement} settingsContainer - 환경설정 컨테이너 DOM 요소
 * @param {HTMLElement} loginContainer - 로그인 폼 컨테이너 DOM 요소
 * @param {function} updateResult - 결과 메시지를 표시하는 콜백 함수
 * @param {HTMLElement} summarizeBtn - 요약하기 버튼 DOM 요소 (새롭게 추가)
 */
export function setupSettings(settingsContainer, loginContainer, updateResult, summarizeBtn) {
    // 모든 설정 관련 요소는 setupSettings 함수 내부에서 캐싱
    const settingsBtn = document.getElementById("settingsBtn");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const summaryLanguageSelect = document.getElementById("summaryLanguage"); // 가정: HTML에 추가된 선택 요소
    const summaryFontSizeInput = document.getElementById("summaryFontSize");
    const summaryOutputFormatSelect = document.getElementById("summaryOutputFormat");
    const popupXGroup = document.getElementById("popupXGroup");
    const popupYGroup = document.getElementById("popupYGroup");
    const popupXInput = document.getElementById("popupX");
    const popupYInput = document.getElementById("popupY");

    // 팝업 x, y 위치 입력 필드의 초기값 설정
    const togglePopupLocationFields = (outputFormat) => {
        if (outputFormat === "popup") {
            if (popupXGroup) popupXGroup.style.display = "block";
            if (popupYGroup) popupYGroup.style.display = "block";
        } else {
            if (popupXGroup) popupXGroup.style.display = "none";
            if (popupYGroup) popupYGroup.style.display = "none";
        }
    };

    // 환경설정 버튼 클릭 이벤트
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            if (settingsContainer.style.display === "none" || settingsContainer.style.display === "") {
                settingsContainer.style.display = "block";
                // 로그인 컨테이너 숨기기 (만약 팝업에 있다면)
                if (loginContainer) loginContainer.style.display = "none";
                if (summarizeBtn) summarizeBtn.style.display = "none"; // 요약 버튼 숨기기
                updateResult("", false, false); // 설정창 열 때 결과 메시지 초기화 (타이머 중지)
                // 설정창 열 때 현재 outputFormat에 따라 팝업 위치 필드 가시성 설정
                togglePopupLocationFields(summaryOutputFormatSelect.value);
            } else {
                // 이 else 블록은 현재 사용되지 않습니다.
                // 보통 settingsBtn을 다시 누르면 닫히는 로직이 여기에 있지만,
                // 현재 코드에서는 saveSettingsBtn이나 closeSettingsBtn으로만 닫힙니다.
                // 따라서 이 블록은 사실상 실행되지 않습니다.
                settingsContainer.style.display = "none";
                if (summarizeBtn) summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기
                updateResult("", false, false); // 설정창 닫을 때 결과 메시지 초기화 (타이머 중지)
            }
        });
    }

    //요약문 출력 방식 변경 시 팝업 위치
    if (summaryOutputFormatSelect) {
        summaryOutputFormatSelect.addEventListener("change", (event) => {
            togglePopupLocationFields(event.target.value);
        });
    }

    // 환경설정 저장 버튼
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            const fontSize = summaryFontSizeInput.value;
            const outputFormat = summaryOutputFormatSelect.value;
            //팝업 위치 입력값 가져오기
            const popupX = parseInt(popupXInput.value, 10) || 0;
            const popupY = parseInt(popupYInput.value, 10) || 0;
            chrome.storage.local.set(
                {
                    summaryFontSize: fontSize,
                    summaryOutputFormat: outputFormat,
                    popupX: popupX,
                    popupY: popupY,
                },
                () => {
                    console.log("환경설정 저장 완료:", { fontSize, outputFormat, popupX, popupY });
                    settingsContainer.style.display = "none"; // 설정 저장 후 창 닫기
                    if (summarizeBtn) summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기 (수정된 부분)
                    // updateResult 함수 호출 방식 변경
                    updateResult("설정이 저장되었습니다.", false, true, false, 14, "", "success"); // 메시지 타입 추가, 타이머 중지
                }
            );
        });
    }

    // 환경설정 닫기 버튼
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener("click", () => {
            settingsContainer.style.display = "none";
            if (summarizeBtn) summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기 (수정된 부분)
            updateResult("", false, false); // 결과 메시지 초기화 및 타이머 중지
        });
    }

    // 초기 설정 로드
    chrome.storage.local.get(["summaryLanguage", "summaryFontSize", "summaryOutputFormat", "popupX", "popupY"], (items) => {
        if (summaryLanguageSelect && items.summaryLanguage) {
            summaryLanguageSelect.value = items.summaryLanguage;
        }
        if (summaryFontSizeInput && items.summaryFontSize) {
            summaryFontSizeInput.value = items.summaryFontSize;
        }
        if (summaryOutputFormatSelect && items.summaryOutputFormat) {
            summaryOutputFormatSelect.value = items.summaryOutputFormat;
        }
        if (popupXInput && items.popupX !== undefined) {
            popupXInput.value = items.popupX;
        } else if (popupXInput) {
            popupXInput.value = Math.round(window.screen.availWidth / 2 - 200);
        }
        if (popupYInput && items.popupY !== undefined) {
            popupYInput.value = items.popupY;
        } else if (popupYInput) {
            popupYInput.value = Math.round(window.screen.availHeight / 2 - 300);
        }
        togglePopupLocationFields(summaryOutputFormatSelect.value);
    });
}