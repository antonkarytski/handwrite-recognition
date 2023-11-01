import React from 'react'
import styles from './styles.module.scss'
import { useStore } from 'effector-react'
import { $db } from '../db/model.ts'
import { clsx } from 'clsx'

type ImagesListProps = {
  onItemHover?: (index: number) => void
  onItemSelect?: (index: number) => void
  className?: string
}

const ImagesList = React.memo(
  ({ onItemHover, onItemSelect, className }: ImagesListProps) => {
    const db = useStore($db)

    return (
      <div className={clsx(styles.ImageList, className)}>
        {db.histories.map((item) => {
          return (
            <div
              onMouseEnter={() => {
                onItemHover?.(item.id)
              }}
              onClick={() => {
                onItemSelect?.(item.id)
              }}
              key={item.id}
              className={styles.Image}>
              <img
                alt={'drawing sample'}
                src={`../assets/drawings/${item.id}.png`}
              />
            </div>
          )
        })}
      </div>
    )
  }
)

export default ImagesList
