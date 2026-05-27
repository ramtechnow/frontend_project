import './Navbar.css';
import logo from '../Assets/logo.png';
import cart_icon from '../Assets/cart_icon.png';
import { useState ,useContext, useRef} from "react";
import { Link } from "react-router-dom";
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/dropdown_icon.png';

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { getDefaultCartItems } = useContext(ShopContext);
    const menuRef = useRef();

    const token = localStorage.getItem('auth-token');
    let isAdmin = false;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            isAdmin = payload.user && payload.user.isAdmin;
        } catch (error) {
            console.error("JWT Decode error in Navbar:", error);
        }
    }
    
    const dropdown_toggle = (e) =>{
        menuRef.current.classList.toggle('nav-menu-visible');
        e.target.classList.toggle('open');
    }
    return (
        <div className="navbar">
            <div className="nav-logo">
                <img src={logo} alt="Shop Logo" />
                <p>SHOPPER</p>
            </div>
            <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt="" />
            <ul ref={menuRef} className="nav-menu">
                <li onClick={() => { setMenu("shop") }}>
                    <Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>
                    {menu === "shop" ? <hr /> : <></>}
                </li>
                <li onClick={() => { setMenu("mens") }}>
                    <Link style={{ textDecoration: 'none' }} to='/mens'>Men</Link>
                    {menu === "mens" ? <hr /> : <></>}
                </li>
                <li onClick={() => { setMenu("womens") }}>
                    <Link style={{ textDecoration: 'none' }} to='/womens'>Women</Link>
                    {menu === "womens" ? <hr /> : <></>}
                </li>
                <li onClick={() => { setMenu("kids") }}>
                    <Link style={{ textDecoration: 'none' }} to='/kids'>Kids</Link>
                    {menu === "kids" ? <hr /> : <></>}
                </li>
            </ul>
            <div className="nav-login-cart">
                {localStorage.getItem('auth-token') ? (
                    <button onClick={() => {
                        localStorage.removeItem('auth-token');
                        window.location.replace('/');
                    }}>Logout</button>
                ) : (
                    <Link to='/login'>
                        <button>Login</button>
                    </Link>
                )}
                {isAdmin && (
                    <Link to='/admin'>
                        <button className="nav-admin-btn" style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', marginRight: '10px', transition: 'all 0.3s ease' }}>Admin</button>
                    </Link>
                )}
                <Link to='/cart'>
                    <img src={cart_icon} alt="Cart Icon" />
                </Link>
                <div className="nav-cart-count">
                    {getDefaultCartItems()}
                </div>
            </div>
        </div>
    );
}

export default Navbar;