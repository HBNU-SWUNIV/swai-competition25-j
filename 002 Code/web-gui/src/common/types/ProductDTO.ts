export interface ProductDTO {
  code: string; // 상품코드
  name: string; // 상품명
  price: number; // 금액
  description: string; // 설명
  category?: string; // 카테고리
  stock: number; // 재고
  image_url?: string; // 이미지 URL
  is_active: boolean; // 활성화 여부
  created_at?: string; // 등록일
}
