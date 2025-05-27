import uuid
from dto.session_dto import SessionDTO
from dto.order_response_dto import OrderResponseDTO
from gtts import gTTS
import os
import json
import requests
from faster_whisper import WhisperModel  

# 인메모리 세션 저장소
order_sessions = {}

# -------------------- 상수 및 설정 --------------------
AUDIO_DIR = "static/audio"
ORDER_MESSAGE_PRODUCT_ADDED = "상품이 추가되었습니다."
ORDER_MESSAGE_PRODUCT_NOT_FOUND = "말씀하신 상품은 존재하지 않네요. 다른 상품을 말씀해 주세요."
os.makedirs(AUDIO_DIR, exist_ok=True)

# -------------------- Private 함수 --------------------
def __create_tts_voice(text: str, filename: str, reuse: bool = True) -> str:
    """
    TTS로 음성 파일을 생성하고, 재사용 옵션에 따라 파일을 반환
    :param text: 음성으로 변환할 텍스트
    :param filename: 저장할 파일명 (확장자 포함)
    :param reuse: True면 파일이 없을 때만 생성, False면 항상 새로 생성
    :return: 절대경로
    """
    audio_path = os.path.join(AUDIO_DIR, filename)
    if not reuse or not os.path.exists(audio_path):
        tts = gTTS(text=text, lang='ko')
        tts.save(audio_path)
        
    return os.path.abspath(audio_path)

def __stt_with_faster_whisper(voice_file_path: str) -> str:
    """
    faster-whisper로 음성 파일을 텍스트로 변환
    """
    model = WhisperModel('base', device="cpu", compute_type="int8")
    segments, info = model.transcribe(voice_file_path, language='ko')
    recognized_text = "".join([segment.text for segment in segments])
    return recognized_text

def __extract_json_list(path: str) -> list:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def __extract_product_brief_list() -> list[dict]:
    """
    products.json에서 ProductDTO의 name, code, description, category만 추출하여 리스트 반환
    """
    products_data = __extract_json_list(os.path.join('static', 'product', 'products.json'))
    return [
        {
            'name': p.get('name'),
            'id': p.get('code'),
            'description': p.get('description'),
            'category': p.get('category')
        } for p in products_data
    ]

def __extract_product_codes() -> list[str]:
    """
    products.json에서 상품 코드만 추출하여 리스트로 반환
    """
    products_data = __extract_json_list(os.path.join('static', 'product', 'products.json'))
    return [p.get('code') for p in products_data if 'code' in p]


def __build_ollama_payload(product_brief_list: list[dict], recognized_text: str) -> dict:
    """
    ollama LLM에 전달할 system/user role 메시지 payload 생성
    """
    print(f"[DEBUG] recognized_text(test): {recognized_text}")
    system_prompt = f"다음은 상품 목록입니다.\n{json.dumps(product_brief_list, ensure_ascii=False)}"
    user_prompt = f'''
        사용자 주문: {recognized_text}
        전달한 상품 목록 중에 사용자 주문에 해당하는 상품이 있는지 확인해줘.
        사용자 주문을 분석하고, 상품 목록의 상품명, 상품 설명을 고려해.
        만약 상품이 있다면 상품의 id 값을 알려주고
        없다면 'not found' 라고 응답해줘.
        예시(상품이 있을 경우): "아메리카노 있어?" -> "id": "C1001"
        예시(상품이 없을 경우): "아메리카노 있어?" -> "not found"
        주의사항은 다음과 같아:
            상품이 있을경우 반드시 id 값을 포함해야하고, 없다면 'not found'를 포함한 응답을 해야해.
            python, cpp와 같은 코드를 원하는 것이 아니야. 상품 목록에 있는 id 값을 원하는 거야.
    '''
    payload = {
        "model": "llama3.1:8b",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "stream": False
    }
    return payload


