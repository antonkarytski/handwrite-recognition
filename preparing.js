const lz = require("lz-string");
const fs = require("fs");
const { consoleUtils } = require("./lib/utils");
const CONSTANTS = require("./core/constants");
const free = require("./core/free");

const compression = {
  server: {
    compress: lz.compressToEncodedURIComponent,
    decompress: lz.decompressFromEncodedURIComponent,
  },
};

const drawer = free.createDrawer();

function preparing() {
  const json = fs.readFileSync("../drawinghistories.json");
  const records = JSON.parse(json);
  process.stdout.write(`\nInitial length: ${records.length} \n`);
  let emptyHistories = 0;
  let onlyGeometric = 0;
  const list = records.reduce((acc, record, index) => {
    consoleUtils.printProgress("Cleaning", index, records.length);
    const result = compression.server.decompress(record.history);
    if (!result) return acc;
    const history = JSON.parse(result);
    let hadShapes = !!history.cache.length;
    const freeShapes = history.cache.reduce((pointsAcc, shape) => {
      if (
        (!shape.variant || shape.variant === CONSTANTS.SHAPE_VARIANT.CREATE) &&
        shape.name === "free" &&
        shape.points.length > 3
      ) {
        pointsAcc.push(shape.points);
      }
      return pointsAcc;
    }, []);
    if (!freeShapes.length) {
      if (!history.cache.length) emptyHistories++;
      if (hadShapes) onlyGeometric++;
      return acc;
    }
    const extremum = freeShapes.reduce((acc, points) => {
      const result = free.extremum(points);
      if (!acc) return result;
      if (!result) return acc;
      return free.mergeExtremum(acc, result);
    }, null);
    const normalized = freeShapes.map((points) => ({
      points: free.normalize(points, extremum),
    }));
    acc.push({
      shapes: normalized,
      size: {
        width: extremum.x1 - extremum.x0,
        height: extremum.y1 - extremum.y0,
      },
    });
    return acc;
  }, []);
  process.stdout.write(`\n Result length: ${list.length} \n`);
  console.log(
    `Empty histories: ${emptyHistories}\nOnly geometric: ${onlyGeometric}`
  );
  const db = JSON.parse(fs.readFileSync("./db.json"));
  db.histories = list;
  fs.writeFileSync("./db.json", JSON.stringify(db));
}

function redraw() {
  const db = JSON.parse(fs.readFileSync("./db.json"));
  db.histories.forEach((history, index) => {
    consoleUtils.printProgress("Redrawing", index, histories.length);
    drawer.set({ size: history.size });
    history.shapes.forEach((shape) => {
      drawer.draw(shape.points);
    });
    try {
      const image = drawer.getImage();
      fs.writeFileSync(`./web/assets/drawings/${index}.png`, image);
    } catch {}
  });
}

function normalizeTimestamps(shapes) {
  let firstTimestamp = shapes[0].points[0][2];
  let prevTimestamp = firstTimestamp;
  let prevOriginalTimestamp = firstTimestamp;
  return shapes.map((shape) => {
    shape.points = shape.points.map((point) => {
      let newTimeStamp = point[2] - firstTimestamp;
      if (newTimeStamp < 0) {
        let newTimeStamp = prevTimestamp + 100;
      }
      if (newTimeStamp < prevTimestamp) {
        let newTimeStamp = prevOriginalTimestamp - point[2] + prevTimestamp;
      }
      prevOriginalTimestamp = point[2];
      prevTimestamp = newTimeStamp;
      point[2] = newTimeStamp;
      return point;
    });
    return shape;
  });
}

function addFeatures() {
  const db = JSON.parse(fs.readFileSync("./web/assets/db.json"));
  db.histories = db.histories.map((history, index) => {
    consoleUtils.printProgress("Adding features", index, db.histories.length);
    if (!history.features) history.features = {};
    if (history.features.pathsCount === undefined) {
      history.features.pathsCount = history.shapes.length;
    }
    if (history.features.pointsCount === undefined) {
      history.features.pointsCount = history.shapes.reduce((acc, shape) => {
        acc += shape.points.length;
        return acc;
      }, 0);
    }
    if (history.id === undefined) {
      history.id = index;
      history.shapes = normalizeTimestamps(history.shapes);
    }
    return history;
  });
  fs.writeFileSync("./web/assets/db.json", JSON.stringify(db));
}

const CHUNK_SIZE = 100;
function split() {
  const db = JSON.parse(fs.readFileSync("./web/assets/db.json"));
  const count = Math.ceil(db.histories.length / CHUNK_SIZE);
  for (let i = 0; i < count; i++) {
    const start = i * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    const part = db.histories.slice(start, end).map((history, i) => ({
      ...history,
      id: i + start,
    }));
    fs.writeFileSync(
      `./web/assets/db-${i}.json`,
      JSON.stringify({ histories: part })
    );
  }
}

/*
type History = {
 shapes: {
   points: [number, number][],
 },
 size: {
   width: number,
   height: number,
 }
}
 */

//transmit()
//preparing()
//redraw()
//addFeatures();
split();
