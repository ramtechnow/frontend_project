import React from 'react';
import Hero from '../Components/Hero/Hero';
import TopCategories from '../Components/TopCategories/TopCategories';
import Offers from '../Components/Offers/Offers';
import { Popular } from '../Components/Popular/Popular';
import HowItWorks from '../Components/HowItWorks/HowItWorks';
import DealOfTheWeek from '../Components/DealOfTheWeek/DealOfTheWeek';
import { NewCollection } from '../Components/NewCollections/NewCollection';
import Testimonials from '../Components/Testimonials/Testimonials';
import NewsLetter from '../Components/NewsLetter/NewsLetter';

export const Shop = () => {
  return (
    <div className="shop-homepage-wrapper animate-fade-in" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Hero />
      <TopCategories />
      <Offers />
      <Popular />
      <HowItWorks />
      <DealOfTheWeek />
      <NewCollection />
      <Testimonials />
      <NewsLetter />
    </div>
  );
};

export default Shop;
