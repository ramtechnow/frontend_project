import React from 'react'
import './DescriptionBox.css'

export const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut,
                inventore. Quibusdam necessitatibus rerum, deserunt quidem,
                odit accusamus animi esse minus perferendis optio, 
                vitae explicabo impedit.</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                Optio repellendus ipsum autem eos mollitia inventore praesentium aliquid illum sit sequi placeat sunt atque error nihil, 
                velit obcaecati necessitatibus, iusto distinctio.</p>
        </div>
    </div>
  )
}

