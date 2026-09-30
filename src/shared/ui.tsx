import type { SizeOption } from "../types";

export function Logo() {
  return <button className="logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><span className="logo-mark"><span /></span><span>BrewLite</span></button>;
}

export function QuantityControl({ value, onChange, small = false }: { value: number; onChange: (value: number) => void; small?: boolean }) {
  return <div className={`quantity ${small ? "quantity-small" : ""}`}><button aria-label="Giảm số lượng" disabled={value <= 1} onClick={() => onChange(value - 1)}>−</button><span aria-live="polite">{value}</span><button aria-label="Tăng số lượng" onClick={() => onChange(value + 1)}>+</button></div>;
}

export const sizeIds: SizeOption["id"][] = ["S", "M", "L"];
