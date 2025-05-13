from flask import Flask, request, jsonify
from flask_cors import CORS
from server.database import db, UserInteraction, init_db
import os

app = Flask(__name__)
CORS(app)

# 데이터베이스 설정 (SQLite를 server/DB 폴더 내에 저장)
basedir = os.path.abspath(os.path.dirname(__file__))
db_folder = os.path.join(basedir, 'DB')
db_file = os.path.join(db_folder, 'user_data.db')

# DB 폴더가 없다면 생성
if not os.path.exists(db_folder):
    os.makedirs(db_folder)

# DB 파일 위치를 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

init_db(app)

#
@app.route('/process_input', methods=['POST'])
def process_input():
    if request.is_json:
        data = request.get_json()
        user_input = data.get('text')
        if user_input:
            #TODO -> AI 답변을 받아서 보내야한다.
            server_response = f"서버로부터의 답변 : {user_input}222222222222"

            # 데이터베이스에 저장
            new_interaction = UserInteraction(user_input=user_input, server_response=server_response)
            db.session.add(new_interaction)
            db.session.commit()

            print(f"저장 완료 - 입력: {user_input}, 답변: {server_response}")
            return jsonify({'response': server_response}), 200
        else:
            return jsonify({'error': '입력 값이 없습니다.'}), 400
    else:
        return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400



@app.route('/interactions', methods=['GET'])
#db에 user input과 server response를 db에 저장하는 기본 구조
def get_interactions():
    interactions = UserInteraction.query.order_by(UserInteraction.timestamp.desc()).limit(10).all()
    results = [{
        'id': interaction.id,
        'input': interaction.user_input,
        'response': interaction.server_response,
        'timestamp': interaction.timestamp.isoformat()
    } for interaction in interactions]
    return jsonify(results), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)