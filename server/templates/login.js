document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("loginBtn"); // 로그인 버튼 (회원가입 버튼 옆에 있다고 가정)
    const loginFormContainer = document.getElementById("loginFormContainer");
    const loginForm = document.getElementById("loginForm");
    const loginSubmitBtn = document.getElementById("login_submitBtn");

    // 로그인 버튼 클릭 시 폼 표시
    if (loginButton && loginFormContainer) {
        loginButton.addEventListener("click", function () {
            if (loginFormContainer.style.display == "block") {
                loginFormContainer.style.display = "none";
            } else {
                loginFormContainer.style.display = "block";
            }
            // 또는 'flex' 등 원하는 레이아웃 방식
        });
    }

    // 로그인 폼 제출 이벤트 처리
    if (loginForm && loginSubmitBtn) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            const userId = document.getElementById("login_userId").value;
            const password = document.getElementById("login_password").value;

            fetch(fetch_url + "/login", {
                // Flask 서버의 로그인 엔드포인트
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: userId, // 서버에서 사용하는 아이디 필드명에 맞춰 수정 (예: user_id)
                    user_pw: password,
                }),
            })
                .then(async (response) => {
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `로그인 실패: ${response.status}`);
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log("로그인 성공:", data);
                    loginFormContainer.style.display = "none"; // 폼 숨기기
                    // 로그인 성공 후 처리 (예: 페이지 리디렉션, 사용자 정보 업데이트 등)
                    alert(data.message || "로그인 성공!");
                    loginButton.innerText = "로그아웃";
                    // window.location.href = '/dashboard'; // 예시: 대시보드 페이지로 리디렉션
                })
                .catch((error) => {
                    console.error("로그인 실패:", error);
                    alert(error.message || "로그인 처리 중 오류가 발생했습니다.");
                    // 오류 처리 로직 (예: 에러 메시지 표시)
                });
        });
    }
});
