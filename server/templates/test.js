// 서버로 데이터를 보내기 전
const dataToSend = { input: inputText.value };
console.log("서버로 보내는 데이터:", JSON.stringify(dataToSend));

fetch("http://localhost:5000/predict", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
})
    .then((response) => response.json())
    .then((data) => {
        // 서버로부터 데이터를 받은 후
        console.log("서버로부터 받은 데이터:", data);
        // ... 결과 처리 ...
    })
    .catch((error) => {
        console.error("통신 오류:", error);
    });
