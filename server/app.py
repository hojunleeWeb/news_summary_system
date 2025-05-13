from flask import Flask, request, jsonify
from flask_cors import CORS  # Flask-CORS import

app = Flask(__name__)
CORS(app)  # 모든 Origin에 대해 CORS 활성화 (개발 환경에서 편리)

@app.route('/receive_input', methods=['POST'])
def receive_input():
    if request.is_json:
        data = request.get_json()
        user_input = data.get('text')
        print(f"서버가 받은 입력: {user_input}")
        return jsonify({'message': f'서버가 "{user_input}"을(를) 받았습니다.'}), 200
    else:
        return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)