import React, { useEffect, useState } from 'react';
import type { ProductDTO } from '../../../../common/types/ProductDTO';

interface EditDialogProps {
  open: boolean;
  product: ProductDTO | null;
  onClose: () => void;
  onSubmit: (values: Partial<ProductDTO>) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, product, onClose, onSubmit }) => {
  const [form, setForm] = useState<Partial<ProductDTO>>(product || {});
  useEffect(() => { setForm(product || {}); }, [product]);
  if (!open || !product) return null;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#23272f', color: '#fff', padding: 24, borderRadius: 12, minWidth: 340, boxShadow: '0 4px 24px rgba(0,0,0,0.7)' }}>
        <h3 style={{color:'#fff'}}>상품 수정</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            상품코드: <input name="code" value={form.code || ''} readOnly style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px', opacity:0.7}} />
          </label>
          <label>
            이름: <input name="name" value={form.name || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
          <label>
            금액: <input name="price" type="number" value={form.price || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
          <label>
            설명: <input name="description" value={form.description || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
          <label>
            카테고리: <input name="category" value={form.category || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
          <label>
            재고: <input name="stock" type="number" value={form.stock || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
          <label>
            이미지 URL: <input name="image_url" value={form.image_url || ''} onChange={handleChange} style={{background:'#181a20', color:'#fff', border:'1px solid #444', borderRadius:4, padding:'4px 8px'}} />
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onClose} style={{background:'#444', color:'#fff', border:'none', borderRadius:4, padding:'6px 16px'}}>취소</button>
          <button onClick={() => onSubmit(form)} style={{background:'#4f8cff', color:'#fff', border:'none', borderRadius:4, padding:'6px 16px'}}>완료</button>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;
