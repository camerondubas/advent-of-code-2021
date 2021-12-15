const fs = require("fs");
const path = require("path");
const { Command } = require("commander");
const program = new Command();

program
  .version("2021.0.1")
  .argument("<year>", "Which year to run")
  .argument("<day>", "Which day to run")
  .option("-a --advanced", "Which puzzle to run on that day (1 or 2)", false)
  .option("-d --dummy", "Use dummy input", false)
  .option("-m --metrics", "Log runtime & other metrics", false)
  .option(
    "--metrics-runs <amount>",
    "Number of times to run the puzzle, for metrics logging",
    1000
  )
  .option(
    "-f --file <name>",
    "Specify name of file within the target day's directory"
  );

const getPuzzle = async (year, day, isPartTwo, file) => {
  let filename = file || (isPartTwo ? "puzzle-2.js" : "puzzle.js");

  const puzzlePath = path.join(__dirname, year, day, filename);
  const { default: puzzle } = await import(puzzlePath);

  return puzzle;
};

const getInput = (year, day, isDummyInput) => {
  const filename = isDummyInput ? "input-dummy.txt" : "input.txt";
  return fs
    .readFileSync(path.join(__dirname, year, day, filename), "utf8")
    .trim();
};

const getRunner = (data) => {
  if (data.showMetrics) {
    return (puzzle, input) => {
      const puzzleName = data.file || (data.advanced ? "2" : "1");

      console.log("==================");
      console.log(
        `Puzzle: Day ${data.day}, ${data.file ? "File:" : "Part"} ${puzzleName}`
      );

      if (data.dummy) {
        console.log("Using dummy input");
      }
      console.log("------------------");
      let runtimes = [];
      let output;
      for (let index = 0; index < data.metricsRuns; index++) {
        let t0 = performance.now();
        output = puzzle(input);
        let t1 = performance.now();
        runtimes.push(t1 - t0);
      }
      const runtimesSum = runtimes.reduce((acc, cur) => acc + cur, 0);
      console.log("Number of Runs: ", data.metricsRuns);
      console.log(
        "Avg Runtime (ms):",
        (runtimesSum / runtimes.length).toFixed(4)
      );
      console.log("Slowest Run (ms):", Math.max(...runtimes).toFixed(4));
      console.log("Fastest Run (ms):", Math.min(...runtimes).toFixed(4));
      console.log("Output: ", output);
      console.log("==================");
    };
  }
  return (puzzle, input) => puzzle(input);
};

const run = async (program) => {
  const { dummy, advanced, metrics, metricsRuns, file } = program.opts();
  const year = program.args[0];
  const day = program.args[1].padStart(2, "0");
  const data = {
    showMetrics: metrics,
    metricsRuns,
    day,
    advanced,
    dummy,
    file,
  };

  const input = getInput(year, day, dummy);
  const puzzle = await getPuzzle(year, day, advanced, file);
  const runner = getRunner(data);

  return runner(puzzle, input);
};

program.parse();

run(program)
  .then((output) => {
    console.log(output);
  })
  .catch((err) => {
    if (err.code === "ENOENT") {
      console.log("Error: Could not find this puzzle.");
    } else {
      throw err;
    }
  });
