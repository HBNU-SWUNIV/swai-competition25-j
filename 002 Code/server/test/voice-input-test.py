import requests

# 1. 주문 세션 생성
start_url = 'http://localhost:8170/order/start'
start_response = requests.get(start_url)
start_data = start_response.json()
session_id = start_data.get('session_id')
print('주문 세션 생성:', session_id)

# 2. 음성 텍스트(이미 변환된 STT 결과) 테스트
voice_url = 'http://localhost:8170/order/voice'

# 이미 변환된 텍스트 예시
voice_text = '맥주 있나요?'

data = {'session_id': session_id, 'voice': voice_text}
response = requests.post(voice_url, json=data)
print('Status Code:', response.status_code)
result = response.json()
print('Response:', result)
print('\n--- LLM 응답 ---')
print(result.get('llm_response'))
