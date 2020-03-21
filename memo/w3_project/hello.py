import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
data = requests.get('https://www.genie.co.kr/chart/top200?ditc=D&rtm=N&ymd=20200309', headers=headers)

soup = BeautifulSoup(data.text, 'html.parser')

songs = soup.select('#body-content> div.newest-list > div.music-list-wrap > table > tbody > tr')

index = 1
for song in songs:
    # movie 안에 a 가 있으면,
    song_tag = song.select_one('td.info > a.title')
    artist_tag = song.select_one('td.info > a.artist')
    # artist_tag = song.select_one('td.info > a.artist ')
    if song_tag is not None:
        song_name = song_tag.text.replace(" ", "").replace("\n", "");
        artist_name = artist_tag.text
        print( repr(index) + ' / ' + song_name + ' / ' + artist_name)
        index += 1