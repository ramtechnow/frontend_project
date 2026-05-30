import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar.jsx';
import { Shop } from './Pages/Shop.jsx';
import ShopCategory from './Pages/ShopCategory.jsx';
import { Product } from './Pages/Product.jsx';
import { Cart } from './Pages/Cart.jsx';
import { LoginSignup } from './Pages/LoginSignup.jsx';
import { AdminPanel } from './Pages/AdminPanel.jsx';
import { Footer } from './Components/Footer/Footer.jsx';

import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';

// Global Contexts Providers
import { ThemeProvider } from './Context/ThemeContext';
import { AuthProvider } from './Context/AuthContext';
import { CartProvider } from './Context/CartContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div>
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path='/' element={<Shop />} />
                <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
                <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
                <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kid" />} />
                <Route path='/product/:productId' element={<Product />} />
                <Route path='/cart' element={<Cart />} />
                <Route path='/login' element={<LoginSignup />} />
                <Route path='/admin' element={<AdminPanel />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;