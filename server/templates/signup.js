document.addEventListener("DOMContentLoaded", function () {
    const signupButton = document.getElementById("signUpBtn");
    const signupFormContainer = document.getElementById("signupFormContainer");
    const signupForm = document.getElementById("signupForm");
    const submitButton = document.getElementById("signup_submitBtn");

    // 회원가입 버튼 클릭 시 폼 표시
    if (signupButton && signupFormContainer) {
        signupButton.addEventListener("click", function () {
            if (signupFormContainer.style.display == "block") {
                signupFormContainer.style.display = "none";
            } else {
                signupFormContainer.style.display = "block";
            }
            // 또는 'flex' 등 원하는 레이아웃 방식
        });
    }

    // 가입 버튼 클릭 시 서버로 데이터 전송
    if (signupForm && submitButton) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            const userId = document.getElementById("signup_userId").value;
            const password = document.getElementById("signup_password").value;

            fetch(fetch_url + "/signup", {
                // Flask 서버의 회원가입 엔드포인트
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
                    // 필요하다면 이전 페이지로 리디렉션 또는 다른 동작 수행
                    window.history.back(); // 이전 페이지로 돌아가기
                })
                .catch((error) => {
                    console.error("회원가입 실패:", error);
                    // 오류 처리 로직 추가 (예: 사용자에게 오류 메시지 표시)
                });
        });
    }
});
