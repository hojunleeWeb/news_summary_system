import whisper
import os

def transcribe_audio(audio_file_path, model_name="base"):
    """
    Whisper 모델을 사용하여 오디오 파일을 텍스트로 변환합니다.

    Args:
        audio_file_path (str): 텍스트로 변환할 오디오 파일 경로 (.mp3, .wav 등).
        model_name (str, optional): 사용할 Whisper 모델의 이름 (tiny, base, small, medium, large).
        기본값은 "base"입니다. 더 높은 성능을 원하면 "large"를 사용할 수 있지만,
        더 많은 컴퓨팅 자원을 필요로 합니다.

    Returns:
        str: 변환된 텍스트 데이터. 오류 발생 시 None을 반환합니다.
    """
    try:
        # Whisper 모델 로드
        model = whisper.load_model(model_name)

        print(f"'{audio_file_path}' 파일을 '{model_name}' 모델로 변환합니다...")
        # 오디오 파일 트랜스크립션
        result = model.transcribe(audio_file_path, fp16=False)
        print("텍스트 변환 완료.")
        return result["text"]

    except FileNotFoundError:
        print(f"오류: '{audio_file_path}' 파일을 찾을 수 없습니다.")
        return None
    except Exception as e:
        print(f"오류 발생: {e}")
        return None

if __name__ == "__main__":
    audio_file = "./server/utils/temp/1.mp3"
    #model_to_use = input("사용할 Whisper 모델을 선택하세요 (tiny, base, small, medium, large, 기본값: base): ") or "base"
    model_to_use = "base"

    transcribed_text = transcribe_audio(audio_file, model_to_use)

    if transcribed_text:
        print("\n변환된 텍스트:")
        print(transcribed_text)

        # (선택 사항) 변환된 텍스트를 파일에 저장
        save_to_file ='y'
        if save_to_file == 'y':
            output_text_file = os.path.splitext(audio_file)[0] + ".txt"
            with open(output_text_file, "w", encoding="utf-8") as f:
                f.write(transcribed_text)
            print(f"텍스트가 '{output_text_file}'에 저장되었습니다.")