import React, { useState, useEffect } from 'react';
import './OfflineOverlay.css';
import offlineImage from '../Assets/404_error_image.svg';
import { motion, AnimatePresence } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const OfflineOverlay = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lottieError, setLottieError] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setLottieError(false);
      console.log("🌐 Connection restored! Back online.");
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      console.log("⚠️ Connection lost. App went offline.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Prevent scrolling when offline overlay is visible
    if (isOffline) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.body.style.overflow = '';
    };
  }, [isOffline]);

  const handleRetry = () => {
    // Check navigator status and force update
    const online = navigator.onLine;
    setIsOffline(!online);
    if (online) {
      setLottieError(false);
      alert("🌐 You are back online! Restoring connection...");
    } else {
      // Small trigger feedback
      const btn = document.querySelector('.offline-retry-btn');
      if (btn) {
        btn.classList.add('shake');
        setTimeout(() => btn.classList.remove('shake'), 500);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div 
          className="offline-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="offline-card"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="offline-badge">
              <span className="offline-dot animate-pulse"></span>
              Offline Mode
            </div>

            <div className="offline-media-container" style={{ width: '280px', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '10px 0', overflow: 'hidden' }}>
              {!lottieError ? (
                <DotLottieReact
                  src="https://lottie.host/6c1a1a42-0829-40c9-a2c0-b6728b72a8a5/CvSyFmqZtL.lottie"
                  loop
                  autoplay
                  onError={() => {
                    console.warn("⚠️ DotLottie network fetch failed while offline. Showing SVG fallback.");
                    setLottieError(true);
                  }}
                  style={{ width: '100%', height: '100%' }}
                />
              ) : (
                <img src={offlineImage} alt="Offline Error" className="offline-illustration" />
              )}
            </div>
            
            <h2>Connection Lost</h2>
            <p>
              It looks like you are currently offline. Please check your internet connection or Wi-Fi settings to continue shopping.
            </p>
            
            <button className="offline-retry-btn" onClick={handleRetry}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="retry-svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Check Connection
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineOverlay;
