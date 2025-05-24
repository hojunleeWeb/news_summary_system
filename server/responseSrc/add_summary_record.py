
from flask import request, jsonify, session
from database import db, SummaryRecord

# 요약 결과를 데이터베이스에 저장하는 함수
def add_summary_record(session_user_id, url,title, texts, summarized_text):
    try:
        new_interaction = SummaryRecord(user_id = session_user_id,url = url,title=title,summarization_text=summarized_text)
        db.session.add(new_interaction)
        db.session.commit()
        print(f"저장 완료 - 입력: {texts[:20]}..., 답변: {summarized_text[:20]}...")
        return jsonify({'response': summarized_text}), 201      
    except Exception as e:
        db.session.rollback()
        print(f"데이터베이스 저장 오류: {e}")
        return jsonify({'error': '데이터베이스 저장에 실패했습니다.'}), 500
