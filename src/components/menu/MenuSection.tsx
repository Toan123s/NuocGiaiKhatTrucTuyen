import { useState } from "react";
import { products } from "../../data/products";
import type { Product } from "../../types";
import { SearchIcon } from "../../shared/icons";
import ProductCard from "./ProductCard";

const categories = ["Tất cả", "Cà phê", "Trà", "Đá xay"] as const;

export default function MenuSection({ onSelect }: { onSelect: (product: Product) => void }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("Tất cả");
  const [query, setQuery] = useState("");
  const filtered = products.filter((product) => {
    const matchesCategory = category === "Tất cả" || product.category === category;
    const normalized = `${product.name} ${product.description}`.toLocaleLowerCase("vi");
    return matchesCategory && normalized.includes(query.trim().toLocaleLowerCase("vi"));
  });
  return <section className="menu-section shell" id="menu"><div className="section-heading"><div><span className="eyebrow"><span /> Thực đơn hôm nay</span><h2>Món ngon cho mọi tâm trạng</h2></div><label className="search-box"><SearchIcon /><input aria-label="Tìm kiếm đồ uống" onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món bạn thích..." value={query} /></label></div><div className="category-row" role="tablist" aria-label="Danh mục đồ uống">{categories.map((item) => <button aria-selected={category === item} className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)} role="tab">{item}</button>)}</div>{filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} onSelect={() => onSelect(product)} product={product} />)}</div> : <div className="empty-state"><span className="empty-icon"><SearchIcon /></span><h3>Chưa tìm thấy món phù hợp</h3><p>Thử một từ khóa khác hoặc xem lại tất cả món nhé.</p><button className="button button-secondary" onClick={() => { setQuery(""); setCategory("Tất cả"); }}>Xem tất cả</button></div>}</section>;
}
