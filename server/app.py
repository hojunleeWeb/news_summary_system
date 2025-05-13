from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/process_input', methods=['POST'])
def process_input():
    if request.is_json:
        data = request.get_json()
        user_input = data.get('text')
        print(f"서버가 받은 입력: {user_input}")
        response_message = f"서버로부터의 답변 : {user_input}222222222222"
        return jsonify({'response': response_message}), 200
    else:
        return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)