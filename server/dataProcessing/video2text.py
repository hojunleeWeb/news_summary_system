import tempfile
import dataProcessing.mp32text as m2t
from dataProcessing.video2mp3 import download_youtube_audio

def video2text(url: str):
    with tempfile.TemporaryDirectory() as tmpdirname:
        mp3f, video_title = download_youtube_audio(url, tmpdirname)
        a2t = m2t.transcribe_audio(mp3f)
        return a2t, video_title

