// src/utils/resultDisplay.js

let timerInterval;
let startTime;

/**
 * HTML 요소에 메시지, 이미지 캡션들을 표시하고 선택적으로 타이머를 시작/중지합니다.
 * @param {string} message - 표시할 텍스트 메시지입니다.
 * @param {Array<Array<string>>} [img_captions=null] - [[이미지_src, 이미지_캡셔닝_텍스트], ...] 형태의 배열입니다.
 * @param {boolean} [startTimer=false] - 타이머를 시작할지 여부입니다.
 * @param {boolean} [stopTimer=false] - 타이머를 중지할지 여부입니다.
 */
export function updateResult(message, img_captions = null, startTimer = false, stopTimer = false, fontSize = "16px") {
    console.log("updateResult 호출됨:", {
        message,
        img_captions,
        startTimer,
        stopTimer,
        fontSize,
    });
    const resultDiv = document.getElementById("result");
    if (!resultDiv) return;

    // 기존 내용 초기화
    resultDiv.innerHTML = "";

    // img_captions 데이터가 있을 경우 표시
    if (img_captions) {
        console.log("이미지 캡셔닝 ui 반영:", img_captions);
        let captionsContainer = document.createElement("div");
        captionsContainer.classList.add("image-captions-container"); // 스타일링을 위한 클래스 추가

        img_captions.forEach(([img_src, caption_text], index) => {
            console.log(`이미지 ${index + 1}: ${img_src}, 캡션: ${caption_text}`);
            let captionItem = document.createElement("div");
            captionItem.classList.add("image-caption-item"); // 각 이미지-캡션 쌍을 위한 클래스

            let imgElement = document.createElement("img");
            imgElement.src = img_src;
            imgElement.alt = `이미지 ${index + 1}`; // 접근성을 위한 alt 텍스트
            imgElement.classList.add("captioned-image"); // 이미지 스타일링을 위한 클래스
            captionItem.appendChild(imgElement);

            let captionTextElement = document.createElement("em");
            captionTextElement.classList.add("caption-text"); // 캡션 텍스트 스타일링을 위한 클래스
            console.log("updateResult : ", caption_text);
            captionTextElement.innerText = caption_text;
            captionItem.appendChild(captionTextElement);

            captionsContainer.appendChild(captionItem);
        });
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = null;
        resultDiv.appendChild(captionsContainer);
    }
    if (startTimer) {
        clearInterval(timerInterval); // 기존 타이머가 있다면 중지
        startTime = Date.now();

        // 타이머 메시지를 위한 span 요소를 생성
        const timerSpan = document.createElement("span");
        timerSpan.id = "timer-display";
        timerSpan.textContent = `${message} (0초)`;
        resultDiv.appendChild(timerSpan); // 초기 메시지 설정

        timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            timerSpan.textContent = `${message} (${elapsedTime}초)`;
        }, 1000); // 1초마다 업데이트
    } else {
        // 타이머 시작/중지 요청이 없으면 단순히 메시지만 업데이트
        let messageSpan = document.createElement("span");
        messageSpan.innerHTML = `<span style="font-size:${fontSize}px;">${message}</span>`;
        resultDiv.appendChild(messageSpan);
    }
}
