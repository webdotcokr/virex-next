'use client'

import ProductCategoryCard from './ProductCategoryCard'
import { ProductItem } from '../data/categories'
import styles from '../product-index.module.css'

interface ProductCategoryGridProps {
  items: ProductItem[]
}

export default function ProductCategoryGrid({ items }: ProductCategoryGridProps) {
  return (
    <div className={styles.productList}>
      {items.map((item) => (
        <ProductCategoryCard key={item.id} item={item} />
      ))}
    </div>
  )
}