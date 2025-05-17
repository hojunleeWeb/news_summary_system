document.addEventListener("DOMContentLoaded", function () {
    const sendButton = document.getElementById("sendButton");
    const userInput = document.getElementById("userInput");
    const serverResponseDiv = document.getElementById("serverResponse");

    sendButton.addEventListener("click", function () {
        const inputText = userInput.value;
        if (inputText) {
            fetch("http://127.0.0.1:5000/get_summary", {
                // 서버 주소 변경 확인
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: inputText }),
            })
                .then((response) => response.json())
                .then((data) => {
                    serverResponseDiv.textContent = data.response || data.error || "응답 없음";
                })
                .catch((error) => {
                    serverResponseDiv.textContent = "통신 오류: " + error;
                });
        } else {
            serverResponseDiv.textContent = "입력 값이 없습니다.";
        }
    });
});
