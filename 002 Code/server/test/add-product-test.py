import requests

url = 'http://localhost:8170/add-product'

data = {
    'name': '아메리카노',
    'price': 2500,
    'description': '진한 에스프레소와 물의 조화',
    'code': 'C1001',
    'category': '음료',
    'stock': 50,
    'image_url': 'http://example.com/image.jpg',
    'is_active': True,
    'created_at': '2025-05-26'
}

response = requests.post(url, json=data)
print('Status Code:', response.status_code)
print('Response:', response.json())
