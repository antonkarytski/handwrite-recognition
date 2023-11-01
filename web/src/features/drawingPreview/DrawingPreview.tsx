import React, { useRef } from 'react'
import { Stage, Layer, Line } from 'react-konva'
import { useStore } from 'effector-react'
import { selectedItem } from '../sampleController/model.ts'
import styles from './styles.module.scss'
import DrawingChart from './DrawingChart.tsx'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'

type DrawingPreviewProps = {}

class Selection {
  public x1: number = 0
  public y1: number = 0
  public x2: number = 0
  public y2: number = 0

  public readonly rect = new Konva.Rect({
    fill: 'rgba(0,0,255,0.5)',
    visible: false,
  })

  public get isVisible() {
    return this.rect.visible()
  }

  public start(position: Konva.Vector2d) {
    this.x1 = position.x
    this.y1 = position.y
    this.x2 = position.x
    this.y2 = position.y
    this.rect.visible(true)
    this.rect.width(0)
    this.rect.height(0)
  }

  public move(position: Konva.Vector2d) {
    this.x2 = position.x
    this.y2 = position.y

    this.rect.setAttrs({
      x: Math.min(this.x1, this.x2),
      y: Math.min(this.y1, this.y2),
      width: Math.abs(this.x2 - this.x1),
      height: Math.abs(this.y2 - this.y1),
    })
  }

  public end() {
    setTimeout(() => {
      this.rect.visible(false)
    })
  }
}

class CanvasModel {
  private _layer: Konva.Layer | null = null
  private _stage: Konva.Stage | null = null
  private readonly selection = new Selection()

  public readonly initLayer = (layer: Konva.Layer | null) => {
    if (this._layer === layer) return
    this._layer = layer
    if (layer) {
      layer.add(this.selection.rect)
    }
  }

  public readonly initStage = (stage: Konva.Stage | null) => {
    if (this._stage === stage) return
    this._stage = stage
  }

  public readonly onActionDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!this._stage) return
    e.evt.preventDefault()
    const point = this._stage.getPointerPosition()
    if (!point) return
    this.selection.start({
      x: point.x / this._stage.scaleX(),
      y: point.y / this._stage.scaleY(),
    })
  }

  public readonly onActionMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!this.selection.isVisible || !this._stage) return
    e.evt.preventDefault()
    const point = this._stage.getPointerPosition()
    if (!point) return
    this.selection.move({
      x: point.x / this._stage.scaleX(),
      y: point.y / this._stage.scaleY(),
    })
  }

  public readonly onActiveEnd = (e: KonvaEventObject<MouseEvent>) => {
    if (!this.selection.isVisible || !this._stage) return
    e.evt.preventDefault()
    this.selection.end()

    const box = this.selection.rect.getClientRect()
    const selected = this._stage.find('.line').filter((shape) => {
      console.log(shape.getClientRect(), box)
      return Konva.Util.haveIntersection(box, shape.getClientRect())
    })

    console.log(selected)
  }
}

const useConst = <T,>(fn: () => T): T => {
  const ref = useRef<T>()
  if (!ref.current) ref.current = fn()
  return ref.current
}

const DrawingPreview = ({}: DrawingPreviewProps) => {
  const model = useConst(() => new CanvasModel())
  const selected = useStore(selectedItem.$state)
  const maxSize = selected
    ? Math.max(selected.size.width, selected.size.height)
    : 500
  const scale = Math.min(1, 300 / maxSize)

  return (
    <div className={styles.DrawingPreviewContainer}>
      <Stage
        onMouseDown={model.onActionDown}
        onMouseMove={model.onActionMove}
        onMouseUp={model.onActiveEnd}
        ref={model.initStage}
        scale={{ x: scale, y: scale }}
        width={400}
        height={300}
      >
        <Layer ref={model.initLayer}>
          {!!selected &&
            selected.shapes.map((shape, index) => {
              return (
                <Line
                  name={'line'}
                  key={index}
                  points={shape.points.map(([x, y]) => [x, y]).flat()}
                  stroke='black'
                  strokeWidth={3}
                  tension={0.5}
                  lineCap='round'
                  lineJoin='round'
                />
              )
            })}
        </Layer>
      </Stage>
      <DrawingChart />
    </div>
  )
}

export default DrawingPreview
