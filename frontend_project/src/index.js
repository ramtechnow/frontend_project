import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './Styles/variables.css';
import './Styles/global.css';
import ShopContextProvider from './Context/ShopContext';
import { CartProvider } from './Context/CartContext';
import { AuthProvider } from './Context/AuthContext';
import { ThemeProvider } from './Context/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ShopContextProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ShopContextProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
