
from database import User
#로그인 시 테이블 search 로직
def find_user_by_credentials(user_id, user_pw):
    try:
        user = User.query.filter_by(user_id=user_id).first()
        if user and user.user_pw == user_pw:  # 저장된 비밀번호와 비교 (주의: 실제 서비스에서는 비밀번호 해싱 필요)
            return user
        return None
    except Exception as e:
        print(f"find_user_by_credentials 데이터베이스 오류 발생: {e}")
        return None