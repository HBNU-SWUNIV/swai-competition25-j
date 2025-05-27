import type { ProductDTO } from '../../../../common/types/ProductDTO';
import { deleteProductApi } from '../../../utils/productApi';

export function handleEditClick(setEditOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  setEditOpen(true);
}

export async function handleDeleteClick(
  selectedCode: string | null,
  products: ProductDTO[],
  setProducts: React.Dispatch<React.SetStateAction<ProductDTO[]>>,
  setSelectedCode: React.Dispatch<React.SetStateAction<string | null>>
) {
  if (!selectedCode) return;
  console.log('[debug] 삭제 요청 code:', selectedCode);
  try {
    const ok = await deleteProductApi(selectedCode);
    if (!ok) throw new Error('삭제에 실패했습니다.');
    setProducts(products.filter((p) => p.code !== selectedCode));
    setSelectedCode(null);
  } catch (e) {
    alert('삭제 중 오류가 발생했습니다.');
  }
}
