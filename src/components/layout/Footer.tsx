import { Logo } from "../../shared/ui";

export default function Footer({ onMenu, onHistory }: { onMenu: () => void; onHistory: () => void }) {
  return <footer><div className="shell footer-inner"><div><Logo /><p>Cà phê ngon hơn khi bạn không phải chờ.</p></div><div><strong>Khám phá</strong><button onClick={onMenu}>Thực đơn</button><button onClick={onHistory}>Đơn hàng của tôi</button></div><div><strong>Ghé BrewLite</strong><span>273 An Dương Vương, Quận 5</span><span>07:00 — 22:00 mỗi ngày</span></div></div><div className="shell copyright">© 2026 BrewLite. Được pha với sự tận tâm.</div></footer>;
}
