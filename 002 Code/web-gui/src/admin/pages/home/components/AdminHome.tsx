import React, { useEffect, useState } from 'react';
import type { ProductDTO } from '../../../../common/types/ProductDTO';
import TableStyle from '../../../../common/TableStyle';
import EditDialog from './EditDialog';
import RegisterDialog from './RegisterDialog';
import { handleDeleteClick, handleEditClick } from '../functions/productActions';
import { fetchProductsApi, registerProductApi, updateProductApi } from '../../../utils/productApi';

// 관리자 상품 관리 페이지 컴포넌트
const AdminHome: React.FC = () => {
  // 상품 목록 상태
  const [products, setProducts] = useState<ProductDTO[]>([]);
  // 로딩 상태
  const [loading, setLoading] = useState(true);
  // 에러 상태 (현재는 화면에만 표시)
  const [error, setError] = useState<string | null>(null);
  // 선택된 상품 코드 (행 클릭 시 변경)
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  // 수정 다이얼로그 열림 상태
  const [editOpen, setEditOpen] = useState(false);
  // 상품 등록 다이얼로그 열림 상태
  const [registerOpen, setRegisterOpen] = useState(false);

  // 상품 목록을 API에서 불러오는 함수
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductsApi();
      setProducts(data);
    } catch (e: any) {
      setProducts([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시, 그리고 5초마다 상품 목록 갱신 (수정 다이얼로그 열려있으면 중단)
  useEffect(() => {
    if (editOpen) return;
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, [editOpen]);

  // 다이얼로그 완료 시 상품 정보 갱신
  const handleEditSubmit = async (values: Partial<ProductDTO>) => {
    if (!selectedCode) return;
    const updated = await updateProductApi(selectedCode, values);
    if (updated) {
      setProducts(products.map((p) => (p.code === selectedCode ? { ...p, ...updated } : p)));
      setEditOpen(false);
    } else {
      alert('수정에 실패했습니다.');
    }
  };

  // 상품 등록 버튼 동작
  function handleRegisterClick() {
    setRegisterOpen(true);
  }

  // 상품 등록 완료 시 처리
  const handleRegisterSubmit = async (values: Partial<ProductDTO>) => {
    const created = await registerProductApi(values);
    if (created) {
      // 등록 후, 서버에서 반환된 created에 누락된 값이 있다면 products에서 해당 code로 찾아서 병합
      const merged = { ...values, ...created };
      setProducts([merged, ...products]);
      setRegisterOpen(false);
    } else {
      alert('등록에 실패했습니다.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: 24, letterSpacing: '-1px', color: 'var(--admin-title-color, #222)' }}>관리자 상품 관리</h2>
      {/* 상품 등록 버튼 */}
      <button onClick={handleRegisterClick} style={{ marginBottom: 16, background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(79,140,255,0.08)' }}>상품 등록</button>
      {loading && <p>로딩 중...</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      <TableStyle />
      <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: 'var(--table-bg, #fff)' }}>
        <table className="common-table" style={{ width: '100%', minWidth: 1100, marginTop: 0, borderCollapse: 'separate', borderSpacing: 0, fontSize: '1.05rem', background: 'inherit' }}>
          <thead>
            <tr>
              <th className="common-table-th">코드</th>
              <th className="common-table-th">이름</th>
              <th className="common-table-th">금액</th>
              <th className="common-table-th">설명</th>
              <th className="common-table-th">카테고리</th>
              <th className="common-table-th">재고</th>
              <th className="common-table-th">이미지</th>
              <th className="common-table-th">활성화</th>
              <th className="common-table-th">등록일</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p.code || idx}
                className={
                  'common-table-tr' + (selectedCode === p.code ? ' selected-row' : '')
                }
                onClick={() => setSelectedCode(p.code)}
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
              >
                <td className="common-table-td" style={{ fontWeight: 500 }}>{p.code}</td>
                <td className="common-table-td">{p.name}</td>
                <td className="common-table-td">{p.price}</td>
                <td className="common-table-td" style={{ color: '#666' }}>{p.description}</td>
                <td className="common-table-td">{p.category || '-'}</td>
                <td className="common-table-td">{p.stock}</td>
                <td className="common-table-td">{p.image_url ? <img src={p.image_url} alt={p.name} className="common-table-img" /> : '-'}</td>
                <td className="common-table-td">{p.is_active ? <span style={{color:'#4f8cff', fontWeight:600}}>O</span> : <span style={{color:'#bbb'}}>X</span>}</td>
                <td className="common-table-td" style={{ fontSize:'0.97em', color:'#888' }}>{p.created_at || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <EditDialog
        open={editOpen}
        product={products.find((p) => p.code === selectedCode) || null}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
      />
      <RegisterDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
        {/* 수정 버튼 */}
        <button disabled={!selectedCode} onClick={() => handleEditClick(setEditOpen)} style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:600, fontSize:'1rem'}}>수정</button>
        {/* 삭제 버튼 */}
        <button disabled={!selectedCode} onClick={() => handleDeleteClick(selectedCode, products, setProducts, setSelectedCode)} style={{ background: '#ff4d4f', color: 'white', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:600, fontSize:'1rem' }}>삭제</button>
      </div>
    </div>
  );
};

export default AdminHome;
