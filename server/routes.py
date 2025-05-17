from flask import request, jsonify
from database import db, CreateDBLine
from get_summary import generate_summary

def register_routes(app):
    @app.route('/post_summary', methods=['POST', 'OPTIONS'])
    def post_summary():
        if request.method == 'OPTIONS':
            response = jsonify({})
            response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
            response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
            return response, 200
        elif request.method == 'POST':
            if request.is_json:
                data = request.get_json()
                user_input = data.get('text')
                if user_input:
                    # 요약 생성
                    summary = generate_summary(user_input)

                    # 데이터베이스에 저장
                    new_interaction = CreateDBLine(user_input=user_input, server_response=summary)
                    db.session.add(new_interaction)
                    db.session.commit()
                    print(f"저장 완료 - 입력: {user_input[:20]}..., 답변: {summary[:20]}...")
                    return jsonify({'response': summary}), 200
                else:
                    return jsonify({'error': '입력 값이 없습니다.'}), 400
            else:
                return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400

    @app.route('/get_record', methods=['GET'])
    def get_record():
        interactions = CreateDBLine.query.order_by(CreateDBLine.timestamp.desc()).limit(10).all()
        results = [{
            'id': interaction.id,
            'input': interaction.user_input,
            'response': interaction.server_response,
            'timestamp': interaction.timestamp.isoformat()
        } for interaction in interactions]
        return jsonify(results), 200