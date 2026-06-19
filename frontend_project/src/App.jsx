import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Home from './Pages/Home';
import Shop from './Pages/Shop';
import ProductDetail from './Pages/ProductDetail';
import Cart from './Pages/Cart';
import Wishlist from './Pages/Wishlist';
import Checkout from './Pages/Checkout';
import Orders from './Pages/Orders';
import Login from './Pages/Login';
import AdminPanel from './Pages/AdminPanel';
import Footer from './Components/Footer';

// Global Contexts Providers
import { ThemeProvider } from './Context/ThemeContext';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';
import WishlistProvider from './Context/WishlistContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <div 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  minHeight: "100vh",
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)"
                }}
              >
                <Navbar />
                
                {/* Main Content Viewport */}
                <div style={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/catalog' element={<Shop />} />
                    <Route path='/mens' element={<Shop category="men" />} />
                    <Route path='/womens' element={<Shop category="women" />} />
                    <Route path='/kids' element={<Shop category="kid" />} />
                    <Route path='/product/:productId' element={<ProductDetail />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/wishlist' element={<Wishlist />} />
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/orders' element={<Orders />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/admin' element={<AdminPanel />} />
                  </Routes>
                </div>
                
                <Footer />
              </div>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
