from typing import Any, Dict, List
import json
import os
from dto.product_dto import ProductDTO

PRODUCTS_FILE = os.path.join('static', 'product', 'products.json')
os.makedirs(os.path.dirname(PRODUCTS_FILE), exist_ok=True)

def load_products() -> List[Dict[str, Any]]:
    """
    products.json 파일에서 상품 리스트를 불러오거나, 파일이 없으면 빈 리스트 반환
    """
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_products(products: List[Dict[str, Any]]):
    """
    상품 리스트를 products.json 파일에 저장
    """
    with open(PRODUCTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

def add_product_service(data: Dict) -> Dict:
    product = ProductDTO(
        name=data['name'],
        price=data['price'],
        description=data['description'],
        code=data['code'],
        category=data.get('category'),
        stock=data.get('stock', 0),
        image_url=data.get('image_url'),
        is_active=data.get('is_active', True),
        created_at=data.get('created_at')
    )
    products = load_products()
    
    # 중복 체크: code가 같은 상품이 이미 있으면 제거
    products = [p for p in products if p.get('code') != product.code]
    products.append(product.__dict__)
    save_products(products)

    return product.__dict__

def get_all_products_service() -> list[dict]:
    """
    products.json 파일의 모든 상품 정보를 반환
    """
    return load_products()

def get_product_by_code_service(code: str) -> dict | None:
    products = load_products()
    for product in products:
        if product.get('code') == code:
            return product
    return None

def update_product_service(code: str, data: dict) -> dict | None:
    products = load_products()
    updated = None
    for i, product in enumerate(products):
        if product.get('code') == code:
            # 기존 값에서 전달된 값만 업데이트
            product.update({k: v for k, v in data.items() if k in product})
            products[i] = product
            updated = product
            break
    if updated:
        save_products(products)
    return updated

def delete_product_service(code: str) -> bool:
    products = load_products()
    new_products = [p for p in products if p.get('code') != code]
    if len(new_products) != len(products):
        save_products(new_products)
        return True
    return False
