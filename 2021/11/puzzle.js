const flash = (_x, _y, grid) => {
  grid[_y][_x] = 0;

  let offsets = [
    [0, 0], [0, 1], [0, -1],
    [1, 0], [1, 1], [1, -1],
    [-1, 0], [-1, 1], [-1, -1],
  ];
  
  offsets.forEach((offset) => {
    let x = _x + offset[0];
    let y = _y + offset[1];

    if (grid[y]?.[x] === undefined || grid[y]?.[x] === 0) {
      return;
    }

    grid[y][x] = grid[y][x] + 1;

    if (grid[y][x] > 9) {
      flash(x, y, grid);
    }
  });
};

const output = (input) => {
  let octopuses = input
    .split("\n")
    .map((row) => row.split("").map((num) => parseInt(num, 10)));

  const steps = 100;
  let flashesCount = 0;

  for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
    octopuses = octopuses.map((row) => row.map((octopus) => octopus + 1));
    for (let y = 0; y < octopuses.length; y++) {
      for (let x = 0; x < octopuses[y].length; x++) {
        if (octopuses[y][x] > 9) {
          flash(x, y, octopuses);
        }
      }
    }

    flashesCount = octopuses
      .flat()
      .reduce((prev, cur) => (cur === 0 ? prev + 1 : prev), flashesCount);
  }
  return flashesCount;
};

module.exports = output;
