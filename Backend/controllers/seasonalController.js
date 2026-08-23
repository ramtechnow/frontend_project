const SeasonalPromo = require('../models/SeasonalPromo');

// Fetch active seasonal promo settings (Public)
exports.getSeasonalPromo = async (req, res) => {
  try {
    let promo = await SeasonalPromo.findOne({});
    if (!promo) {
      // Seed initial default promo settings if none exist
      promo = new SeasonalPromo({
        theme: 'General',
        announcementText: 'Welcome to RamCart! Check out our new season collections.',
        announcementBg: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
        enableParticles: false,
        particleType: 'star',
        bankOffers: [
          {
            bank: 'HDFC Bank',
            badgeColor: '#004B87',
            offer: '10% Instant Discount on HDFC Credit Cards',
            minOrder: 1500
          },
          {
            bank: 'ICICI Bank',
            badgeColor: '#002B49',
            offer: 'Flat ₹150 Cashback on ICICI UPI Payments',
            minOrder: 1999
          }
        ]
      });
      await promo.save();
    }
    res.json(promo);
  } catch (error) {
    console.error("Error fetching seasonal promo:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// Save/Update seasonal promo settings (Admin Only)
exports.saveSeasonalPromo = async (req, res) => {
  try {
    const { theme, announcementText, announcementBg, enableParticles, particleType, bankOffers } = req.body;
    
    let promo = await SeasonalPromo.findOne({});
    if (!promo) {
      promo = new SeasonalPromo();
    }

    promo.theme = theme || 'General';
    promo.announcementText = announcementText !== undefined ? announcementText : '';
    promo.announcementBg = announcementBg || 'linear-gradient(90deg, #ec4899, #8b5cf6)';
    promo.enableParticles = enableParticles !== undefined ? Boolean(enableParticles) : false;
    promo.particleType = particleType || 'star';
    
    if (Array.isArray(bankOffers)) {
      promo.bankOffers = bankOffers;
    }

    promo.updatedAt = new Date();
    await promo.save();
    
    console.log(`🎉 Seasonal promo updated: Theme = ${promo.theme}, Particles = ${promo.enableParticles}`);
    res.json({ success: true, promo });
  } catch (error) {
    console.error("Error saving seasonal promo:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
