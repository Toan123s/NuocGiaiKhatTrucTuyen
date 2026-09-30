import { formatVnd } from "../../data/products";
import type { Product } from "../../types";

export default function ProductCard({ product, onSelect }: { product: Product; onSelect: () => void }) {
  return <article className="product-card" onClick={onSelect}><button aria-label={`Xem ${product.name}`} className="card-image-button"><img alt={product.name} loading="lazy" src={product.imageUrl} />{product.badge && <span className="product-badge">{product.badge}</span>}<span className="quick-add">+</span></button><div className="product-info"><span className="product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description}</p><div className="product-price"><span>Từ <strong>{formatVnd(product.basePrice - 5000)}</strong></span><button aria-label={`Thêm ${product.name}`}>Chọn món</button></div></div></article>;
}
