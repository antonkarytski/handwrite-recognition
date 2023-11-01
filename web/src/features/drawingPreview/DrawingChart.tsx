import React, { useState } from 'react'
import styles from './styles.module.scss'
import { Chart } from 'react-charts'
import { useStore } from 'effector-react'
import { selectedItem } from '../sampleController/model.ts'
import { addEdges, normalize } from '../../lib/drawings/helper.extremum.ts'

type DrawingChartProps = {}

const primaryAxis = { getValue: (datum: number[]) => datum[1] }
const secondaryAxes = [{ getValue: (datum: number[]) => datum[0] }]

enum ChartMode {
  NONE = 1,
  NORMAL = 2,
}

type ModeDescriptor = {
  label: string
  fn: (points: number[][]) => number[][]
}

const MODES_MAP: Record<ChartMode, ModeDescriptor> = {
  [ChartMode.NONE]: {
    label: 'None',
    fn: addEdges,
  },
  [ChartMode.NORMAL]: {
    label: 'Normal',
    fn: normalize,
  },
}
const DrawingChart = ({}: DrawingChartProps) => {
  const selected = useStore(selectedItem.$state)
  const [mode, setMode] = useState(ChartMode.NONE)

  if (!selected) return null

  const descriptor = MODES_MAP[mode]
  const points = selected.shapes
    .map((shape) => descriptor.fn(shape.points))
    .flat()

  return (
    <div className={styles.ChartsContainer}>
      <Chart
        options={{
          data: [
            {
              label: 'X',
              data: points.map(([x, , t]) => [x, t]),
            },
            {
              label: 'Y',
              data: points.map(([, y, t]) => [y, t]),
            },
          ],
          primaryAxis,
          secondaryAxes,
        }}
      />
      {/*<div*/}
      {/*  className={styles.ModeToggleButton}*/}
      {/*  onClick={() => {*/}
      {/*    setMode(mode === ChartMode.NONE ? ChartMode.NORMAL : ChartMode.NONE)*/}
      {/*  }}>*/}
      {/*  {`Mode: ${descriptor.label}`}*/}
      {/*</div>*/}
    </div>
  )
}

export default DrawingChart
