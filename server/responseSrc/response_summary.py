from flask import request, jsonify, session
from database import SummaryRecord
from generate_summary import generate_summary
from add_summary_record import add_summary_record
from videoTransSrc.video2text import video2text

# 사용자가 post_summary 요청을 보낼 때 호출되는 함수
# 요약 결과를 생성하고 데이터베이스에 저장하는 함수
def response_summary():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            texts = data.get('text')
            url = data.get('url')
            is_youtube = data.get('isYoutube', False) # 클라이언트에서 isYoutube로 전송
            user_id = session.get('user_id', 'none') # 세션에 user_id가 없으면 'none'으로 처리

            interaction = SummaryRecord.query.filter_by(url=url).first()

            #동일한 url에 대한 요약 요청이 이전에 있는 경우를 최우선적으로 검색
            if interaction:
                summary_text = interaction.summarization_text
                print(f"서버: DB에서 동일 URL 요약 발견. 요약 길이: {len(summary_text) if summary_text else 0}")
                # user_id가 none이 아닐 때 = 로그인을 한 상태일 때만 기록
                # db에 none이 계속 추가되는 일을 방지
                if(user_id != 'none'):
                    add_summary_record(user_id, url, texts, summary_text)
                    
                # 여기서 배열 대신 단일 객체를 반환하도록 수정
                return jsonify({'response': summary_text}), 200 # results 변수 삭제, 직접 딕셔너리 반환
            
            # youtube 영상이면 데이터 후처리 로직
            if is_youtube:
                # video2text 함수는 텍스트와 제목을 반환하므로 텍스트만 추출
                video_result = video2text(url)
                if video_result and video_result[0]:
                    texts = video_result[0]
                else:
                    return jsonify({'error': '유튜브 영상 텍스트 변환에 실패했습니다.'}), 500
            if texts:
                print(f"서버: 요약 생성 시작. 텍스트 길이: {len(texts)}")
                try:
                    summary = generate_summary(texts)
                    add_summary_record(user_id, url, texts, summary)
                    print(f"서버: 요약 생성 완료. 요약 길이: {len(summary) if summary else 0}")
                    # 여기서도 배열 대신 단일 객체를 반환하도록 수정
                    return jsonify({'response': summary}), 200
                
                except Exception as e:
                    print(f"요약 생성 오류: {e}")
                    return jsonify({'error': '요약 생성에 실패했습니다.'}), 500  
            else:
                return jsonify({'error': '요약할 텍스트가 없습니다.'}), 400            
        else:
            return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400
    else:
        return jsonify({'error': 'POST 요청만 허용됩니다.'}), 405