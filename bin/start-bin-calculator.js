const path = require("path");
const fs = require("fs").promises;
const BinCalculator = require(path.join(
  __dirname,
  "..",
  "src",
  "BinCalculator.js"
));

const dataFilePath = path.join(__dirname, "..", "data", "real-data.json");
const outputFilePath = path.join(__dirname, "..", "output", "result-bin-analysis.csv");

function congruencySelector(data, congruency) {
  return data.filter((item) => item.congruency === congruency);
}

csvColumnHeaders = [
  "part.code",
  "bin1_cong",
  "bin2_cong",
  "bin3_cong",
  "bin4_cong",
  "bin5_cong",
  "bin1_incong",
  "bin2_incong",
  "bin3_incong",
  "bin4_incong",
  "bin5_incong",
];

const csvHeaders = csvColumnHeaders.join(",") + "\n";

async function run(start, end) {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf-8");
    const data = JSON.parse(fileContent);
    let csv = "";

    for (let i = start; i <= end; i++) {
      let filteredData = data.filter((item) => Number(item["part.code"]) == i);
      if (filteredData.length === 0) {
        continue;
      }

      const congruentData = congruencySelector(filteredData, "Congruent"); // Congruent OR Incongruent
      if (congruentData.length === 0) {
        continue;
      }

      const binCalculatorCongruent = new BinCalculator();
      await binCalculatorCongruent.calculate(congruentData, 5);
      csv += i +","+ binCalculatorCongruent
        .getResult()
        .map((item) => item["Total Reaction Time"])
        .join(",");

      const Incongruent = congruencySelector(filteredData, "Incongruent"); // Congruent OR Incongruent
      if (Incongruent.length === 0) {
        continue;
      }

      let binCalculatorIncongruent = new BinCalculator();
      await binCalculatorIncongruent.calculate(Incongruent, 5);
      csv +=
        "," +
        binCalculatorIncongruent
          .getResult()
          .map((item) => item["Total Reaction Time"])
          .join(",") + "\n";
    }
    
    await fs.writeFile(outputFilePath,csvHeaders + csv, "utf-8");
    console.log(`CSV saved successfully: ${outputFilePath}`);
  } catch (error) {
    console.error("Error processing the data:", error);
  }
}
run(1, 24);
