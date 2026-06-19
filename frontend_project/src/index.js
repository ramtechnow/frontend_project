import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ShopContextProvider from './Context/ShopContext';
import { CartProvider } from './Context/CartContext';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';
import WishlistContextProvider from './Context/WishlistContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ShopContextProvider>
          <CartProvider>
            <WishlistContextProvider>
              <App />
            </WishlistContextProvider>
          </CartProvider>
        </ShopContextProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
