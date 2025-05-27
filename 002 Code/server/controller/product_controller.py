from flask import Blueprint, request, jsonify
from service.product_service import (
    add_product_service,
    get_all_products_service,
    get_product_by_code_service,
    update_product_service,
    delete_product_service
)

product_bp = Blueprint('product', __name__)


@product_bp.route('/add-product', methods=['POST'])
def add_product():
    data = request.get_json()
    print(f"Received data: {data}")  # Debugging line to check incoming data
    try:
        product_dict = add_product_service(data)
        return jsonify({'message': '상품이 등록되었습니다.', 'product': product_dict}), 201
    except (KeyError, TypeError) as e:
        return jsonify({'error': f'잘못된 데이터 형식입니다.{e}'}), 400


@product_bp.route('/products', methods=['GET'])
def get_all_products():
    try:
        products = get_all_products_service()
        return jsonify(products), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@product_bp.route('/product/<string:code>', methods=['GET'])
def get_product(code):
    product = get_product_by_code_service(code)
    if product:
        return jsonify({'product': product}), 200
    else:
        return jsonify({'error': '상품을 찾을 수 없습니다.'}), 404


@product_bp.route('/product/<string:code>', methods=['PUT'])
def update_product(code):
    data = request.get_json()
    updated = update_product_service(code, data)
    if updated:
        return jsonify({'message': '상품이 수정되었습니다.', 'product': updated}), 200
    else:
        return jsonify({'error': '상품을 찾을 수 없습니다.'}), 404


@product_bp.route('/product/<string:code>', methods=['DELETE', 'OPTIONS'])
def delete_product(code):
    if request.method == 'OPTIONS':
        # Preflight 요청에 대한 응답
        return '', 200
    
    deleted = delete_product_service(code)
    if deleted:
        return jsonify({'message': '상품이 삭제되었습니다.'}), 200
    else:
        return jsonify({'error': '상품을 찾을 수 없습니다.'}), 404
