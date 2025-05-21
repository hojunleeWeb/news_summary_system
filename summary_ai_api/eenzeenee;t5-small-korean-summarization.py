# Load model directly
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

tokenizer = AutoTokenizer.from_pretrained("eenzeenee/t5-small-korean-summarization")
model = AutoModelForSeq2SeqLM.from_pretrained("eenzeenee/t5-small-korean-summarization")


def generate_summary(image_path, text):
    """
    Generate a summary of the given text using a pre-trained model.

    Args:
        image_path (str): Path to the image (not used in this function).
        text (str): The text to summarize.

    Returns:
        str: The generated summary.
    """
    # Preprocess the text
    inputs = tokenizer(text, return_tensors="pt", max_length=512, truncation=True)

    # Generate summary
    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=150,
        min_length=30,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True,
    )

    # Decode the summary
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    return summary


# test summarization
if __name__ == "__main__":
    image_path = "NISI20250520_0001847235_web_20250520160759_20250521040026553.jpg"
    text = """[서울=뉴시스]이소원 인턴 기자 = 치어리딩 동작을 시도하다 교통사고에 준하는 중상을 입은 한 영국 여성이 재활 끝에 마라톤을 완주한 사연이 전해졌다.

13일(현지 시각) 영국 매체 데일리메일에 따르면 영국 맨체스터에 거주하는 치어리더 로지 고먼(22·여)은 과거 치어리딩 연습을 하다 정강이를 나무 장벽에 부딪치는 사고를 당해 다시는 걷지 못할 수 있다는 진단을 받았지만 꾸준한 재활을 거쳐 맨체스터 마라톤을 완주했다.

고먼이 마라톤을 완주한 건 사고가 발생한 지 약 2년 만이다.

그녀는 "의사들은 다시는 달릴 수 없다고 했지만 그럼에도 제가 마라톤을 완주한 사실이 믿기지 않는다"며 "완주 후 기쁨의 눈물을 흘렸다"고 말했다.

앞서 고먼은 평소 익숙하게 해왔던 백플립(backflip·제자리에서 뒤로 공중제비를 도는 동작)을 시도하다 90㎝ 높이의 나무 장벽에 정강이를 부딪치는 사고를 당한 뒤 구획증후군을 진단받은 바 있다. 구획증후군은 다리 근육의 부기가 혈류를 차단해 조직이 괴사하거나 심한 경우 감염으로 이어져 절단해야 하는 질환이다.

당시 주치의는 그녀에게 "부상이 교통사고를 당한 수준이다"라며 "이 다리로 치어리딩은 물론 걷기도 어려울 것"이라고 진단했다.

그러나 고먼은 수 주간 침대에 누워 지내며 통증과 싸웠고 이후 고강도 재활훈련과 근력 회복 운동에 매진했다. 그렇게 그녀는 모두의 예상을 깨고 사고 발생 5개월 만에 다시 백플립에 성공했고 이달 초 마라톤에도 출전해 완주에 성공했다.

현재 개인 트레이너로 활동하는 고먼은 인터뷰에서 자신과 같은 고통을 겪는 이들에게 "끝까지 버티면 새로운 길은 분명히 있다"면서 "재활 후의 몸이 예전보다 건강해질 것이라고 믿어라"라고 조언했다.

이소원 인턴 기자(cometrue@newsis.com)"""
    summary = generate_summary(image_path, text)
    
    # write a json with text-summary pair
    with open("summary.json", "w") as f:
        f.write('{"text": "' + text.replace('"', '\\"') + '", "summary": "' + summary.replace('"', '\\"') + '"}')
        
    # print the summary
    print(summary)
