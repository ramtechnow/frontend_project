import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { fetchActivePromo, savePromo } from '../../features/catalog/services/promoService';
import { SeasonalPromo, BankOffer } from '../../features/catalog/types/promoTypes';

interface AdminSeasonalTabProps {
  addToast: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  logAction: (action: string) => void;
}

export const AdminSeasonalTab: React.FC<AdminSeasonalTabProps> = ({ addToast, logAction }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Schema state fields
  const [theme, setTheme] = useState('General');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementBg, setAnnouncementBg] = useState('linear-gradient(90deg, #ec4899, #8b5cf6)');
  const [enableParticles, setEnableParticles] = useState(false);
  const [particleType, setParticleType] = useState('star');
  const [bankOffers, setBankOffers] = useState<BankOffer[]>([]);

  // New bank offer creation helper state
  const [newBank, setNewBank] = useState('');
  const [newBadgeColor, setNewBadgeColor] = useState('#004B87');
  const [newOfferText, setNewOfferText] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('1000');

  // Themes list
  const THEME_OPTIONS = [
    { value: 'General', label: 'General / No Theme' },
    { value: 'VinayagarChaturthi', label: '🕉️ Vinayagar Chaturthi Theme' },
    { value: 'Diwali', label: '🪔 Diwali Light Festival Theme' },
    { value: 'NewYear', label: '🎈 New Year Celebration Theme' },
    { value: 'Pongal', label: '🌾 Pongal Harvest Festival Theme' }
  ];

  // Colors preset gradients for marquee background
  const GRADIENT_PRESETS = [
    { value: 'linear-gradient(90deg, #ec4899, #8b5cf6)', label: 'Pink Violet (General)' },
    { value: 'linear-gradient(90deg, #f59e0b, #ef4444)', label: 'Orange Red (Vinayagar/Diwali)' },
    { value: 'linear-gradient(90deg, #10b981, #059669)', label: 'Green Emerald (Pongal)' },
    { value: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', label: 'Blue Ocean (New Year)' },
    { value: '#0f172a', label: 'Slate Dark (Minimalist)' }
  ];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await fetchActivePromo();
        if (settings) {
          setTheme(settings.theme || 'General');
          setAnnouncementText(settings.announcementText || '');
          setAnnouncementBg(settings.announcementBg || 'linear-gradient(90deg, #ec4899, #8b5cf6)');
          setEnableParticles(settings.enableParticles || false);
          setParticleType(settings.particleType || 'star');
          setBankOffers(settings.bankOffers || []);
        }
      } catch (err) {
        addToast('Failed to load seasonal configuration from server', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddBankOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.trim() || !newOfferText.trim()) {
      addToast('Please fill in both Bank Name and Offer text fields', 'warning');
      return;
    }

    const offer: BankOffer = {
      bank: newBank.trim(),
      badgeColor: newBadgeColor,
      offer: newOfferText.trim(),
      minOrder: Number(newMinOrder) || 0
    };

    setBankOffers(prev => [...prev, offer]);
    setNewBank('');
    setNewOfferText('');
    addToast('💳 Added bank card offer to current list', 'info');
  };

  const handleRemoveBankOffer = (idx: number) => {
    setBankOffers(prev => prev.filter((_, i) => i !== idx));
    addToast('Removed offer card', 'info');
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const data: SeasonalPromo = {
        theme,
        announcementText,
        announcementBg,
        enableParticles,
        particleType,
        bankOffers
      };
      await savePromo(data);
      addToast('✨ Seasonal Promo configurations updated successfully!', 'success');
      logAction(`Updated Seasonal Promos Settings: Theme=${theme}, Particles=${enableParticles}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to update seasonal settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Sync particle selections with theme automatically for admin convenience
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'VinayagarChaturthi' || newTheme === 'Diwali') {
      setParticleType('lamp');
      setAnnouncementBg('linear-gradient(90deg, #f59e0b, #ef4444)');
      setEnableParticles(true);
    } else if (newTheme === 'NewYear') {
      setParticleType('balloon');
      setAnnouncementBg('linear-gradient(90deg, #3b82f6, #1d4ed8)');
      setEnableParticles(true);
    } else if (newTheme === 'Pongal') {
      setParticleType('flower');
      setAnnouncementBg('linear-gradient(90deg, #10b981, #059669)');
      setEnableParticles(true);
    } else {
      setParticleType('star');
      setEnableParticles(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
        <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-color)' }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Retrieving seasonal settings...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Seasonal & Festive Promo Settings
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Configure marquee announcement text, floating animated decorations, and bank credit card deals.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            backgroundColor: 'var(--accent-color, var(--accent-pink))',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving Changes
            </>
          ) : (
            <>
              <Save size={16} /> Save Settings
            </>
          )}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Left Column: Theme & Particle Controls */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-color)' }} />
            Festive Theme Settings
          </h3>

          {/* Theme Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Festive Template Theme</label>
            <select
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              {THEME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Announcement Text Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Announcement text (Top Marquee)</label>
            <textarea
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. 15% discount live on all collections! Credit Card cashback offers active."
              rows={3}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Marquee Background Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Marquee background color/gradient</label>
            <select
              value={announcementBg}
              onChange={(e) => setAnnouncementBg(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem'
              }}
            >
              {GRADIENT_PRESETS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={announcementBg}
              onChange={(e) => setAnnouncementBg(e.target.value)}
              placeholder="Custom color hex or linear-gradient css value"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                marginTop: '6px'
              }}
            />
          </div>

          {/* Floating Animations Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
            <input
              type="checkbox"
              id="enable-particles-toggle"
              checked={enableParticles}
              onChange={(e) => setEnableParticles(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="enable-particles-toggle" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Enable drifting festive background elements
            </label>
          </div>

          {/* Particle Element Type selection */}
          {enableParticles && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Drifting object shape</label>
              <select
                value={particleType}
                onChange={(e) => setParticleType(e.target.value)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="star">Golden shining stars (General)</option>
                <option value="lamp">Clay glowing lamps (Vinayagar/Diwali)</option>
                <option value="flower">Traditional flower petals (Pongal/Spring)</option>
                <option value="balloon">Colorful balloons (Celebrations)</option>
              </select>
            </div>
          )}
        </div>

        {/* Right Column: Bank Card Promos Creator */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} style={{ color: 'var(--accent-color)' }} />
            Manage Bank Offers
          </h3>

          {/* Add bank offer form */}
          <form onSubmit={handleAddBankOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Badge color</label>
                <input
                  type="color"
                  value={newBadgeColor}
                  onChange={(e) => setNewBadgeColor(e.target.value)}
                  style={{
                    width: '100%',
                    height: '35px',
                    padding: '2px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Offer Description</label>
              <input
                type="text"
                placeholder="e.g. 10% Instant Discount up to ₹1,500"
                value={newOfferText}
                onChange={(e) => setNewOfferText(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', alignItems: 'end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Min order amount (₹)</label>
                <input
                  type="number"
                  value={newMinOrder}
                  onChange={(e) => setNewMinOrder(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem'
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  height: '35px',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} /> Add Card
              </button>
            </div>
          </form>

          {/* Active bank offers list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '240px', overflowY: 'auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)' }}>
              Active bank offers ({bankOffers.length})
            </span>
            {bankOffers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No active card discount offers added yet.
              </div>
            ) : (
              bankOffers.map((offer, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: offer.badgeColor }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '0.8rem' }}>{offer.bank}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{offer.offer} (Min: ₹{offer.minOrder})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveBankOffer(idx)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
