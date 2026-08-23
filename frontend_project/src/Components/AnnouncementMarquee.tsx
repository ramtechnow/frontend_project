import React from 'react';
import '../Styles/announcementMarquee.css';

interface AnnouncementMarqueeProps {
  text: string;
  bg?: string;
}

export const AnnouncementMarquee: React.FC<AnnouncementMarqueeProps> = ({ text, bg }) => {
  if (!text || !text.trim()) return null;

  return (
    <div 
      className="announcement-marquee-bar" 
      style={{ background: bg || 'linear-gradient(90deg, #ec4899, #8b5cf6)' }}
    >
      <div className="announcement-marquee-track">
        <span className="announcement-marquee-text">{text} &nbsp; | &nbsp; {text} &nbsp; | &nbsp; {text} &nbsp; | &nbsp; {text}</span>
        <span className="announcement-marquee-text" aria-hidden="true">{text} &nbsp; | &nbsp; {text} &nbsp; | &nbsp; {text} &nbsp; | &nbsp; {text}</span>
      </div>
    </div>
  );
};

export default AnnouncementMarquee;
