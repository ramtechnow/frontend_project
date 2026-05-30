import React, { useState, useEffect } from 'react';
import './DescriptionBox.css';

export const DescriptionBox = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'reviews'
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: ''
  });

  const productId = product?.id || 1;

  // Load reviews from localStorage on product ID change
  useEffect(() => {
    const cachedReviews = localStorage.getItem(`product-reviews-${productId}`);
    if (cachedReviews) {
      try {
        setReviews(JSON.parse(cachedReviews));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default placeholder reviews to make the page look premium
      const placeholders = [
        {
          name: "Emily R.",
          rating: 5,
          comment: "Absolutely in love with this! The quality is amazing, fits perfectly, and the material feels super premium. Will definitely buy in other colors!",
          date: "May 12, 2026"
        },
        {
          name: "Marcus K.",
          rating: 4,
          comment: "Great fit and styling! It is lightweight and exactly as shown in the picture. Shipping was incredibly fast too.",
          date: "May 20, 2026"
        }
      ];
      setReviews(placeholders);
      localStorage.setItem(`product-reviews-${productId}`, JSON.stringify(placeholders));
    }
  }, [productId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (stars) => {
    setFormData({ ...formData, rating: stars });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) {
      alert("Please fill in your name and comment.");
      return;
    }

    const newReview = {
      name: formData.name,
      rating: Number(formData.rating),
      comment: formData.comment,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`product-reviews-${productId}`, JSON.stringify(updatedReviews));

    // Reset form
    setFormData({
      name: '',
      rating: 5,
      comment: ''
    });
  };

  // Compute average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "5.0";

  return (
    <div className='descriptionbox'>
      {/* Tab selectors */}
      <div className="descriptionbox-navigator">
        <button 
          className={`descriptionbox-nav-box ${activeTab === 'description' ? 'active' : 'fade'}`}
          onClick={() => setActiveTab('description')}
        >
          Description
        </button>
        <button 
          className={`descriptionbox-nav-box ${activeTab === 'reviews' ? 'active' : 'fade'}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {/* Dynamic Tab Body */}
      <div className="descriptionbox-content">
        {activeTab === 'description' ? (
          <div className="description-tab-body">
            <p>
              Introducing our premium edition {product?.name || "eCommerce product"}. Crafted using the finest fabric blends, this product combines modern aesthetics with everyday functionality. Designed for maximum comfort, it offers a breathable, structured silhouette that flatters all fits. Perfect for casual wear, outings, or styling up for smart-casual events.
            </p>
            <p>
              Every garment undergoes rigorous quality checks to ensure seamless stitching, long-lasting durability, and color fastness. With custom ribbed details, modern closures, and pre-shrunk fabrics, it serves as the ultimate addition to your seasonal wardrobe. Elevate your personal fashion today.
            </p>
          </div>
        ) : (
          <div className="reviews-tab-body">
            {/* Reviews Summary Header */}
            <div className="reviews-summary-card">
              <div className="average-rating-container">
                <span className="big-rating">{avgRating}</span>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span 
                      key={s} 
                      className="star-symbol" 
                      style={{ color: s <= Math.round(avgRating) ? '#ffb800' : '#d1d5db' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="reviews-label">Based on {reviews.length} reviews</span>
              </div>
            </div>

            {/* List of reviews */}
            <div className="reviews-list">
              {reviews.map((rev, index) => (
                <div key={index} className="review-card">
                  <div className="review-card-header">
                    <span className="reviewer-name">{rev.name}</span>
                    <span className="review-date">{rev.date}</span>
                  </div>
                  <div className="review-card-stars">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span 
                        key={s} 
                        className="star-symbol" 
                        style={{ color: s <= rev.rating ? '#ffb800' : '#d1d5db' }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="reviewer-comment">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Submit a review form */}
            <div className="write-review-section">
              <h3>Write a Review</h3>
              <form onSubmit={handleFormSubmit} className="review-submission-form">
                <div className="form-row-half">
                  <div className="form-group">
                    <label htmlFor="reviewer-name">Your Name</label>
                    <input 
                      type="text" 
                      id="reviewer-name"
                      name="name" 
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleInputChange} 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="interactive-stars-row">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="interactive-star-btn"
                          onClick={() => handleRatingChange(s)}
                          title={`Rate ${s} Stars`}
                        >
                          <span 
                            className="star-symbol interactive-star" 
                            style={{ color: s <= formData.rating ? '#ffb800' : '#9ca3af' }}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewer-comment">Review Content</label>
                  <textarea 
                    id="reviewer-comment"
                    name="comment"
                    rows="4" 
                    placeholder="Share your thoughts about this product..."
                    value={formData.comment}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-review-btn">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionBox;
