from flask import request, jsonify, session
from database import SummaryRecord
from generate_summary import generate_summary
from responseSrc.add_summary_record import add_summary_record
from dataProcessing.video2text import video2text
import json  # JSON 처리를 위해 json 모듈을 임포트

# 사용자가 post_summary 요청을 보낼 때 호출되는 함수
# 요약 결과를 생성하고 데이터베이스에 저장하는 함수
def response_summary():
    if request.method == 'POST':
        if request.is_json:
            data = request.get_json()
            title = data.get('title')   
            texts = data.get('text')
            url = data.get('url')
            img_urls = data.get('imgUrls', [])  # 이미지 URL 목록, 기본값은 빈 리스트
            is_youtube = data.get('isYoutube', False) # 클라이언트에서 _y로 전송
            user_id = session.get('user_id', 'none') # 세션에 user_id가 없으면 'none'으로 처리
            combined_img_captions = [] # 클라이언트에 전달할 이미지 캡션 리스트

            interaction = SummaryRecord.query.filter_by(url=url).first()

            #동일한 url에 대한 요약 요청이 이전에 있는 경우를 최우선적으로 검색
            if interaction:
                summary_text = interaction.summarization_text
                img_captions_json = interaction.img_captions
                img_urls_json = interaction.img_urls

                img_captions = json.loads(img_captions_json) if img_captions_json else []
                img_urls = json.loads(img_urls_json) if img_urls_json else []
                print(f"response_summary: DB에서 동일 URL 요약 발견. 요약 길이: {len(summary_text) if summary_text else 0}")
                
                # 이미지 URL과 캡션을 결합하여 클라이언트에 전달할 리스트 생성
                for i in range(min(len(img_urls), len(img_captions))):
                    combined_img_captions.append([img_urls[i], img_captions[i]])
                    # response_summary 함수의 반환값을 사용하는 클라이언트는 img_captions를 [[이미지 URL, 캡션], ...] 형태로 기대하므로

                if(user_id != 'none' and interaction.user_id != user_id):
                # user_id가 none이 아닐 때 = 로그인을 한 상태일 때만 기록 -> db에 none이 계속 추가되는 일을 방지
                # 데베에서는 img url와 캡션을 따로 저장한다.
                    add_summary_record(user_id, url, title, summary_text, img_urls, img_captions)

                return jsonify({'response': summary_text, 'img_captions': combined_img_captions}), 200 # results 변수 삭제, 직접 딕셔너리 반환

            # youtube 영상이면 데이터 후처리 로직
            if is_youtube:
                # video2text 함수는 텍스트와 제목을 반환하므로 텍스트만 추출
                video_result = video2text(url)
                if video_result and video_result[0]:
                    texts = video_result[0]
                else:
                    return jsonify({'error': 'response_summary 유튜브 영상 텍스트 변환에 실패했습니다.'}), 500
            if texts:
                print(f"response_summary : 요약 생성 시작. 텍스트 길이: {len(texts)}")
                try:
                    img_captions_list = imgAndCaptions(img_urls)  # 이미지 캡션 생성 -> 리턴 타입은 [(이미지, 캡션), ...] 형태
                    summary = generate_summary(texts)

                    print(f"response_summary: 요약 생성 완료. 요약 길이: {len(summary) if summary else 0}")

                    # 이미지 URL과 캡션을 결합하여 클라이언트에 전달할 리스트 생성
                    for i in range(min(len(img_urls), len(img_captions_list))):
                        combined_img_captions.append([img_urls[i], img_captions_list[i]])

                    add_summary_record(user_id, url, title, summary,img_urls, img_captions_list)

                    # 여기서도 배열 대신 단일 객체를 반환하도록 수정
                    return jsonify({'response': summary, 'img_captions': combined_img_captions}), 200

                except Exception as e:
                    print(f"요약 생성 오류: {e}")
                    return jsonify({'error': 'response_summary 요약 생성에 실패했습니다.'}), 500  
            else:
                return jsonify({'error': 'response_summary 요약할 텍스트가 없습니다.'}), 400            
        else:
            return jsonify({'error': 'response_summary JSON 형식의 요청이 아닙니다.'}), 400
    else:
        return jsonify({'error': 'response_summary POST 요청만 허용됩니다.'}), 405
    

from dataProcessing.models import generate_image_caption, translate_text_to_korean

def imgAndCaptions(img_urls):
    """
    이미지 URL 목록을 받아서 각 이미지 URL과 해당 한국어 캡션의 튜플 리스트를 반환합니다.
    
    :param img_urls: 이미지 URL들의 리스트 (예: ["http://example.com/img1.jpg", "http://example.com/img2.png"])
    :return: (이미지 URL, 한국어 캡션) 형태의 튜플 리스트.
             예: [("http://example.com/img1.jpg", "이것은 첫 번째 이미지의 한국어 캡션입니다."), ...]
             오류 발생 시 빈 리스트를 반환합니다.
    """
    if not img_urls:
        return [] # 이미지 URL이 없으면 빈 리스트 반환

    imgs_captions_list = []
    for img_url in img_urls:
        try:
            # 1. 이미지 URL로부터 영어 캡션 생성 (models.py의 generate_image_caption 사용)
            # generate_image_caption은 (PIL Image 객체, 영어 캡션) 또는 (None, 오류 메시지)를 반환
            _, english_caption = generate_image_caption(img_url)

            if english_caption.startswith("imgAndCaptions 이미지 캡셔닝 모델이 로드되지 않았") or \
               english_caption.startswith("imgAndCaptions 이미지 URL 요청 실패") or \
               english_caption.startswith("imgAndCaptions 이미지 파일을 찾을 수 없") or \
               english_caption.startswith("imgAndCaptions 이미지 로드 중 오류 발생") or \
               english_caption.startswith("imgAndCaptions 이미지 캡셔닝 중 오류 발생"):
                # 오류 발생 시 해당 이미지에 대해서는 캡션을 생성하지 않고 건너뜁니다.
                print(f"imgAndCaptions 경고: {img_url} 캡션 생성 중 오류 발생 - {english_caption}")
                continue # 다음 이미지로 넘어감
            
            # 2. 생성된 영어 캡션을 한국어로 번역 (models.py의 translate_text_to_korean 사용)
            korean_caption = translate_text_to_korean(english_caption)

            if korean_caption.startswith("imgAndCaptions 번역 모델이 로드되지 않았") or \
               korean_caption.startswith("imgAndCaptions 번역 중 오류 발생"):
                print(f"imgAndCaptions 경고: {img_url} 번역 중 오류 발생 - {korean_caption}")
                continue # 다음 이미지로 넘어감

            # 3. (원본 이미지 URL, 한국어 캡션) 튜플을 리스트에 추가
            imgs_captions_list.append(korean_caption)

        except Exception as e:
            print(f"imgAndCaptions 이미지 '{img_url}' 처리 중 예상치 못한 오류 발생: {e}")
            # 특정 이미지 처리 중 오류가 나더라도 다른 이미지 처리는 계속 진행
            continue
            
    return imgs_captions_list