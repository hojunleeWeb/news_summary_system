document.addEventListener("DOMContentLoaded", function () {
    const signupButton = document.getElementById("signup-btn");
    const signupFormContainer = document.getElementById("login-container");
    const signupForm = document.getElementById("signupform"); // 폼 요소는 여전히 참조

    if (signupButton) {
        signupButton.addEventListener("click", function (event) {
            // submit 대신 click 이벤트 감지
            event.preventDefault(); // 기본 동작 방지 (폼 제출 안 함)

            const userId = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            fetch(fetch_url + "/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId,
                    user_pw: password,
                }),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("회원가입 성공:", data);
                    signupFormContainer.style.display = "none"; // 폼 숨기기
                    window.history.back(); // 이전 페이지로 돌아가기
                })
                .catch((error) => {
                    console.error("회원가입 실패:", error);
                    // 오류 처리 로직 추가 (예: 사용자에게 오류 메시지 표시)
                });
        });
    }
});
