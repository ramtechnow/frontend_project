export interface BankOffer {
  bank: string;
  badgeColor: string;
  offer: string;
  minOrder: number;
}

export interface SeasonalPromo {
  theme: string; // 'General' | 'Diwali' | 'VinayagarChaturthi' | 'NewYear' | 'Pongal'
  announcementText: string;
  announcementBg: string;
  enableParticles: boolean;
  particleType: string; // 'lamp' | 'flower' | 'balloon' | 'star'
  bankOffers: BankOffer[];
  updatedAt?: string;
}
