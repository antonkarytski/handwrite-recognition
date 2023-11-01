import { createEvent, createStore } from 'effector'

export type Shape = {
  points: number[][]
}

export type DrawingHistory = {
  shapes: Shape[]
  features: {
    pathCount: number
    pointCount: number
  }
  size: {
    width: number
    height: number
  }
  id: number
}

export type Db = {
  histories: DrawingHistory[]
}

export const setDbPage = createEvent<number | ((current: number) => number)>()
export const $dbPage = createStore(0).on(setDbPage, (state, payload) => {
  return typeof payload === 'number' ? payload : payload(state)
})

const setDb = createEvent<Db>()
export const $db = createStore<Db>({ histories: [] }).on(
  setDb,
  (_, payload) => payload
)

$dbPage.watch((page) => {
  fetch(`../../assets/db-${page}.json`)
    .then((e) => e.json())
    .then((e) => {
      setDb(e)
    })
})
