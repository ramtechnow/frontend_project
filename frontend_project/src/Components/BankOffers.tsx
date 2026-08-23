import React from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { BankOffer } from '../features/catalog/types/promoTypes';

interface BankOffersProps {
  offers: BankOffer[];
}

export const BankOffers: React.FC<BankOffersProps> = ({ offers = [] }) => {
  if (!offers || offers.length === 0) return null;

  return (
    <section aria-labelledby="bank-offers-heading" style={{ marginTop: '36px', marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CreditCard size={18} style={{ color: 'var(--accent-pink)' }} />
        <h2 id="bank-offers-heading" style={{ fontSize: '16px', fontWeight: '800', margin: 0, letterSpacing: '-0.2px', color: 'var(--text-primary)' }}>
          Exclusive Bank & Payment Offers
        </h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '16px' 
      }}>
        {offers.map((offer, idx) => (
          <div 
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'start',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glowing Accent Side-border */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              backgroundColor: offer.badgeColor || 'var(--accent-pink)'
            }} />

            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: `${offer.badgeColor}20` || 'rgba(236, 72, 153, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: offer.badgeColor || 'var(--accent-pink)',
              flexShrink: 0
            }}>
              <CreditCard size={20} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: '800', 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                color: offer.badgeColor || 'var(--accent-pink)' 
              }}>
                {offer.bank}
              </span>
              <p style={{ 
                margin: 0, 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--text-primary)', 
                lineHeight: '1.4' 
              }}>
                {offer.offer}
              </p>
              {offer.minOrder > 0 && (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={12} /> Min order ₹{offer.minOrder}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BankOffers;
