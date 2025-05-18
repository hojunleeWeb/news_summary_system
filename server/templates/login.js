document.addEventListener("DOMContentLoaded", function () {
    const loginBtn = document.getElementById("login-btn");
    const googleBtn = document.getElementById("google-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // 로그인 버튼 클릭
    loginBtn.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // 실제 서버 요청
        fetch(fetch_url + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: email,
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
                alert(data.message || "로그인 성공!");

                // 로그인 상태를 localStorage에 저장
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        email: email,
                        isLoggedIn: true,
                    })
                );

                // 로그인 성공 후 이동
                window.location.href = "popup.html";
            })
            .catch((error) => {
                console.error("로그인 실패:", error);
                alert(error.message || "로그인 중 오류가 발생했습니다.");
            });
    });

    // 구글 로그인 버튼 클릭
    googleBtn.addEventListener("click", () => {
        alert("Google 로그인은 현재 지원되지 않습니다.");
    });
});
