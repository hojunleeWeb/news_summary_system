import json
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import requests


def capimg(img_url, json_path=None):
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

    # 결과를 JSON 파일에 저장
    if json_path:
        result = {"img_url": img_url, "caption": caption}
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not isinstance(data, list):
                    data = [data]
        except (FileNotFoundError, json.JSONDecodeError):
            data = []
        data.append(result)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

    return caption


if __name__ == "__main__":
    img_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/%D0%A2%D0%B0%D1%80%D0%B0%D1%81%D1%96%D0%B2_%D0%BE%D0%B1%D1%80%D1%96%D0%B9._%D0%A1%D0%B2%D1%96%D1%82%D0%B0%D0%BD%D0%BE%D0%BA_%28edited%29.jpg/960px-%D0%A2%D0%B0%D1%80%D0%B0%D1%81%D1%96%D0%B2_%D0%BE%D0%B1%D1%80%D1%96%D0%B9._%D0%A1%D0%B2%D1%96%D1%82%D0%B0%D0%BD%D0%BE%D0%BA_%28edited%29.jpg"
    caption = capimg(img_url, json_path="caption_history.json")
    print("Caption:", caption)
