import requests

url = 'http://localhost:8170/products'

response = requests.get(url)
print('Status Code:', response.status_code)
print('Response:', response.json())
