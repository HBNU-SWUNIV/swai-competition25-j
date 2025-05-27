class ProductDTO:
    """
    키오스크 상품 등록을 위한 데이터 전송 객체
    """
    def __init__(self, code: str, name: str, price: int, description: str, category: str = None, stock: int = 0, image_url: str = None, is_active: bool = True, created_at: str = None):
        self.code = code  # 상품코드
        self.name = name  # 상품명
        self.price = price  # 금액
        self.description = description  # 설명
        self.category = category  # 카테고리
        self.stock = stock  # 재고
        self.image_url = image_url  # 이미지 URL
        self.is_active = is_active  # 활성화 여부
        self.created_at = created_at  # 등록일

    def __repr__(self):
        return f"<ProductDTO name={self.name} price={self.price} code={self.code} category={self.category} stock={self.stock} active={self.is_active}>"
