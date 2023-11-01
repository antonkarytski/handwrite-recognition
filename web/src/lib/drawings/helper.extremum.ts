type Extremum = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};
export function extremum(points: number[][]) {
  return points.reduce(
    (extremum, point) => {
      extremum.x0 = Math.min(point[0], extremum.x0);
      extremum.y0 = Math.min(point[1], extremum.y0);
      extremum.x1 = Math.max(point[0], extremum.x1);
      extremum.y1 = Math.max(point[1], extremum.y1);
      return extremum;
    },
    {
      x0: Infinity,
      y0: Infinity,
      x1: 0,
      y1: 0,
    }
  );
}

export function normalize(points: number[][]) {
  const { x0, y0 } = extremum(points);
  const result = points.map(([x, y, t]) => [x - x0, y - y0, t]);
  result.unshift([0, 0, result[0][2]]);
  result.push([0, 0, result[result.length - 1][2]]);
  return result;
}

export function addEdges(points: number[][]) {
  const result = [...points];
  result.unshift([0, 0, result[0][2]]);
  result.push([0, 0, result[result.length - 1][2]]);
  return result;
}
