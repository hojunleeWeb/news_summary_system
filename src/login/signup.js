// popup/signup.js

/**
 * 회원가입 버튼 클릭 이벤트를 처리하고 서버에 요청을 보냅니다.
 * @param {string} fetch_url - 서버의 기본 URL (예: "http://192.168.0.127:5000")
 * @param {HTMLElement} loginContainer - 로그인 폼 컨테이너 DOM 요소 (모달 대신 사용)
 * @param {HTMLElement} summarizeBtn - 요약하기 버튼 DOM 요소 (선택 사항)
 * @param {function} updateResult - 결과를 표시하는 콜백 함수
 */
export function setupSignupHandlers(fetch_url, loginContainer, summarizeBtn, updateResult) {
    const signupButton = document.getElementById("signup-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (signupButton) {
        signupButton.addEventListener("click", async function (event) {
            event.preventDefault(); // 기본 폼 제출 동작 방지

            const userId = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!userId || !password) {
                alert("이메일과 비밀번호를 입력해주세요.");
                return;
            }

            // 결과 메시지 업데이트 (선택 사항)
            updateResult("회원가입 처리 중...");

            try {
                const response = await fetch(`${fetch_url}/signup`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        user_pw: password,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP 오류! 상태: ${response.status}`);
                }

                const data = await response.json();
                console.log("회원가입 성공:", data);
                alert(data.message || "회원가입이 성공적으로 완료되었습니다!");

                // 회원가입 성공 시 loginContainer 닫기
                if (loginContainer) {
                    loginContainer.style.display = "none";
                    summarizeBtn.style.display = "block"; // 요약 버튼 다시 보이기
                }
                // 결과 메시지 초기화
                updateResult("");

                // 필요하다면 로그인 폼 필드 초기화
                emailInput.value = "";
                passwordInput.value = "";
            } catch (error) {
                console.error("회원가입 실패:", error);
                alert(error.message || "회원가입 중 오류가 발생했습니다.");
                if (resultDiv) {
                    updateResult(`회원가입 실패: ${error.message}`);
                    setTimeout(() => {
                        updateResult("");
                    }, 3000);
                }
            }
        });
    }
}
