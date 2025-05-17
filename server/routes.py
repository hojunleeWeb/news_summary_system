from flask import request, jsonify
from server.DB.database import db, UserInteraction

def register_routes(app):
    #POST 요청에 대한 처리 방법 -> url ~~/process_input 으로 구분
    #코드 자체는 서버 내에서 실행되기에 127.0.~~/process_input 으로 확장 프로그램이 POST 요청을 보낼 경우에 수행할 로직을 의미
    #굳이 post 요청일 필요가 있나? -> GET 요청으로 보내자.
    @app.route('/get_suumary', methods=['GET'])
    def get_summary():
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


    # 데이터베이스에 저장된 사용자 입력과 서버 응답 기록을 조회합니다. -> 왜 필요??
    # 사용자가 서버 주소/get 에 GET 요청을 보내면 수행할 로직 -> 이력 조회 시 수행할 기능으로 하자
    @app.route('/get_record', methods=['GET'])
    def get_record():
        #UserInteraction 모델을 탐색해서, timestamp 필드를 기준으로 내림차순 정렬 이후 10개만을 선택한다.
        #나중 이력 조회 기능을 구현하기 위해서는 유저 아이디를 기준으로 테이블 탐색 및 시간 순서대로 정렬하자
        #todo
        interactions = UserInteraction.query.order_by(UserInteraction.timestamp.desc()).limit(10).all()
        results = [{
            'id': interaction.id,
            'input': interaction.user_input,
            'response': interaction.server_response,
            'timestamp': interaction.timestamp.isoformat()
        } for interaction in interactions]
        return jsonify(results), 200
