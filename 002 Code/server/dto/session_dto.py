class SessionDTO:
    """
    주문 세션에 대한 정보를 담는 DTO
    """
    def __init__(self, session_id: str, status: str = 'active', selected_menu: list = None, step: str = 'start'):
        self.session_id = session_id  # 세션 ID
        self.status = status  # 세션 상태 (active, completed, cancelled 등)
        self.selected_menu = selected_menu if selected_menu is not None else []  # 현재까지 선택한 메뉴 리스트
        self.step = step  # 현재 주문 단계 (예: start, select_menu, confirm, payment 등)

    def to_dict(self):
        return {
            'session_id': self.session_id,
            'status': self.status,
            'selected_menu': self.selected_menu,
            'step': self.step
        }
