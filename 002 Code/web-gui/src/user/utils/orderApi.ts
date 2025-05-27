import type { OrderResponseDTO } from '../types/OrderResponseDTO';

export async function fetchOrderStart(): Promise<OrderResponseDTO | null> {
  try {
    const res = await fetch('http://localhost:8170/order/start');
    if (!res.ok) throw new Error('주문 시작 실패');
    const data = await res.json();
    console.log('[debug] 주문 시작 응답:', data);
    return data as OrderResponseDTO;
  } catch (e) {
    alert('주문 시작 중 오류가 발생했습니다.');
    return null;
  }
}

export async function fetchOrderSelectMenu(session_id: string, product_code: string): Promise<OrderResponseDTO | null> {
  try {
    const res = await fetch('http://localhost:8170/order/select-menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, product_code }),
    });
    if (!res.ok) throw new Error('상품 선택 실패');
    const data = await res.json();
    console.log('[debug] /order/select-menu 응답:', data);
    return data as OrderResponseDTO;
  } catch (e) {
    alert('상품 선택 중 오류가 발생했습니다.');
    return null;
  }
}

export async function fetchOrderCancel(session_id: string): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8170/order/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id }),
    });
    return res.ok;
  } catch (e) {
    alert('주문 취소 요청 중 오류가 발생했습니다.');  
    return false;
  }
}

// 음성 안내 파일을 받아 재생하는 함수
export async function playVoiceFromEndpoint(voicePath: string) {
  if (!voicePath) return;
  const url = `http://localhost:8170/${voicePath.replace(/^\/+/, '')}`;
  const res = await fetch(url);
  if (!res.ok) return;
  const blob = await res.blob();
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.play();
}

export async function fetchOrderVoice(
  session_id: string,
  voice: string,
  onProductSelected?: (product: { code: string; name: string; price: number }) => void,
  products?: { code: string; name: string; price: number; description?: string }[]
): Promise<any> {
  try {
    const res = await fetch('http://localhost:8170/order/voice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, voice }),
    });
    if (!res.ok) throw new Error('음성 주문 실패');
    const data = await res.json();
    // voice 안내 음성 출력
    if (data.voice) {
      await playVoiceFromEndpoint(data.voice);
    }
    // code가 null/None이 아니면 상품 선택 메뉴 호출 및 웹 장바구니에 추가
    if (data.code !== null && data.code !== undefined && onProductSelected && products) {
      const selected = products.find((p) => p.code === data.code);
      if (selected) {
        onProductSelected({ code: selected.code, name: selected.name, price: selected.price });
      }
      await fetchOrderSelectMenu(session_id, data.code);
    }
    return data;
  } catch (e) {
    alert('음성 주문 요청 중 오류가 발생했습니다.');
    return null;
  }
}