class OrderResponseDTO:
    """
    주문 관련 응답 DTO (session_id, message, voice)
    """
    def __init__(self, session_id: str, message: str, voice: str):
        self.session_id = session_id
        self.message = message
        self.voice = voice

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'message': self.message,
            'voice': self.voice
        }
