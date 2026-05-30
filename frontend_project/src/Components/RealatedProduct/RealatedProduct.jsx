import React from 'react'
import './RealatedProduct.css'
import data_product from '../Assets/data'
import { Item } from '../Item/Item'

export const RealatedProduct = () => {
  return (
    <div className="realatedproduct">
        <h1>Realted Products</h1>
        <hr />
        <div className="realatedproduct-item">
            {data_product.map((item,i)=>{
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
        </div>
    </div>
  )
}
