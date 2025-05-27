import requests
from gtts import gTTS

# 서버 주소
URL = "http://localhost:11434/api/chat"

# 대화할 때마다 role, content 형태의 messages 리스트를 보냅니다.
payload = {
    "model": "llama3.2:1b",
    "messages": [
        {"role": "system", "content": "당신은 키오스크 주문 도우미입니다."},
        {"role": "user",   "content": "안녕하세요, 주문 도와주세요."}
    ],
    "stream": False  # True로 하면 응답을 스트리밍으로 받을 수 있습니다.
}

# 헤더에 Content-Type 만 지정하면 됩니다.
headers = {
    "Content-Type": "application/json"
}

response = requests.post(URL, json=payload, headers=headers)

if response.status_code == 200:
    data = response.json()
    print("Response:", data)
    # LLM 답변 추출 및 gTTS로 mp3 저장
    # ollama의 응답 구조에 따라 content 위치가 다를 수 있음
    try:
        # ollama의 응답이 {'message': {'content': ...}} 또는 {'content': ...} 형태일 수 있음
        if 'message' in data and 'content' in data['message']:
            llm_content = data['message']['content']
        elif 'content' in data:
            llm_content = data['content']
        else:
            llm_content = str(data)
        print('LLM 답변:', llm_content)
        tts = gTTS(text=llm_content, lang='ko')
        tts.save('ollama-test-response.mp3')
        print('음성 파일이 ollama-test-response.mp3로 저장되었습니다.')
    except Exception as e:
        print('gTTS 변환 오류:', e)
else:
    print(f"Error {response.status_code}:", response.text)
