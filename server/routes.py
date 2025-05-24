from flask import request, jsonify, make_response, session
from database import db, SummaryRecord, User
from videoTransSrc.video2text import video2text
from video_processing.asao_control import asao_control
from video_processing.response_summary import response_summary
from video_processing.login_auth_db import find_user_by_credentials


# /post_summary 라우트에서 save_summary 함수를 호출하도록 수정
def register_routes(app):
    @app.route('/post_summary', methods=['POST', 'OPTIONS'])
    def post_summary_route():
        if request.method == 'OPTIONS':
            return asao_control()
        elif request.method == 'POST':
            return response_summary() # response_summary 함수 호출
        
    #get_record로 GET 요청을 받으면 수행할 함수 -> 요약 이력 기능을 수행할 때 실행할 함수
    @app.route('/get_record', methods=['GET', 'OPTIONS'])
    def get_record():
        #CreateDBLine
        if request.method == 'OPTIONS':
            return asao_control()
        elif request.method == 'GET':
            data = request.get_json()
            user_id = data.get('user_id')

            interactions = SummaryRecord.query.filter_by(user_id=user_id).all()
            results = [{
                'url' : interaction.url,
                'response': interaction.summarization_text,
                'timestamp': interaction.timestamp.isoformat()
            } for interaction in interactions]
            return jsonify(results), 200
        

    #회원가입 js -> 후에 구글 로그인과 연동 고려    
    @app.route('/signup', methods=['POST', 'OPTIONS'])
    def signup():
        if request.method == 'OPTIONS':
            return asao_control()
        elif request.method == 'POST':
            data = request.get_json()
            user_id = data.get('user_id')
            user_pw = data.get('user_pw')

            if not user_id or not user_pw:
                return jsonify({'message': '아이디와 비밀번호를 입력해주세요.'}), 400

            new_interaction = User(user_id=user_id, user_pw=user_pw)
            db.session.add(new_interaction)
            db.session.commit()

            # 실제 데이터베이스 저장 로직 구현 필요
            print(f"아이디: {user_id}, 비밀번호: {user_pw}")

        # 성공 응답
            return jsonify({'message': '회원가입 성공'}), 200
        else:
            #실패 응답
            return jsonify({'message' : '회원가입 실패'}), 400
    
    
    #로그인 로직
    @app.route('/login', methods=['POST','OPTIONS'])
    def login():
        if request.method == 'OPTIONS':
            return asao_control()
        elif request.method == 'POST':
            data = request.get_json()
            user_id = data.get('user_id')
            user_pw = data.get('user_pw')

            if not user_id or not user_pw:
                return jsonify({'message': '아이디와 비밀번호를 입력해주세요.'}), 400

            user = find_user_by_credentials(user_id, user_pw)
            if user:
                response = make_response(jsonify({'message': '로그인 성공'}))
                session['user_id'] = user.user_id  # 세션에 사용자 ID 저장
                return response
            else:
                return jsonify({'message': '로그인 실패'}), 401
            
    @app.route('/logout')
    def logout():
        session.pop('user_id', None)
        session.pop('username', None)
        return jsonify({'message': '로그아웃 성공'}), 200


