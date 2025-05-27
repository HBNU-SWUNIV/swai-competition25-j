import requests
import base64
import os

# 1. 먼저 주문 세션을 생성
start_url = 'http://localhost:8170/order/start'
start_response = requests.post(start_url)
start_data = start_response.json()
session_id = start_data.get('session_id')
print('주문 세션 생성:', session_id)

# 2. 상품 코드 선택 테스트
select_menu_url = 'http://localhost:8170/order/select-menu'
product_code = 'C1001'  # 테스트용 상품 코드
select_data = {
    'session_id': session_id,
    'product_code': product_code
}
select_response = requests.post(select_menu_url, json=select_data)
print('Status Code:', select_response.status_code)
print('Response:', select_response.json())
