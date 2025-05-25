import json


def capimg(img_url):
    from transformers import BlipProcessor, BlipForConditionalGeneration
    from PIL import Image
    import requests

    # 이미지 불러오기 (URL 또는 파일 경로 사용 가능)
    if img_url.startswith("http://") or img_url.startswith("https://"):
        image = Image.open(requests.get(img_url, stream=True).raw)
    else:
        image = Image.open(img_url)

    # 모델과 프로세서 불러오기
    processor = BlipProcessor.from_pretrained(
        "Salesforce/blip-image-captioning-base", use_fast=True
    )
    model = BlipForConditionalGeneration.from_pretrained(
        "Salesforce/blip-image-captioning-base"
    )

    # 이미지 캡셔닝 수행
    inputs = processor(image, return_tensors="pt")
    out = model.generate(**inputs)
    caption = processor.decode(out[0], skip_special_tokens=True)

    return caption


def translate_caption_to_korean(caption):
    from transformers import pipeline

    translator = pipeline(
        "translation",
        model="NHNDQ/nllb-finetuned-en2ko",
        device=0,
        src_lang="eng_Latn",
        tgt_lang="kor_Hang",
        max_length=512,
    )
    print("영문 캡션:", caption)  # 디버깅용
    text = f">>eng_Latn<< {caption.strip()}"
    output = translator(text, max_length=512)
    translated_caption = output[0]["translation_text"]
    print("최종 한국어 캡션:", translated_caption)  # 디버깅용
    return translated_caption


def save_caption_history(
    img_url, caption, korean_caption, json_path="caption_history.json"
):
    # 캡션 기록을 JSON 파일에 저장
    history = []
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            history = json.load(f)
    except FileNotFoundError:
        pass

    history.append(
        {"img_url": img_url, "caption": caption, "korean_caption": korean_caption}
    )

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    img_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Full_English_breakfast_at_the_Chalet_Cafe%2C_Cowfold%2C_West_Sussex%2C_England.jpg/960px-Full_English_breakfast_at_the_Chalet_Cafe%2C_Cowfold%2C_West_Sussex%2C_England.jpg"

    # 이미 캡셔닝한 기록이 있는 경우
    found = False
    try:
        with open("caption_history.json", "r", encoding="utf-8") as f:
            history = json.load(f)
            # history가 리스트가 아니면 리스트로 변환
            if not isinstance(history, list):
                history = [history]
            for entry in history:
                if isinstance(entry, dict) and entry.get("img_url") == img_url:
                    print("이미 캡셔닝한 기록이 있습니다.")
                    print("Caption:", entry.get("caption"))
                    print("Korean Caption:", entry.get("korean_caption"))
                    found = True
                    break
    except (FileNotFoundError, json.JSONDecodeError):
        history = []

    if not found:
        caption = capimg(img_url)
        print("Caption:", caption)
        korean_caption = translate_caption_to_korean(caption)
        print("Korean Caption:", korean_caption)
        save_caption_history(
            img_url, caption, korean_caption, json_path="caption_history.json"
        )
