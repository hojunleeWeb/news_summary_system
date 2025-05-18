document.addEventListener("DOMContentLoaded", function () {
    const loginRedirect = document.getElementById("loginRedirect");
    const loginContainer = document.getElementById("login-container");
    const loginBtn = document.getElementById("login-btn");
    const googleBtn = document.getElementById("google-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const updateLoginState = () => {
        const user = localStorage.getItem("user");
        if (user) {
            const userData = JSON.parse(user);
            if (userData.isLoggedIn) {
                loginRedirect.innerHTML = `<span class="username">${userData.email}</span> (로그아웃)`;
                loginContainer.style.display = "none";
                loginBtn.innerText = "로그아웃";
                return true;
            }
        }
        loginRedirect.innerText = "로그인";
        loginContainer.style.display = "none";
        loginBtn.innerText = "로그인";
        return false;
    };

    // 페이지 로드 시 로그인 상태 확인 및 UI 업데이트
    const isLoggedIn = updateLoginState();

    // 로그인/로그아웃 버튼 클릭
    loginRedirect.addEventListener("click", function () {
        if (isLoggedIn) {
            // 로그아웃 로직
            localStorage.removeItem("user");
            updateLoginState();
            alert("로그아웃 되었습니다.");
            // 필요하다면 페이지 리로드 또는 다른 UI 업데이트
            window.location.reload();
        } else {
            // 로그인 폼 표시
            loginContainer.style.display = "block";
        }
    });

    // 로그인 폼 제출
    loginBtn.addEventListener("click", function (event) {
        event.preventDefault(); // 기본 폼 제출 동작 방지

        if (loginBtn.innerText === "로그아웃") {
            // 이미 로그인된 상태이므로 클릭 시 로그아웃 처리
            localStorage.removeItem("user");
            updateLoginState();
            alert("로그아웃 되었습니다.");
            window.location.reload();
            return;
        }

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
                updateLoginState();
                // 로그인 성공 후 필요하다면 페이지 리로드 또는 다른 UI 업데이트
                window.location.reload();
            })
            .catch((error) => {
                console.error("로그인 실패:", error);
                alert(error.message || "로그인 중 오류가 발생했습니다.");
            });
    });

    // Google 로그인 (기능 구현 필요)
    googleBtn.addEventListener("click", function () {
        alert("Google 로그인 기능은 아직 구현되지 않았습니다.");
        // Google 로그인 로직 추가
    });
    // 구글 로그인 버튼 클릭
    googleBtn.addEventListener("click", () => {
        alert("Google 로그인은 현재 지원되지 않습니다.");
    });
});
