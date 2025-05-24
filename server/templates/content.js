// 기사 전체 텍스트와 해당 기사가 게재된 url을 인자로 받아 서버로 POST 요청을 전송
function get_summary(inputText, url, IsYoutube = false, fetch_url) {
    const resultDiv = document.getElementById("result");

    const payload = {
        url: url,
        text: inputText,
        is_youtube: IsYoutube,
    };

    fetch(fetch_url + "/post_summary", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
        .then((response) => response.json())
        .then((data) => {
            resultDiv.textContent = data.response || data.error || "응답 없음";
        })
        .catch((error) => {
            resultDiv.textContent = "통신 오류: " + error;
        });
}
