# app.py (수정된 내용)

from flask import Flask, session, request, jsonify
from flask_cors import CORS
from database import db, init_db, SummaryRecord # database.py에서 SummaryRecord 모델 임포트
import os
from routes import register_routes
# import json # JSON 파일 저장 로직 제거 시 필요 없음
# import torch # models.py로 이동
# from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline # models.py로 이동
# from PIL import Image # models.py로 이동
# import requests # models.py로 이동
# import io # models.py로 이동

# models.py에서 정의한 함수 및 객체들을 임포트
from dataProcessing.models import load_models, generate_image_caption, translate_text_to_korean

app = Flask(__name__)
app.secret_key = 'dalejklcdjknengjkelsmnajdkjlrnkj'
CORS(app)

# 데이터베이스 설정
basedir = os.path.abspath(os.path.dirname(__file__))
db_folder = os.path.join(basedir, 'DB')
db_file = os.path.join(db_folder, 'db.db')

if not os.path.exists(db_folder):
    os.makedirs(db_folder)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

init_db(app) # db 초기화 (app 컨텍스트 내에서 실행되어야 함)

# --- 모델 로드 함수 호출 (애플리케이션 컨텍스트에서 실행) ---
# Flask 애플리케이션 컨텍스트 내에서 모델을 로드하는 것이 가장 좋습니다.
with app.app_context():
    load_models() # models.py의 모델 로드 함수 호출


# --- 기존 routes.py 내용을 여기로 옮기거나, routes.py에서 이 함수들을 임포트하여 사용 ---
# Flask 라우트 정의
@app.route('/test_caption', methods=['POST'])
def test_caption_route():
    data = request.get_json()
    img_url = data.get('img_url')

    if not img_url:
        return jsonify({'error': 'img_url is required'}), 400

    # models.py의 캡셔닝 함수 사용
    image, caption = generate_image_caption(img_url)
    if image is None: # 오류 처리
        return jsonify({'error': caption}), 500

    # models.py의 번역 함수 사용
    korean_caption = translate_text_to_korean(caption)
    if korean_caption.startswith("번역 모델이 로드되지 않았") or korean_caption.startswith("번역 중 오류 발생"):
        return jsonify({'error': korean_caption}), 500

    # # 캡셔닝 결과를 데이터베이스에 저장 (SummaryRecord 모델 사용)
    # try:
    #     new_history = SummaryRecord( # 모델 이름이 SummaryRecord로 바뀌었으므로 수정
    #         url=img_url, # 이미지 URL을 URL로 저장
    #         title="이미지 캡션", # 적절한 제목
    #         summary=korean_caption, # 번역된 캡션을 summary로 저장
    #         original_text=caption, # 원본 캡션을 original_text로 저장 (선택 사항)
    #         img_captions=json.dumps([[img_url, korean_caption]]) # JSON 문자열로 저장
    #     )
    #     db.session.add(new_history)
    #     db.session.commit()
    #     print("이미지 캡션 이력 데이터베이스에 저장 완료.")
    # except Exception as e:
    #     db.session.rollback()
    #     print(f"이미지 캡션 이력 데이터베이스 저장 실패: {e}")
    #     return jsonify({'error': f'이력 저장 중 오류 발생: {e}'}), 500

    return jsonify({
        'original_caption': caption,
        'korean_caption': korean_caption,
        'img_url': img_url
    })

# routes.py 내용을 여기에 직접 추가하거나,
# routes.py에서 `app` 객체를 받아 라우트를 등록하도록 함수를 변경해야 합니다.
# (예: register_routes(app, capimg_func=models.generate_image_caption, translate_func=models.translate_text_to_korean))
# 현재는 routes.py에서 `app`을 직접 임포트하여 사용하는 방식이 아니라
# `register_routes(app)`를 호출하는 방식이므로, capimg 등을 전역으로 사용 가능하게 됩니다.
register_routes(app) # 기존 라우트 등록 함수 호출

if __name__ == '__main__':
    # 디버그 모드는 개발 중에만 사용하고, 프로덕션에서는 비활성화해야 합니다.
    app.run(host='0.0.0.0', debug=True)