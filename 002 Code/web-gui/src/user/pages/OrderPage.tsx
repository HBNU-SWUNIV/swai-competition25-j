import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TableStyle from '../../common/TableStyle';
import { fetchOrderSelectMenu, fetchOrderCancel, playVoiceFromEndpoint, fetchOrderVoice } from '../utils/orderApi';
import type { ProductDTO } from '../../common/types/ProductDTO';
import type { OrderResponseDTO } from '../../common/types/OrderResponseDTO';

const OrderPage: React.FC = () => {
  const location = useLocation();
  const orderStart = location.state as OrderResponseDTO | undefined;
  const navigate = useNavigate();

  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  // 선택된 상품의 code를 별도 상태로 저장
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  // 장바구니(추가된 상품) 상태 (수량 포함)
  const [cart, setCart] = useState<{ code: string; name: string; price: number; quantity: number }[]>([]);
  // 음성 인식 상태
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost:8170/products');
        if (!res.ok) throw new Error('상품 정보를 불러오지 못했습니다.');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('상품 정보를 불러오지 못했습니다.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 상품 행 클릭 시 code를 콘솔에 출력 (디버깅/확인용)
  useEffect(() => {
    if (selectedProductCode) {
      console.log('[선택된 상품 code]', selectedProductCode);
    }
  }, [selectedProductCode]);

  // order page 진입 시 최초 음성 안내 재생
  useEffect(() => {
    if (orderStart?.voice) {
      playVoiceFromEndpoint(orderStart.voice);
    }
  }, [orderStart?.voice]);

  // [추가] 버튼 클릭 시 동작
  const handleAddProduct = async () => {
    const selected = products.find((p, idx) => (p.code || idx.toString()) === selectedRow);
    if (selected && selectedProductCode && orderStart?.session_id) {
      const session_id = orderStart.session_id;
      const rsp = await fetchOrderSelectMenu(session_id, selectedProductCode);
      if (rsp && rsp.voice) {
        await playVoiceFromEndpoint(rsp.voice);
      }
      setCart((prev) => {
        const existIdx = prev.findIndex((item) => item.code === selected.code);
        if (existIdx !== -1) {
          // 이미 장바구니에 있으면 수량 증가
          const updated = [...prev];
          updated[existIdx].quantity += 1;
          return updated;
        } else {
          // 없으면 새로 추가
          return [...prev, { code: selected.code, name: selected.name, price: selected.price, quantity: 1 }];
        }
      });
    }
  };

  // 장바구니 총합 계산
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 주문 완료 API 호출 함수
  async function fetchOrderComplete(session_id: string): Promise<boolean> {
    try {
      const res = await fetch('http://localhost:8170/order/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id }),
      });
      return res.ok;
    } catch (e) {
      alert('주문 완료 요청 중 오류가 발생했습니다.');
      return false;
    }
  }

  // 주문 완료/취소 dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  // 주문하기 버튼 클릭 시
  const handleOrder = async () => {
    if (!orderStart?.session_id) return;
    await fetchOrderComplete(orderStart.session_id);
    setDialogMessage('주문이 완료되었습니다.');
    setDialogOpen(true);
    setTimeout(() => {
      setDialogOpen(false);
      navigate('/user');
    }, 3000);
  };

  // 주문취소 버튼 클릭 시
  const handleCancel = async () => {
    if (!orderStart?.session_id) return;
    await fetchOrderCancel(orderStart.session_id);
    setDialogMessage('주문이 취소되었습니다.');
    setDialogOpen(true);
    setTimeout(() => {
      setDialogOpen(false);
      navigate('/user');
    }, 3000);
  };

  // 음성주문 버튼 클릭 시 동작
  const handleVoiceOrder = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      alert('음성 인식 오류: ' + e.error);
    };
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      if (orderStart?.session_id) {
        await fetchOrderVoice(
          orderStart.session_id,
          transcript,
          (product) => {
            setCart((prev) => {
              const existIdx = prev.findIndex((item) => item.code === product.code);
              if (existIdx !== -1) {
                // 이미 장바구니에 있으면 수량 증가
                const updated = [...prev];
                updated[existIdx].quantity += 1;
                return updated;
              } else {
                // 없으면 새로 추가
                return [...prev, { ...product, quantity: 1 }];
              }
            });
          },
          products
        );
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
      <TableStyle />
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>상품 목록</h2>
      {loading && <div>로딩 중...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && (
        <>
        <table className="common-table">
          <thead>
            <tr>
              <th className="common-table-th">상품명</th>
              <th className="common-table-th">금액</th>
              <th className="common-table-th">설명</th>
              <th className="common-table-th">이미지</th>
              <th className="common-table-th"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.code || idx}
                className={
                  'common-table-tr' + (selectedRow === (p.code || idx.toString()) ? ' selected-row' : '')
                }
                onClick={() => {
                  setSelectedRow(p.code || idx.toString());
                  setSelectedProductCode(p.code || null);
                }}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <td className="common-table-td" style={{ fontWeight: 500 }}>{p.name}</td>
                <td className="common-table-td">{p.price.toLocaleString()}원</td>
                <td className="common-table-td" style={{ color: '#666' }}>{p.description}</td>
                <td className="common-table-td">{p.image_url ? <img src={p.image_url} alt={p.name} className="common-table-img" /> : '-'}</td>
                <td className="common-table-td">
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedRow(p.code || idx.toString()); setSelectedProductCode(p.code || null); handleAddProduct(); }}
                    style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    추가
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 장바구니(추가된 상품) 표 */}
        <div style={{ marginTop: 40, width: '100%', maxWidth: 600 }}>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: 12 }}>추가된 상품</h3>
          <table className="common-table">
            <thead>
              <tr>
                <th className="common-table-th">상품명</th>
                <th className="common-table-th">금액</th>
                <th className="common-table-th">수량</th>
                <th className="common-table-th">합계</th>
                <th className="common-table-th"></th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? cart.map((item, idx) => (
                <tr key={item.code + idx} className="common-table-tr">
                  <td className="common-table-td">{item.name}</td>
                  <td className="common-table-td">{item.price.toLocaleString()}원</td>
                  <td className="common-table-td">{item.quantity}</td>
                  <td className="common-table-td">{(item.price * item.quantity).toLocaleString()}원</td>
                  <td className="common-table-td">
                    <button
                      onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                      style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 14px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              )) : (
                <tr className="common-table-tr">
                  <td className="common-table-td" colSpan={5} style={{ textAlign: 'center', color: '#aaa' }}>추가된 상품이 없습니다.</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td className="common-table-td" style={{ fontWeight: 700 }}>총합</td>
                <td className="common-table-td" colSpan={4} style={{ fontWeight: 700 }}>{totalPrice.toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
          {/* 주문하기/주문취소 버튼 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center' }}>
            <button
              onClick={handleOrder}
              disabled={cart.length === 0}
              style={{ background: '#23272f', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 40px', fontWeight: 700, fontSize: '1.15rem', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', cursor: cart.length === 0 ? 'not-allowed' : 'pointer', opacity: cart.length === 0 ? 0.5 : 1 }}
            >
              주문하기
            </button>
            <button
              onClick={handleCancel}
              style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 40px', fontWeight: 700, fontSize: '1.15rem', boxShadow: '0 2px 12px rgba(0,0,0,0.18)', cursor: 'pointer' }}
            >
              주문취소
            </button>
            <button
              onClick={handleVoiceOrder}
              style={{ background: '#1e90ff', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 40px', fontWeight: 700, fontSize: '1.15rem', boxShadow: '0 2px 12px rgba(30,144,255,0.18)', cursor: 'pointer' }}
              disabled={isListening}
            >
              음성주문
            </button>
          </div>
        </div>
        {/* 주문 완료/취소 다이얼로그 */}
        {dialogOpen && (
          <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
            <div style={{ background: '#23272f', color: '#fff', padding: 40, borderRadius: 16, fontSize: '1.5rem', fontWeight: 700, boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}>
              {dialogMessage}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default OrderPage;
