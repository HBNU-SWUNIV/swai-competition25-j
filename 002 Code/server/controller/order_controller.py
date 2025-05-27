from flask import Blueprint, jsonify, request, send_file
from service.order_service import start_order_service, handle_select_menu_service, handle_voice_input_service, complete_order_service, cancel_order_service

order_bp = Blueprint('order', __name__)

@order_bp.route('/order/start', methods=['GET'])
def start_order():
    result = start_order_service()
    return jsonify(result), 200


@order_bp.route('/order/select-menu', methods=['POST'])
def select_menu():
    data = request.get_json()
    session_id = data.get('session_id')
    product_code = data.get('product_code')
    result = handle_select_menu_service(session_id, product_code)
    if 'error' in result:
        from service.order_service import order_sessions
        print(f"/order/select-menu error: {result['error']}")
        print(f"전달된 session_id: {session_id}")
        print(f"현재 order_sessions: {order_sessions}")
        return jsonify(result), 400
    
    return jsonify(result), 200


@order_bp.route('/order/voice', methods=['POST'])
def order_voice():
    data = request.get_json()
    session_id = data.get('session_id')
    voice = data.get('voice')
    result = handle_voice_input_service(session_id, voice)
    if 'error' in result:
        print("에러 발생", result['error'])
        return jsonify(result), 400
    
    return jsonify(result), 200


@order_bp.route('/order/get-voice/<string:filename>', methods=['GET'])
def get_voice_file(filename):
    """
    오디오 파일을 audio/mpeg 형태로 반환
    """
    import os
    audio_path = os.path.join('static', 'audio', filename)
    if not os.path.exists(audio_path):
        return jsonify({'error': '파일을 찾을 수 없습니다.'}), 404
    return send_file(audio_path, mimetype='audio/mpeg')

@order_bp.route('/order/complete', methods=['POST'])
def complete_order():
    data = request.get_json()
    session_id = data.get('session_id')
    result = complete_order_service(session_id)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 200

@order_bp.route('/order/cancel', methods=['POST'])
def cancel_order():
    data = request.get_json()
    session_id = data.get('session_id')
    result = cancel_order_service(session_id)
    if 'error' in result:
        return jsonify(result), 400
    return jsonify(result), 200
