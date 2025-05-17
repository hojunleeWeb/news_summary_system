from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

#sqlALchemy 객체,
db = SQLAlchemy()

#database 로직
class UserSummaryRecord(db.Model):
    #현재는 단순한 integer -> 로그인 기능 구현 이후 user uid로 변경
    id = db.Column(db.Integer, primary_key=True)
    #user가 서버에 보내는 정보 -> url이 기본이 될듯 -> 텍스트 정리는 로컬단에서, 영상 -> 텍스트 변환은 서버에서 처리
    #해당 정보가 db에 유지되므로, 이후 동일한 주소에 대한 요청시 db를 먼저 탐색하고 없으면 데이터를 요약모델에 통과시키자
    user_send_data = db.Column(db.Text, nullable=False)
    #서버가 user에게 보내는 정보 -> 요약된 텍스트 자체
    server_response_summarization_text = db.Column(db.Text, nullable=False)
    #요약본을 생성한 시간. -> 추후 유저가 요약 이력을 요청하면 이를 바탕으로 정렬하여 이력을 생성 이후 전송
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SummaryRecord(input='{self.user_send_data}', response='{self.server_response_summarization_text}')>"

#db 초기화
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()