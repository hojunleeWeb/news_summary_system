
let timerInterval;
let startTime;

/**
 * HTML 요소에 메시지를 표시하고 선택적으로 타이머를 시작/중지합니다.
 * @param {string} message - 표시할 텍스트 메시지입니다.
 * @param {boolean} [startTimer=false] - 타이머를 시작할지 여부입니다.
 * @param {boolean} [stopTimer=false] - 타이머를 중지할지 여부입니다.
 */
export function updateResult(message, startTimer = false, stopTimer = false) {
    const resultDiv = document.getElementById("result");
    if (!resultDiv) return;

    if (stopTimer) {
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = null;
        resultDiv.textContent = message; // 최종 메시지 표시
        return;
    }

    if (startTimer) {
        clearInterval(timerInterval); // 기존 타이머가 있다면 중지
        startTime = Date.now();
        resultDiv.textContent = `${message} (0초)`; // 초기 메시지 설정

        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            resultDiv.textContent = `${message} (${elapsedTime}초)`;
        }, 1000); // 1초마다 업데이트
    } else {
        // 타이머 시작/중지 요청이 없으면 단순히 메시지만 업데이트
        resultDiv.textContent = message;
    }
}
