import React from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
 
export const Item = (props) => {
  return (
    <motion.div 
      className='item'
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.02 }}
    >
        <Link to={`/product/${props.id}`}>
          <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt={props.name} />
        </Link>
        <p>{props.name}</p>
        <div className="item-prices">
            <div className="item-price-new">
                ₹{props.new_price}
            </div>
            {props.old_price && (
              <div className="item-price-old">
                  ₹{props.old_price}
              </div>
            )}
        </div>
    </motion.div>
  );
};
