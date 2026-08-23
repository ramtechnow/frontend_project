const mongoose = require('mongoose');

const SeasonalPromoSchema = new mongoose.Schema({
  theme: { type: String, default: 'General' }, // 'General', 'Diwali', 'VinayagarChaturthi', 'NewYear', 'Pongal', etc.
  announcementText: { type: String, default: '' },
  announcementBg: { type: String, default: 'linear-gradient(90deg, #ec4899, #8b5cf6)' },
  enableParticles: { type: Boolean, default: false },
  particleType: { type: String, default: 'star' }, // 'lamp', 'flower', 'balloon', 'star'
  bankOffers: [{
    bank: { type: String, required: true },
    badgeColor: { type: String, default: '#004B87' },
    offer: { type: String, required: true },
    minOrder: { type: Number, default: 0 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SeasonalPromo', SeasonalPromoSchema);
