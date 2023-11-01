const {mathUtils} = require('../lib/utils');
const {createCanvas} = require('canvas')



function extremum(points) {
  return points.reduce((extremum, point) => {
    extremum.x0 = Math.min(point.x, extremum.x0)
    extremum.y0 = Math.min(point.y, extremum.y0)
    extremum.x1 = Math.max(point.x, extremum.x1)
    extremum.y1 = Math.max(point.y, extremum.y1)
    return extremum
  }, {
    x0: Infinity,
    y0: Infinity,
    x1: 0,
    y1: 0,
  })
}

function mergeExtremum(e1, e2){
  return {
    x0: Math.min(e1.x0, e2.x0),
    x1: Math.max(e1.x1, e2.x1),
    y0: Math.min(e1.y0, e2.y0),
    y1: Math.max(e1.y1, e2.y1),
  }
}

function normalize(points, extremum){
  return points.map((point) => {
    return [
      point.x - extremum.x0,
      point.y - extremum.y0,
      Math.round(point.t)
    ]
  })
}

const markupFreeDrawing = (
  target,
  points
) => {
  let [p1, p2] = points
  target.moveTo(p2[0], p2[1])
  const firstMidPoint = mathUtils.midPointBetween(p1, p2)
  target.lineTo(firstMidPoint[0], firstMidPoint[1])
  for (let i = 1; i < points.length - 1; i++) {
    p1 = points[i]
    p2 = points[i + 1]
    const midPoint = mathUtils.midPointBetween(p1, p2)
    target.quadraticCurveTo(p1[0], p1[1], midPoint[0], midPoint[1])
  }
  target.lineTo(p2[0], p2[1])
}

const drawFreeDrawing = (ctx, shape) => {
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 3
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  markupFreeDrawing(ctx, shape)
  ctx.stroke()
}

const createDrawer = () => {
  const canvas = createCanvas(500, 500)
  const ctx = canvas.getContext('2d')

  return {
    set: ({size}) => {
      canvas.width = Math.floor(+size.width)
      canvas.height = Math.floor(+size.height)
    },
    draw: (shape) => {
      drawFreeDrawing(ctx, shape)
    },
    getImage: () => {
      return canvas.toBuffer('image/png')
    }
  }
}

module.exports = {
  extremum,
  mergeExtremum,
  normalize,
  createDrawer
}
