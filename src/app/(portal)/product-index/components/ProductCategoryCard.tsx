'use client'

import { useRouter } from 'next/navigation'
import { ProductItem } from '../data/categories'
import styles from '../product-index.module.css'

interface ProductCategoryCardProps {
  item: ProductItem
}

export default function ProductCategoryCard({ item }: ProductCategoryCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(item.linkUrl)
  }

  return (
    <div className={styles.productItem}>
      <div className={styles.productItemImage}>
        <img src={item.imageUrl} alt={item.title} />
      </div>
      <div className={styles.productItemTitle}>
        <h3>{item.title}</h3>
      </div>
      <div className={styles.productItemDesc}>
        {item.description.map((line, index) => (
          <span key={index}>
            {line}
            {index < item.description.length - 1 && <br />}
          </span>
        ))}
      </div>
      <button 
        className={styles.productItemLink}
        onClick={handleClick}
      >
        View product
      </button>
    </div>
  )
}