import requests

BASE_URL = 'http://localhost:8170/product/C1001'  # 예시 상품코드

# PUT(UPDATE) 요청 예시
data = {
    'name': '아이스 아메리카노',
    'price': 2700,
    'description': '시원한 아이스 아메리카노',
    'stock': 100
}
put_response = requests.put(BASE_URL, json=data)
print('PUT Status Code:', put_response.status_code)
print('PUT Response:', put_response.json())

# DELETE 요청 예시
delete_response = requests.delete(BASE_URL)
print('DELETE Status Code:', delete_response.status_code)
print('DELETE Response:', delete_response.json())
