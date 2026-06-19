import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to handle resend OTP countdown timers.
 * @param {number} initialSeconds 
 * @returns {object} { secondsLeft, startTimer, isTimerActive }
 */
export const useOtpTimer = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const timerRef = useRef(null);

  const startTimer = (seconds = 60) => {
    setSecondsLeft(seconds);
  };

  useEffect(() => {
    if (secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [secondsLeft]);

  return {
    secondsLeft,
    startTimer,
    isTimerActive: secondsLeft > 0
  };
};
