# models.py

import torch
from transformers import BlipProcessor, BlipForConditionalGeneration, pipeline
from PIL import Image
import requests
import io
import os # 모델 캐싱 경로 설정을 위해 필요할 수 있음

# 모델 객체들을 저장할 변수
_blip_processor = None
_blip_model = None
_nllb_translator = None

def load_models():
    """
    애플리케이션 시작 시 모델을 로드하고 전역 변수에 할당합니다.
    이 함수는 한 번만 호출되어야 합니다.
    """
    global _blip_processor, _blip_model, _nllb_translator

    if _blip_processor and _blip_model and _nllb_translator:
        print("모델이 이미 로드되어 있습니다.")
        return

    print("모델 로드 중... (models.py)")
    try:
        _blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base", use_fast=True)
        _blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")
        if torch.cuda.is_available():
            _blip_model.to("cuda")
            print("load_models BLIP 모델 GPU로 로드 완료.")
        else:
            print("load_models BLIP 모델 CPU로 로드 완료 (GPU 없음).")
    except Exception as e:
        print(f"BLIP 모델 로드 실패: {e}")
        _blip_processor, _blip_model = None, None # 로드 실패 시 None으로 설정

    try:
        if torch.cuda.is_available():
            _nllb_translator = pipeline(
                "translation",
                model="NHNDQ/nllb-finetuned-en2ko",
                device=0, # GPU 사용
                src_lang="eng_Latn",
                tgt_lang="kor_Hang",
                max_length=512,
            )
            print("NLLB 번역 모델 GPU로 로드 완료.")
        else:
            _nllb_translator = pipeline(
                "translation",
                model="NHNDQ/nllb-finetuned-en2ko",
                device=-1, # CPU 사용
                src_lang="eng_Latn",
                tgt_lang="kor_Hang",
                max_length=512,
            )
            print("load_models NLLB 번역 모델 CPU로 로드 완료 (GPU 없음).")
    except Exception as e:
        print(f"load_models NLLB 번역 모델 로드 실패: {e}")
        _nllb_translator = None # 로드 실패 시 None으로 설정


def get_blip_processor():
    """로드된 BLIP 프로세서 인스턴스를 반환합니다."""
    return _blip_processor

def get_blip_model():
    """로드된 BLIP 모델 인스턴스를 반환합니다."""
    return _blip_model

def get_nllb_translator():
    """로드된 NLLB 번역기 인스턴스를 반환합니다."""
    return _nllb_translator


def generate_image_caption(img_url):
    """
    이미지 URL로부터 영어 캡션을 생성합니다.
    로드된 BLIP 모델을 사용합니다.
    """
    processor = get_blip_processor()
    model = get_blip_model()

    if processor is None or model is None:
        return None, "이미지 캡셔닝 모델이 로드되지 않았습니다. 관리자에게 문의하세요."

    try:
        if img_url.startswith("http://") or img_url.startswith("https://"):
            response = requests.get(img_url, stream=True, timeout=10)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
        else:
            image = Image.open(img_url).convert("RGB")
    except requests.exceptions.RequestException as e:
        return None, f"이미지 URL 요청 실패: {e}"
    except FileNotFoundError:
        return None, f"이미지 파일을 찾을 수 없습니다: {img_url}"
    except Exception as e:
        return None, f"이미지 로드 중 오류 발생: {e}"

    try:
        inputs = processor(image, return_tensors="pt")
        if model.device.type == 'cuda':
            inputs = {k: v.to(model.device) for k, v in inputs.items()}

        out = model.generate(**inputs)
        caption = processor.decode(out[0], skip_special_tokens=True)
        return image, caption
    except Exception as e:
        return image, f"이미지 캡셔닝 중 오류 발생: {e}"

def translate_text_to_korean(text):
    """
    주어진 영어 텍스트를 한국어로 번역합니다.
    로드된 NLLB 번역 모델을 사용합니다.
    """
    translator = get_nllb_translator()

    if translator is None:
        return "번역 모델이 로드되지 않았습니다. 관리자에게 문의하세요."

    print("영문 캡션 (번역 요청):", text)
    input_text = f">>eng_Latn<< {text.strip()}"
    try:
        output = translator(input_text, max_length=512)
        translated_text = output[0]["translation_text"]
        print("translate_text_to_korean 최종 한국어 캡션 (번역 완료):", translated_text)
        return translated_text[5:]
    except Exception as e:
        return f"translate_text_to_korean 번역 중 오류 발생: {e}"