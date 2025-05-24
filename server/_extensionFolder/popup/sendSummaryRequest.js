// sendRequest 함수

// language 속성은 일단 주석 처리
//async function sendSummaryRequest(url, text, title, language, fontSize, outputFormat, isYoutube, fetch_url) {
async function sendSummaryRequest(url, text, title, fontSize, outputFormat, isYoutube, fetch_url) {
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
    updateResult("요약 중...");

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
            const popup = window.open("", "summaryPopup", "width=400,height=300");
            if (popup) {
                // 팝업 CSS를 포함하여 더 나은 모양을 제공할 수 있습니다.
                popup.document.head.innerHTML = `<style>body { font-family: sans-serif; margin: 15px; line-height: 1.5; }</style>`;
                popup.document.body.innerHTML = `<p style="font-size:${fontSize}px;">${summary}</p>`;
                popup.document.title = "요약 결과";
            } else {
                alert("팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요.");
                updateResult("팝업이 차단되었습니다."); // 팝업이 차단되면 팝업에도 메시지 표시
            }
        } else {
            // 이 함수는 팝업 HTML에서 결과를 표시하는 요소를 업데이트합니다.
            updateResult(summary);
        }

        // TODO: 요약이 성공적으로 완료되면 여기에서 renderHistory를 호출하지 않고,
        // summarizeBtn 클릭 리스너 내에서 saveHistory를 호출하는 것을 고려해야 합니다.
        // saveHistory 함수는 요약 요청이 완료된 후에 실행되어야 합니다.
        // 예를 들어, summarizeBtn 리스너에서 sendRequest 호출 후 `await`를 사용하여 기다린 다음 saveHistory를 호출합니다.
    } catch (error) {
        console.error("서버 요청 또는 응답 처리 중 오류 발생:", error);
        updateResult(`요약 요청 실패: ${error.message}`);
    }
}
