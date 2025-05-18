import tempfile
import video_transform_to_mp3 as v2m
import mp3_tranform_to_text as m2t

if __name__ == "__main__":
    with tempfile.TemporaryDirectory() as tmpdirname:
        mp3f = v2m.download_youtube_audio(
            "https://youtu.be/8NGajIXTZZQ?si=8SNQr9u3I0YQ3kRG", tmpdirname
        )
        print(m2t.transcribe_audio(mp3f))
