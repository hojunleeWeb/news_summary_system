// login/login.js

/**
 * 로그인 폼 관련 이벤트 핸들러를 설정합니다.
 * @param {string} fetch_url - 서버의 기본 URL
 * @param {HTMLElement} loginRedirect - 로그인 리다이렉트 DOM 요소
 * @param {HTMLElement} loginContainer - 로그인 폼 컨테이너 DOM 요소
 * @param {HTMLElement} summarizeBtn - 요약하기 버튼 DOM 요소
 * @param {function} updateResult - 결과를 표시하는 콜백 함수
 * @param {function} updateLoginState - 로그인 상태를 업데이트하는 콜백 함수
 *
 */
export function setupLoginHandlers(
    fetch_url,
    loginRedirect,
    loginContainer,
    summarizeBtn,
    updateResult,
    updateLoginState
) {
    const settingsContainer = document.getElementById("settings-container");

    const loginBtn = document.getElementById("login-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const cancelLoginBtn = document.getElementById("cancelLoginBtn"); // 취소 버튼

    // 로그인 폼 제출 (로그인 버튼 클릭)
    if (loginBtn) {
        loginBtn.addEventListener("click", async function (event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            if (loginBtn.innerText === "로그아웃") {
                // 이미 로그인된 상태이므로 클릭 시 로그아웃 처리
                localStorage.removeItem("user");
                updateLoginState(); // 상태 업데이트 콜백 호출
                alert("로그아웃 되었습니다.");
                // 팝업 새로고침 대신 UI 상태만 변경
                // window.location.reload(); // 크롬 확장 프로그램 팝업에서는 지양
                loginContainer.style.display = "none";
                summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                alert("이메일과 비밀번호를 입력해주세요.");
                return;
            }

            // 실제 서버 요청
            try {
                const response = await fetch(fetch_url + "/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: email,
                        user_pw: password,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `로그인 실패: ${response.status}`);
                }

                const data = await response.json();
                alert(data.message || "로그인 성공!");

                // 로그인 상태를 localStorage에 저장
                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        email: email,
                        isLoggedIn: true,
                    })
                );
                updateLoginState(); // 상태 업데이트 콜백 호출
                // 로그인 성공 후 UI 업데이트
                loginContainer.style.display = "none";
                summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기
                updateResult(""); // 결과 메시지 초기화
            } catch (error) {
                console.error("로그인 실패:", error);
                alert(error.message || "로그인 중 오류가 발생했습니다.");
                updateResult(`로그인 실패: ${error.message}`);
                setTimeout(() => {
                    updateResult("");
                }, 3000);
            }
        });
    }
    if (loginRedirect) {
        loginRedirect.addEventListener("click", () => {
            if (updateLoginState()) {
                localStorage.removeItem("user");
                updateLoginState();
                alert("로그아웃 되었습니다.");
                return;
            }
            if (loginContainer.style.display === "none" || loginContainer.style.display === "") {
                loginContainer.style.display = "block";
                settingsContainer.style.display = "none";
                summarizeBtn.style.display = "none";
                updateResult(""); // 임포트된 updateResult 사용
                window.scrollTo(0, 0); // 로그인 폼으로 스크롤 이동
            } else {
                loginContainer.style.display = "none";
                summarizeBtn.style.display = "block";
                updateResult(""); // 임포트된 updateResult 사용
                window.scrollTo(0, 0); // 로그인 폼으로 스크롤 이동
            }
        });
    }

    // 취소 버튼 클릭 (로그인 폼 닫기)
    if (cancelLoginBtn) {
        cancelLoginBtn.addEventListener("click", () => {
            loginContainer.style.display = "none"; // 로그인 컨테이너 숨기기
            summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기
            updateResult(""); // 결과 메시지 초기화
            window.scrollTo(0, 0); // 로그인 폼으로 스크롤 이동
        });
    }
}
