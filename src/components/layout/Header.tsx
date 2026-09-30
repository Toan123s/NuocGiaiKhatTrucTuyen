import type { UserSession } from "../../types";
import { CartIcon, UserIcon } from "../../shared/icons";
import { Logo } from "../../shared/ui";

export default function Header({ cartCount, session, onCart, onHistory, onMenu }: { cartCount: number; session: UserSession | null; onCart: () => void; onHistory: () => void; onMenu: () => void }) {
  return <header className="site-header"><div className="shell header-inner"><Logo /><nav aria-label="Điều hướng chính"><button onClick={onMenu}>Thực đơn</button><button onClick={onHistory}>Đơn hàng</button></nav><div className="header-actions">{session && <span className="user-chip" title={session.email}><UserIcon /><span>{session.name}</span></span>}<button aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`} className="cart-button" onClick={onCart}><CartIcon /><span className="cart-label">Giỏ hàng</span>{cartCount > 0 && <span className="cart-badge">{cartCount}</span>}</button></div></div></header>;
}
