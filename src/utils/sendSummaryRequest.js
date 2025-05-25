
import { updateResult } from "../utils/updateResult.js"; // updateResult 함수 임포트
import { renderHistory } from "../history/renderhistory.js"; // renderHistory 함수 임포트


// sendSummaryRequest 함수
// async function sendSummaryRequest(url, text, title, language, fontSize, outputFormat, isYoutube, fetch_url) { // 기존 주석 처리된 라인
export async function sendSummaryRequest(url, text, title, fontSize, outputFormat, isYoutube, fetch_url,popupX,popupY) {
    const payload = {
        url: url,
        //language : language, // 번역 모델이 추가되면 번역을 서버가 수행해야하니 payload에 포함
        title: "",
        text: "",
        isYoutube: isYoutube,
    };

    // YouTube가 아닌 경우에만 본문 텍스트 포함
    if (!isYoutube) {
        payload.text = text;
        payload.title = title; // 텍스트와 함께 제목도 전달
    } else {
        payload.title = title; // YouTube인 경우에도 제목은 전달
    }

    // 결과 메시지를 초기화하거나 "요약 중..."으로 변경하여 사용자에게 피드백 제공
    // 요약 시작 시 "요약 중..." 메시지와 함께 타이머 시작
    updateResult("요약 중...", true);

    try {
        const response = await fetch(fetch_url + "/post_summary", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // 서버 응답이 성공적이지 않은 경우
            const errorData = await response.json(); // 서버에서 보낸 에러 메시지 파싱
            const errorMessage = errorData.message || `HTTP 오류! 상태: ${response.status}`;
            throw new Error(`요약 요청 실패: ${errorMessage}`);
        }

        const data = await response.json();
        console.log(data);
        const summary = data.response || "요약 결과를 받지 못했습니다.";

        if (outputFormat === "popup") {
            // 새 팝업창으로 출력
            chrome.windows.create(
                {
                    url: "data:text/html," + encodeURIComponent(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>${title || '요약 결과'}</title>
                            <style>
                                body { 
                                    font-family: 'Segoe UI', sans-serif; 
                                    padding: 20px; 
                                    line-height: 1.6; 
                                    word-wrap: break-word; 
                                    background-color: #f4f7f6; 
                                    color: #333; 
                                    margin: 0;
                                }
                                h1 { 
                                    font-size: 1.2em; 
                                    color: #007bff; 
                                    margin-bottom: 15px; 
                                }
                                pre { 
                                    white-space: pre-wrap; 
                                    word-wrap: break-word; 
                                    font-size: ${fontSize || 14}px; 
                                    background-color: #ffffff; 
                                    padding: 15px; 
                                    border-radius: 8px; 
                                    box-shadow: 0 2px 4px rgba(0,0,0,0.05); 
                                    border: 1px solid #e0e0e0;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>${title || '요약 결과'}</h1>
                            <pre>${summary}</pre>
                        </body>
                        </html>
                    `),
                    type: "popup",
                    width: 400, // 기본 너비
                    height: 600, // 기본 높이
                    left: popupX, // 사용자 설정 X 좌표 적용
                    top: popupY,  // 사용자 설정 Y 좌표 적용
                },
                (newWindow) => {
                    if (newWindow) {
                        console.log("새 팝업창 생성됨:", newWindow);
                        // 팝업 생성 성공 시 타이머 중지 및 최종 메시지 표시
                        // message, startTimer, stopTimer, isSummaryContent, fontSize, title, type
                        updateResult("요약 결과를 새 팝업창으로 출력했습니다.", false, true, false, 14, "", "success");
                    } else {
                        console.warn("팝업창 생성에 실패했습니다. 팝업 차단 여부를 확인하세요.");
                        // 팝업 생성 실패 시 타이머 중지 및 에러 메시지 표시
                        updateResult("팝업이 차단되었거나 생성에 실패했습니다.", false, true, false, 14, "", "error");
                    }
                }
            );
        } else {
            // 이 함수는 팝업 HTML에서 결과를 표시하는 요소를 업데이트합니다.
            updateResult(summary, false, true, true, fontSize, title, "success"); // 임포트된 updateResult 사용
        }
         // 요약이 성공적으로 완료되면 이력 저장
        return { summary, url, title, text };

        // TODO: 요약이 성공적으로 완료되면 여기에서 renderHistory를 호출하지 않고,
        // summarizeBtn 클릭 리스너 내에서 saveHistory를 호출하는 것을 고려해야 합니다.
        // saveHistory 함수는 요약 요청이 완료된 후에 실행되어야 합니다.
        // 예를 들어, summarizeBtn 리스너에서 sendRequest 호출 후 `await`를 사용하여 기다린 다음 saveHistory를 호출합니다.
    } catch (error) {
        console.error("서버 요청 또는 응답 처리 중 오류 발생:", error);
        updateResult(`요약 요청 실패: ${error.message}`); // 임포트된 updateResult 사용
        throw err;
    }
}
