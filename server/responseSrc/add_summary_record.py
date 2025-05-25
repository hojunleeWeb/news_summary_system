from flask import request, jsonify, session
from database import db, SummaryRecord
import json # json 모듈 임포트

# 요약 결과를 데이터베이스에 저장하는 함수
# 함수 매개변수 순서도 models.py에서 호출하는 방식과 일치하도록 조정했습니다.
def add_summary_record(session_user_id, url, title, summarized_text, img_urls=None, img_captions=None):
    try:
        # img_urls와 img_captions를 JSON 문자열로 변환
        # 리스트가 아니거나 None인 경우를 대비하여 조건문 추가
        json_img_urls = json.dumps(img_urls) if img_urls else None
        json_img_captions = json.dumps(img_captions) if img_captions else None

        new_interaction = SummaryRecord(
            user_id=session_user_id,
            url=url,
            title=title,
            # 원문 텍스트는 `texts` 매개변수로 받았지만,
            # 현재 SummaryRecord 모델에 원문 텍스트를 저장하는 컬럼이 없습니다.
            # 만약 원문 텍스트도 저장해야 한다면 SummaryRecord 모델에 `original_text = db.Column(db.Text)`와 같은 컬럼을 추가해야 합니다.
            # 지금은 `summarization_text`와 이미지 관련 데이터만 저장합니다.
            summarization_text=summarized_text,
            img_urls=json_img_urls,         # JSON 문자열로 변환된 이미지 URL 목록
            img_captions=json_img_captions  # JSON 문자열로 변환된 이미지 캡션 목록
        )

        db.session.add(new_interaction)
        db.session.commit()
        print(f"add_summary_record 저장 완료 - URL: {url}, 요약 길이: {len(summarized_text) if summarized_text else 0}")
        # 함수 자체는 데이터베이스 저장 역할만 하므로,
        # jsonify 응답은 호출하는 response_summary()에서 처리하는 것이 일반적입니다.
        # 여기서는 저장 성공 여부만 반환하도록 수정했습니다.
        return True, "저장 완료", 201

    except Exception as e:
        db.session.rollback()
        print(f"add_summary_record 데이터베이스 저장 오류: {e}")
        return False, f"데이터베이스 저장에 실패했습니다: {str(e)}", 500