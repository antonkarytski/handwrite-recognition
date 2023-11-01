const getPercentageString = (value, max) => {
  const percentage = Math.round((value / max) * 100);
  return `${percentage}%`;
}

const consoleUtils = {
  printProgress: (label, value, max) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${label} progress: ${value}/${max} (${getPercentageString(value, max)})`);
  }
}

const mathUtils = {
  round(coords, accuracy = 100) {
    return {
      x: Math.round((coords.x + Number.EPSILON) * accuracy) / accuracy,
      y: Math.round((coords.y + Number.EPSILON) * accuracy) / accuracy,
    }
  },
  midPointBetween(p1, p2) {
    if (!p2) return [ ...p1]
    return [
      p1[0] + (p2[0] - p1[0]) / 2,
      p1[1] + (p2[1] - p1[1]) / 2
    ]
  }
}


module.exports = {
  consoleUtils,
  mathUtils,
}
