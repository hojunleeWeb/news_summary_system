from pytube import YouTube
from pytubefix import YouTube
from pytubefix.cli import on_progress
from pydub import AudioSegment

# pip install pytube
# pip install pytuberfix

def download_youtube_audio(url, output_path="."):
    """
    주어진 유튜브 영상 URL에서 오디오를 추출하여 MP3 파일로 저장합니다.

    Args:
        url (str): 유튜브 영상 URL.
        output_path (str, optional): MP3 파일을 저장할 디렉토리 경로. 기본값은 현재 디렉토리입니다.
    """
    try:
        yt = YouTube(url, on_progress_callback=on_progress)
        yt_title = yt.title
        audio_stream = yt.streams.filter(only_audio=True).first()

        if audio_stream:
            print(f"'{yt.title}' 영상의 오디오를 다운로드합니다...")
            # yt.streams.filter(only_audio=True).all()
            output_file = (
                yt.streams.filter(only_audio=True).first().download(output_path)
            )
            print(f"오디오 다운로드 완료: {output_file}")

            # 파일 확장자를 mp4에서 mp3로 변경
            import os

            base, _ = os.path.splitext(output_file)
            # 파일명 설정
            # new_file = "1" + ".mp3"
            # os.rename(output_file, new_file)
            # print(f"파일 이름을 '{new_file}'로 변경했습니다.")

            # Convert to MP3
            audio = AudioSegment.from_file(output_file)
            audio.export(base + ".mp3", format="mp3")
            os.remove(output_file)
            return base + ".mp3", yt_title
        else:
            print("해당 영상에 오디오 스트림이 없습니다.")
            return None, None

    except Exception as e:
        print(f"오류 발생: {e}")
        return None, None


# if __name__ == "__main__":
#     youtube_url = "https://www.youtube.com/watch?v=W7xUKCRv5is"
#     # 변환한 mp3 파일을 저장할 디렉토리
#     output_directory = "../mp3/"
#     download_youtube_audio(youtube_url, output_directory)
