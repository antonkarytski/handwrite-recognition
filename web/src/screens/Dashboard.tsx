import React, { useEffect } from 'react'
import styles from '../features/dashboard/styles.module.scss'
import DrawingPreview from '../features/drawingPreview/DrawingPreview.tsx'
import { setDbPage } from '../features/db/model.ts'
import ImagesList from '../features/imagesList/ImagesList.tsx'
import {
  itemPreview,
  selectedItem,
} from '../features/sampleController/model.ts'

type DashboardProps = {}

const Dashboard = ({}: DashboardProps) => {
  useEffect(() => {
    fetch('http://localhost:3000', {
      method: 'GET',
    })
      .then((e) => {
        console.log(e)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])
  return (
    <div className={styles.Container}>
      <ImagesList
        className={styles.ImageList}
        onItemHover={itemPreview.setById}
        onItemSelect={selectedItem.setById}
      />
      <DrawingPreview />
      {/*<div>*/}
      {/*  <div onClick={() => setDbPage((page) => page + 1)}>next</div>*/}
      {/*</div>*/}
    </div>
  )
}

export default Dashboard
