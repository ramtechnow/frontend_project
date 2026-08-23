import React, { useMemo } from 'react';
import '../Styles/festiveParticles.css';

interface FestiveParticlesProps {
  type: string; // 'lamp' | 'flower' | 'balloon' | 'star'
  enable: boolean;
}

interface ParticleConfig {
  id: number;
  left: string;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

export const FestiveParticles: React.FC<FestiveParticlesProps> = ({ type = 'star', enable }) => {
  const count = 16; // Stable number of particles to prevent resource overload

  const particlesList = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: count }).map((_, idx) => ({
      id: idx,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${10 + Math.random() * 15}s`, // slow, drifting motion
      size: `${18 + Math.random() * 24}px`, // premium varied sizes
      opacity: 0.15 + Math.random() * 0.45
    }));
  }, []);

  if (!enable) return null;

  // Render proper SVG shape based on festive type
  const renderParticleSvg = (particleType: string) => {
    switch (particleType) {
      case 'lamp': // Glow clay diya lamp (Vinayagar Chaturthi/Diwali)
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            {/* Clay pot body */}
            <path d="M2 14c0 3.866 4.477 7 10 7s10-3.134 10-7H2z" fill="#b45309" />
            {/* Oil surface */}
            <ellipse cx="12" cy="14" rx="10" ry="2" fill="#d97706" />
            {/* Flame container */}
            <path d="M12 12c-2-2-1.5-6 0-10 1.5 4 2 8 0 10z" fill="#f97316" />
            {/* Inner flame wick glow */}
            <path d="M12 11c-1-1.5-0.75-4 0-6 0.75 2 1 4.5 0 6z" fill="#fbbf24" />
          </svg>
        );
      case 'flower': // Floral pink petal (Festive Spring/Pongal)
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <path d="M12 2C8.5 2 6 5.5 6 9c0 3.5 2.5 5 6 9 3.5-4 6-5.5 6-9 0-3.5-2.5-7-6-7z" fill="#ec4899" />
            <path d="M12 5C9.5 5 7.5 7.5 7.5 10c0 2.5 2 3.5 4.5 6.5 2.5-3 4.5-4 4.5-6.5 0-2.5-2-5-4.5-5z" fill="#f472b6" />
            <circle cx="12" cy="9" r="2" fill="#fbbf24" />
          </svg>
        );
      case 'balloon': // Colorful balloon (New Year/Celebrations)
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="12" cy="10" rx="7" ry="9" fill="#3b82f6" />
            {/* Glossy highlight */}
            <path d="M8 7c-1 1-1 3.5 0 4.5s2.5 1 2.5 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            {/* Knot */}
            <path d="M12 19l-1.5 2h3z" fill="#2563eb" />
            {/* Balloon String */}
            <path d="M12 21c-1 2 1 3 0 4" stroke="#94a3b8" strokeWidth="1" />
          </svg>
        );
      case 'star': // Golden shining star (General / Winter Holidays)
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
            <path d="M12 2l2.4 7.4H22l-6.2 4.5L18.2 22 12 17.5 5.8 22l2.4-8.1L2 9.4h7.6z" fill="#fbbf24" />
          </svg>
        );
    }
  };

  return (
    <div className="festive-particles-overlay" aria-hidden="true">
      {particlesList.map((p) => (
        <div
          key={p.id}
          className={`festive-drift-particle particle-type-${type}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        >
          {renderParticleSvg(type)}
        </div>
      ))}
    </div>
  );
};

export default FestiveParticles;
