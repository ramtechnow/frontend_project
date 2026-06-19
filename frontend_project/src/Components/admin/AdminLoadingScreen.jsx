import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminLoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '75vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <motion.div
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-color)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <ShieldCheck size={36} />
      </motion.div>
      
      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: '800' }}>
        Verifying Administration Credentials
      </h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.5' }}>
        Securing administrative channel and parsing authorization tokens. Please wait...
      </p>

      {/* Loading bar */}
      <div style={{
        width: '140px',
        height: '4px',
        backgroundColor: 'var(--border-color)',
        borderRadius: '2px',
        marginTop: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <motion.div
          animate={{
            left: ['-100%', '100%']
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '60px',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '2px'
          }}
        />
      </div>
    </div>
  );
};