def __request_ollama_llm(ollama_payload: dict) -> str:
    """
    ollama LLM에 payload를 POST로 전달하고, content만 반환
    """
    headers = {"Content-Type": "application/json"}
    response = requests.post("http://localhost:11434/api/chat", json=ollama_payload, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data.get('message', {}).get('content') or data.get('content') or str(data)
    else:
        return f"LLM 오류: {response.status_code}"


def __find_product_code_in_llm_response(llm_content: str, product_codes: list[str]) -> str | None:
    """
    LLM 응답에서 상품 코드가 포함되어 있는지 대조하여 반환
    우선적으로 'not found'가 있으면 None 반환
    """
    if 'not found' in llm_content:
        return None
    for code in product_codes:
        if code and code in llm_content:
            return code
    return None


def __get_voice_for_matched_code(matched_code: str) -> str:
    """
    matched_code가 None이면 안내 음성 파일을 생성/반환,
    아니면 select_menu.mp3 파일 경로 반환
    message와 음성 파일 엔드포인트 URL을 튜플로 반환
    """
    if matched_code is None:
        filename = "not_found.mp3"
        message = ORDER_MESSAGE_PRODUCT_NOT_FOUND
        audio_path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(audio_path):
            tts = gTTS(text=message, lang='ko')
            tts.save(audio_path)
        voice_url = f"/order/get-voice/{filename}"
        return voice_url
    else:
        message = ORDER_MESSAGE_PRODUCT_ADDED
        filename = "select_menu.mp3"
        select_menu_path = os.path.join(AUDIO_DIR, filename)
        if not os.path.exists(select_menu_path):
            tts = gTTS(text=message, lang='ko')
            tts.save(select_menu_path)
        voice_url = f"/order/get-voice/{filename}"
        return voice_url


def __add_product_to_session(session_id: str, product_code: str) -> bool:
    """
    세션에 상품 코드 추가 (product_code가 None이 아닐 때만)
    성공 시 True, 실패 시 False 반환
    추가 후 세션의 선택한 상품 리스트를 print로 출력
    """
    if product_code is None:
        return False
    session: SessionDTO = order_sessions.get(session_id)
    if session:
        session.selected_menu.append(product_code)
        session.step = 'select_menu'
        print(f"[세션 {session_id}] 선택한 상품 목록: {session.selected_menu}")
        return True
    return False

# -------------------- Public 서비스 함수 --------------------
def start_order_service() -> dict:
    """
    주문 시작 시 세션 ID를 생성하고, 안내 메시지와 음성(wav) 파일을 반환 (gTTS 사용)
    """
    session_id = str(uuid.uuid4())
    order_session = SessionDTO(session_id=session_id)
    order_sessions[session_id] = order_session
    message = "메뉴를 선택 혹은 말씀해 주세요"
    filename = "order_start.mp3"
    __create_tts_voice(message, filename, reuse=True)
    # 엔드포인트 URL로 반환
    voice_url = f"/order/get-voice/{filename}"
    response_dto = OrderResponseDTO(session_id=session_id, message=message, voice=voice_url)
    return response_dto.to_dict()


def get_order_session(session_id: str) -> dict | None:
    session: SessionDTO = order_sessions.get(session_id)
    return session.to_dict() if session else None


def end_order_session(session_id: str):
    order_sessions.pop(session_id, None)


def handle_select_menu_service(session_id: str, product_code: str) -> dict:
    added = __add_product_to_session(session_id, product_code)
    if not added:
        return {'error': '세션이 존재하지 않습니다.'}
    message = ORDER_MESSAGE_PRODUCT_ADDED
    filename = "select_menu.mp3"
    __create_tts_voice(message, filename, reuse=True)
    voice_url = f"/order/get-voice/{filename}"
    response_dto = OrderResponseDTO(session_id=session_id, message=message, voice=voice_url)
    return response_dto.to_dict()


def handle_voice_input_service(session_id: str, voice: str) -> dict:
    # 1. 세션 유효성 검사
    session: SessionDTO = order_sessions.get(session_id)
    if not session:
        return {'error': '세션이 존재하지 않습니다.'}
    
    # 2. 상품 요약 리스트 추출
    product_brief_list = __extract_product_brief_list()
    
    # 3. Ollama LLM에 전달할 payload 생성
    ollama_payload = __build_ollama_payload(product_brief_list, voice)
    
    # 4. Ollama LLM에 요청 및 응답 추출
    llm_content = __request_ollama_llm(ollama_payload)

    print("-----------", llm_content)

    # 5. LLM 응답에서 상품 코드 대조
    product_codes = __extract_product_codes()
    matched_code = __find_product_code_in_llm_response(llm_content, product_codes)

    voice = __get_voice_for_matched_code(matched_code) # voice 생성

    # # 6. matched_code가 있으면 세션에 상품 추가
    # __add_product_to_session(session_id, matched_code)
    
    # 7. 결과 반환 (session_id, code만 반환, code는 None일 수 있음)
    return {
        'session_id': session_id,
        'code': matched_code,
        'voice': voice
    }


def complete_order_service(session_id: str) -> dict:
    """
    주문 완료: 세션을 order_sessions에서 제거
    완료 후 현재 order_sessions 딕셔너리의 모든 값을 print로 출력
    """
    if session_id in order_sessions:
        del order_sessions[session_id]
        print(f"[주문 완료] 현재 order_sessions: {order_sessions}")
        return {'message': '주문이 완료되었습니다.'}
    else:
        print(f"[주문 완료 실패] 현재 order_sessions: {order_sessions}")
        return {'error': '유효하지 않은 세션입니다.'}

def cancel_order_service(session_id: str) -> dict:
    """
    주문 취소: 세션을 order_sessions에서 제거
    취소 후 현재 order_sessions 딕셔너리의 모든 값을 print로 출력
    """
    if session_id in order_sessions:
        del order_sessions[session_id]
        print(f"[주문 취소] 현재 order_sessions: {order_sessions}")
        return {'message': '주문이 취소되었습니다.'}
    else:
        print(f"[주문 취소 실패] 현재 order_sessions: {order_sessions}")
        return {'error': '유효하지 않은 세션입니다.'}
