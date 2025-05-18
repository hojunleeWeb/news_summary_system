import tempfile
import video_transform_to_mp3 as v2m
import mp3_tranform_to_text as m2t
import get_summary as gs


def vidsumm(url: str):
    with tempfile.TemporaryDirectory() as tmpdirname:
        mp3f = v2m.download_youtube_audio(url, tmpdirname)
        a2t = m2t.transcribe_audio(mp3f)
        summ = gs.generate_summary(a2t)
        return summ


if __name__ == "__main__":
    a2t, summ = vidsumm("https://youtu.be/8NGajIXTZZQ?si=8SNQr9u3I0YQ3kRG")
    print(a2t)
    print(summ)
