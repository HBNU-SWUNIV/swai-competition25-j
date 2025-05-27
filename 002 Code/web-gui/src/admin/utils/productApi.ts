import type { ProductDTO } from '../types/ProductDTO';

const API_URL = 'http://localhost:8170/products';

// 상품 목록을 API에서 불러오는 함수
export async function fetchProductsApi(): Promise<ProductDTO[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
  const data = await res.json();
  console.log('[debug] fetchProductsApi 응답:', data); // 응답 데이터 로그
  if (Array.isArray(data)) {
    // code가 없거나 중복된 상품이 있는지 확인 (개발 중 디버깅용)
    const codeSet = new Set();
    data.forEach((item, idx) => {
      if (!item.code) {
        console.warn(`[경고] 상품 목록 ${idx}번째에 code가 없습니다.`, item);
      } else if (codeSet.has(item.code)) {
        console.warn(`[경고] 상품 목록에 중복된 code가 있습니다:`, item.code);
      } else {
        codeSet.add(item.code);
      }
    });
    return data;
  } else {
    console.log('[debug] 값을 가져오지 못함(리스트 형태가 아님)');
    return [];
  }
}

// 상품 삭제 API 호출 함수
export async function deleteProductApi(code: string): Promise<boolean> {
  const res = await fetch(`http://localhost:8170/product/${code}`, {
    method: 'DELETE',
  });
  if (!res.ok) return false;
  return true;
}

// 상품 수정 API 호출 함수
export async function updateProductApi(code: string, product: Partial<ProductDTO>): Promise<ProductDTO | null> {
  const res = await fetch(`http://localhost:8170/product/${code}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  if (!res.ok) return null;
  const result = await res.json();
  console.log('[debug] 상품 수정 응답:', result);
  return result.product || null;
}

// 상품 등록 API 호출 함수 (실제 서버 연동)
export async function registerProductApi(product: Partial<ProductDTO>): Promise<ProductDTO | null> {
  try {
    const res = await fetch('http://localhost:8170/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error('등록 실패');
    const data = await res.json();
    console.log('[debug] 상품 등록 응답:', data);
    return data as ProductDTO;
  } catch (e) {
    alert('등록 중 오류가 발생했습니다.');
    return null;
  }
}

// 유니크 상품코드 생성 함수 (예: C + 날짜시간 + 랜덤)
export function generateUniqueProductCode() {
  const now = new Date();
  const ymd = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
  const hms = `${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}${now.getSeconds().toString().padStart(2,'0')}`;
  const rand = Math.floor(Math.random()*1000).toString().padStart(3,'0');
  return `C${ymd}${hms}${rand}`;
}
