import requests
import os

url = 'http://localhost:8170/order/start'

response = requests.post(url)
print('Status Code:', response.status_code)

result = response.json()
print('Response:', result)

# voice(mp3) 파일 저장
voice_url = result.get('voice')
if voice_url:
    # 서버가 로컬에서 동작 중이므로 직접 파일을 복사
    # voice_url은 '/static/audio/...' 형태이므로 실제 경로로 변환
    voice_path = voice_url  # 절대경로 그대로 사용
    if voice_path and os.path.exists(voice_path):
        with open(voice_path, 'rb') as src, open('order_start_test.mp3', 'wb') as dst:
            dst.write(src.read())
        print('음성 파일이 order_start_test.mp3로 저장되었습니다.')
        
    else:
        print('음성 파일을 찾을 수 없습니다:', voice_path)
else:
    print('voice 정보가 응답에 없습니다.')
