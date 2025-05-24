// src/utils/resultDisplay.js

/**
 * HTML 요소에 메시지를 표시합니다.
 * @param {string} message - 표시할 텍스트 메시지입니다.
 */
export function updateResult(message) {
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
        resultDiv.textContent = message;
    }
}
