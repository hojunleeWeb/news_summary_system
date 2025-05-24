from flask import request, jsonify, session
from database import SummaryRecord
from get_summary import generate_summary
from routerSrc.addsummary import add_summaryRecord
from videoTransSrc.video2text import video2text

def save_summary():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            texts = data.get('text')
            url = data.get('url')
            is_youtube = data.get('is_youtube', False) # 클라이언트에서 isYoutube로 전송

            interaction = SummaryRecord.query.filter_by(url=url).first()

            # youtube 영상이면 데이터 후처리 로직
            if is_youtube:
                # video2text 함수는 텍스트와 제목을 반환하므로 텍스트만 추출
                video_result = video2text(url)
                if video_result and video_result[0]:
                    texts = video_result[0]
                else:
                    return jsonify({'error': '유튜브 영상 텍스트 변환에 실패했습니다.'}), 500

            #TODO
            #동일한 url에 대한 db query 작동이 제대로 수행되지 않음
            if interaction:
                results = [{'response': interaction.summarization_text}]
                return jsonify(results), 200
            elif texts:
                try:
                    summary = generate_summary(texts)
                except Exception as e:
                    print(f"요약 생성 오류: {e}")
                    return jsonify({'error': '요약 생성에 실패했습니다.'}), 500

                user_id = session.get('user_id', 'none') # 세션에 user_id가 없으면 'none'으로 처리
                add_summaryRecord(user_id, url, texts, summary)
                return jsonify({'response': summary}), 200

            else:
                return jsonify({'error': '입력 값이 없습니다.'}), 400
        else:
            return jsonify({'error': 'JSON 형식의 요청이 아닙니다.'}), 400
    else:
        return jsonify({'error': 'POST 요청만 허용됩니다.'}), 405