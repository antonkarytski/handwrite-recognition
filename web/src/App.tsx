import ImagesList from './features/imagesList/ImagesList.tsx'
import { useEffect, useState } from 'react'
import { itemPreview, selectedItem } from './features/sampleController/model.ts'
import styles from './features/dashboard/styles.module.scss'
import DrawingPreview from './features/drawingPreview/DrawingPreview.tsx'
import { setDbPage } from './features/db/model.ts'
import Dashboard from './screens/Dashboard.tsx'

//react virtuoso
//react flow
//tiptap
//tanstack table
//Recoil
//Zod
//react intl
//Enzyme
//mobx
//https://github.com/reactchartjs/react-chartjs-2

//Mafs
//https://roughjs.com/
// https://two.js.org/
//https://mathigon.io/fermat/
//https://airbnb.io/visx/
//https://d3js.org/

function App() {
  return <Dashboard />
}

export default App
