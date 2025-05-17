# app.py
from flask import Flask
from flask_cors import CORS
from server.DB.database import db, init_db
import os
from . import routes  # 같은 디렉토리에 routes.py가 있는 경우

app = Flask(__name__)
CORS(app)

# 데이터베이스 설정
basedir = os.path.abspath(os.path.dirname(__file__))
db_folder = os.path.join(basedir, 'DB')
db_file = os.path.join(db_folder, 'user_data.db')

if not os.path.exists(db_folder):
    os.makedirs(db_folder)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_file
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

init_db(app)

# 외부 파일에 정의된 라우트 등록 함수 호출
routes.register_routes(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)