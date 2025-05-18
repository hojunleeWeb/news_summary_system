from pytubefix import YouTube
import os


def download_audio_stream(youtube_url, output_folder):
    '''
    youtube_url: URL to a YouTube vid\n
    output_folder: where to save it
    '''
    yt = YouTube(youtube_url)
    audio_stream = yt.streams.filter(only_audio=True).first()
    if not audio_stream:
        print("Unable to locate any audio stream.")
        return None
    downloaded_file = audio_stream.download(output_path=output_folder)
    print(f"Completed: {downloaded_file}")
    return downloaded_file