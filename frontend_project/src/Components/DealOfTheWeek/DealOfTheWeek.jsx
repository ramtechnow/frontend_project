import React, { useState, useEffect } from 'react';
import './DealOfTheWeek.css';
import happy_image from '../Assets/happy.jpg';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ShoppingCart } from 'lucide-react';

export const DealOfTheWeek = () => {
  const navigate = useNavigate();

  // Set the countdown target to 5 days from now
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="deal-week-section">
      <div className="deal-week-container">
        <div className="deal-week-grid">
          
          {/* TIMER CONTENT */}
          <div className="deal-timer-col">
            <span className="deal-subtitle">SPECIAL PROMOTION</span>
            <h2>Deal Of The Week</h2>
            <p className="deal-desc">
              Uncover the hottest styles at unparalleled discounts. Get our limited-edition outfits now before the offer runs out!
            </p>

            <div className="countdown-timer-wrap">
              <div className="timer-box">
                <span className="timer-digit">{timeLeft.days}</span>
                <span className="timer-label">Days</span>
              </div>
              <div className="timer-divider">:</div>
              <div className="timer-box">
                <span className="timer-digit">{timeLeft.hours}</span>
                <span className="timer-label">Hours</span>
              </div>
              <div className="timer-divider">:</div>
              <div className="timer-box">
                <span className="timer-digit">{timeLeft.minutes}</span>
                <span className="timer-label">Mins</span>
              </div>
              <div className="timer-divider">:</div>
              <div className="timer-box">
                <span className="timer-digit">{timeLeft.seconds}</span>
                <span className="timer-label">Secs</span>
              </div>
            </div>

            <motion.button 
              className="deal-shop-btn"
              onClick={() => navigate('/womens')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart size={16} /> Shop Deal Now
            </motion.button>
          </div>

          {/* PORTRAIT MODEL */}
          <div className="deal-image-col">
            <div className="deal-image-frame">
              <img src={happy_image} alt="Deal Model" />
              <div className="deal-badge-round">
                <span>Save 50%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DealOfTheWeek;
