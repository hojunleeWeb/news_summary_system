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
                isYoutube = data.get('IsYoutube')
                
                interaction = SummaryRecord.query.filter_by(url=url).first()

                #youtube 영상이면 데이터후처리 로직이 필요
                if(isYoutube):
                    texts = video2text(url)

                if interaction:
                    results = [{
                        'response': interaction.summarization_text,
                    }];
                    return jsonify(results), 200
                elif texts:
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
