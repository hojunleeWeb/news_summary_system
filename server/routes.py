from flask import request, jsonify, make_response, session
from database import db, SummaryRecord, User
from get_summary import generate_summary

def asao_control():
    response = jsonify({})
    response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return response, 200

def add_summaryRecord(session_user_id, url, texts, summarized_text):
    try:
        new_interaction = SummaryRecord(user_id = session_user_id,url = url,summarization_text=summarized_text)
        db.session.add(new_interaction)
        db.session.commit()
        print(f"저장 완료 - 입력: {texts[:20]}..., 답변: {summarized_text[:20]}...")
        return jsonify({'response': summarized_text}), 201      
    except Exception as e:
        db.session.rollback()
        print(f"데이터베이스 저장 오류: {e}")
        return jsonify({'error': '데이터베이스 저장에 실패했습니다.'}), 500

def save_summary():
    if request.method == 'POST':
        if request.is_json:
                data = request.get_json()
                texts = data.get('text')
                url = data.get('url')
                if texts:
                    try:
                        summary = generate_summary(texts)
                    except Exception as e:
                        print(f"요약 생성 오류: {e}")
                        return jsonify({'error': '요약 생성에 실패했습니다.'}), 500
                    if 'user_id' in session:
                        session_user_id = session['user_id']
                        # 데이터베이스에 저장
                        add_summaryRecord(session_user_id, url,texts, summary)
                    else:
                        # 로그인 없이 데이터베이스에 저장
                        # 로그인하지 않은 사용자의 요약 이력을 모두 저장 -> 로그인시 해당 정보에 대한 필터링이 필요
                        add_summaryRecord("none", url, texts , summary)

                    return jsonify({'response': summary}), 200 
                    
                else:
                    return jsonify({'error': '입력 값이 없습니다.'}), 400
        else:
            return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400
    else:
        return jsonify({'error': 'POST 요청만 허용됩니다.'}), 405

# /post_summary 라우트에서 save_summary 함수를 호출하도록 수정
def register_routes(app):
    @app.route('/post_summary', methods=['POST', 'OPTIONS'])
    def post_summary_route():
        if request.method == 'OPTIONS':
            return asao_control()
        elif request.method == 'POST':
            return save_summary() # save_summary 함수 호출
            
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

            new_interaction = User(user_id=user_id, user_pw=user_pw)
            db.session.add(new_interaction)
            db.session.commit()

            # 실제 데이터베이스 저장 로직 구현 필요
            print(f"아이디: {user_id}, 비밀번호: {user_pw}")

        # 성공 응답
        return jsonify({'message': '회원가입 성공'}), 200
    
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


#로그인 시 테이블 search 로직
def find_user_by_credentials(user_id, user_pw):
    try:
        user = User.query.filter_by(user_id=user_id).first()
        if user and user.user_pw == user_pw:  # 저장된 비밀번호와 비교 (주의: 실제 서비스에서는 비밀번호 해싱 필요)
            return user
        return None
    except Exception as e:
        print(f"데이터베이스 오류 발생: {e}")
        return None