import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "../features/checkout/hooks/useCart";
import { useWishlist } from "../features/catalog/hooks/useWishlist";
import { useAuth } from "../features/auth/hooks/useAuth";
import "../Styles/mobile-bottom-nav.css";

const tabs = [
  { to: "/",         Icon: Home,        label: "Home" },
  { to: "/catalog",  Icon: LayoutGrid,  label: "Categories" },
  { to: "/cart",     Icon: ShoppingCart,label: "Cart",     badge: "cart" },
  { to: "/wishlist", Icon: Heart,        label: "Wishlist", badge: "wishlist" },
  { to: "/profile",  Icon: User,         label: "Account",  auth: true },
];

export const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { cartCount }  = useCart();
  const { wishlist }   = useWishlist();
  const { user }       = useAuth();

  const getBadge = (badge?: string) => {
    if (badge === "cart")    return cartCount > 0 ? cartCount : null;
    if (badge === "wishlist") return wishlist.length > 0 ? wishlist.length : null;
    return null;
  };

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {tabs.map(({ to, Icon, label, badge, auth }) => {
        const active = isActive(to);
        const count  = getBadge(badge);
        const dest   = auth && !user ? "/login" : to;

        return (
          <Link to={dest} key={to} className={`mbn-tab ${active ? "mbn-tab--active" : ""}`}>
            <span className="mbn-icon-wrap">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {count != null && (
                <span className="mbn-badge">{count > 99 ? "99+" : count}</span>
              )}
            </span>
            <span className="mbn-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
