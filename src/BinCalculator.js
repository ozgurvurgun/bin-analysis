class BinCalculator {
  constructor() {
    this.currentBin = {};
    this.result = [];
    this.dataLengthPossibilities = {
     "5k+1" :   [0, 0, 0, 0, 0],
     "5k+2" :   [0, 0, 1, 0, 0],
     "5k+3" :   [0, 1, 0, 1, 0],
     "5k+4" :   [0, 1, 1, 1, 0]
    };
    this.selectedDataLength = [];
  }

  // Utility: Round to nearest step
  roundToNearestStep(num, step) {
    return Math.ceil(num / step) * step;
  }

  // Display bins as a table
  displayBinsTable() {
    const tableData = [];

    this.result.forEach((binData, index) => {
      const binName = `bin${index + 1}`;
      const binItems = binData[binName];

      if (binItems && binItems.length > 0) {
        const totalReactionTime = binItems.reduce((sum, item) => sum + item.binResult, 0);
        const minReactionTime = Math.min(...binItems.map((item) => item.reaction_time));
        const maxReactionTime = Math.max(...binItems.map((item) => item.reaction_time));

        tableData.push({
          Bin: binName,
          "Total Reaction Time": totalReactionTime,
          "Min Reaction Time": minReactionTime,
          "Max Reaction Time": maxReactionTime,
        });
      }
    });

    console.table(tableData);
  }

  displayBinsJson(){
    console.log(JSON.stringify(this.result, null, 2));
  }

  getResult(){
    const tableData = [];

    this.result.forEach((binData, index) => {
      const binName = `bin${index + 1}`;
      const binItems = binData[binName];

      if (binItems && binItems.length > 0) {
        const totalReactionTime = binItems.reduce((sum, item) => sum + item.binResult, 0);
        const minReactionTime = Math.min(...binItems.map((item) => item.reaction_time));
        const maxReactionTime = Math.max(...binItems.map((item) => item.reaction_time));

        tableData.push({
          Bin: binName,
          "Total Reaction Time": totalReactionTime,
          "Min Reaction Time": minReactionTime,
          "Max Reaction Time": maxReactionTime,
        });
      }
    });

    return tableData
  }

  tempResultRecord(bin_name, binResult, reaction_time, numerator) {
    let binObject = {
      binResult: binResult,
      reaction_time: reaction_time,
      numerator: numerator,
    };
    this.currentBin[bin_name].push(binObject);
  }

  findClosestAddition(start, increment, target) {
    let current = start;
    let closestDifference = target - current;
    let closestCount = 0;
  
    for (let count = 0; current <= target; count++) {
      const newDifference = target - current;
  
      if (newDifference < closestDifference) {
        closestDifference = newDifference;
        closestCount = count;
      }
  
      // Bir sonraki adıma geç
      current += increment;
    }
  
    return {closestDifference, closestCount};
  }

  // Core logic for bin calculation
  calculateBins(sortedData, dataLength, realBinCount, innerIteration) {
    let tempBin = realBinCount;
    let tempBinCounter = 0;
    let arrayCounter = 0;
  
    for (let i = 0; i < realBinCount; i++) {
      this.currentBin = {};
      this.currentBin[`bin${i + 1}`] = [];
      let realIteration = innerIteration + this.selectedDataLength[i]
      for (let j = 0; j < realIteration; j++) { 
        
        if (i === 0) {
          tempBinCounter += realBinCount;
          tempBin = tempBinCounter > dataLength ? dataLength % realBinCount : tempBin;
          let binResult = (tempBin / dataLength) * sortedData[j].reaction_time;
          this.tempResultRecord(`bin${i + 1}`, binResult, sortedData[j].reaction_time, tempBin);          
 
        } else {
          const previousBin = this.result[i - 1];
          const binName = `bin${i}`;
          let binLastElement;
          let startNumerator = 0;
          let startReactionTime = 0;
          binLastElement = (previousBin && previousBin[binName].length > 0) ? previousBin[binName].at(-1) : undefined;

          if (j === 0) {
            startNumerator = realBinCount - binLastElement.numerator;
            startReactionTime = binLastElement.reaction_time;
            let binResult = (startNumerator / dataLength) * startReactionTime;
            this.tempResultRecord(`bin${i + 1}`, binResult, startReactionTime, startNumerator);
                        
          } else if (j >= 1 && j <= realIteration - 2) {
            let binResult = (realBinCount / dataLength) * sortedData[arrayCounter ].reaction_time;
            this.tempResultRecord(`bin${i + 1}`, binResult, sortedData[arrayCounter].reaction_time, realBinCount);
                      
          } else if (j == realIteration - 1 && i != realBinCount - 1){
            let numerator =  this.findClosestAddition(realBinCount - binLastElement.numerator, realBinCount, dataLength).closestDifference;            
            let binResult = (numerator / dataLength) * sortedData[arrayCounter].reaction_time;
            this.tempResultRecord(`bin${i + 1}`, binResult, sortedData[arrayCounter].reaction_time, numerator);
        
          } else{
            let binResult = (realBinCount / dataLength) * sortedData[arrayCounter].reaction_time;
            this.tempResultRecord(`bin${i + 1}`, binResult, sortedData[arrayCounter].reaction_time, realBinCount);
           
          }
        }

        arrayCounter++;
      }

      arrayCounter--;
      this.result.push(this.currentBin);

    }
  }

  calculateBinsExact(sortedData, dataLength, realBinCount, innerIteration){
    let arrayCounter = -1;

    for (let i = 0; i < realBinCount; i++) {
      this.currentBin = {};
      this.currentBin[`bin${i + 1}`] = [];
      
      for (let j = 0; j < innerIteration; j++) {
        arrayCounter++;
        let binResult = (realBinCount / dataLength) * sortedData[arrayCounter].reaction_time;
        this.tempResultRecord(`bin${i + 1}`, binResult, sortedData[arrayCounter].reaction_time, realBinCount);
      }

      this.result.push(this.currentBin);
    }
  }

  // Main bin calculation function
async calculate(data, binCount) {
  this.data = data;
  this.binCount = binCount;
  try {
    const dataLength = this.data.length;
    const innerIteration = this.roundToNearestStep(dataLength, this.binCount) / this.binCount;
    
    if (dataLength % this.binCount == 0) {
      this.calculateBinsExact(this.data, dataLength, this.binCount, innerIteration);
    }else{

      if (dataLength % this.binCount == 1) {
        this.selectedDataLength = this.dataLengthPossibilities["5k+1"];
      } else if(dataLength % this.binCount == 2){
        this.selectedDataLength = this.dataLengthPossibilities["5k+2"];
      }
      else if(dataLength % this.binCount == 3){
        this.selectedDataLength = this.dataLengthPossibilities["5k+3"];
      } else if(dataLength % this.binCount == 4){
        this.selectedDataLength = this.dataLengthPossibilities["5k+4"];
      }
      
      this.calculateBins(this.data, dataLength, this.binCount, innerIteration);
    }

  } catch (err) {
    console.error("Error reading file:", err);
  }
}
}

module.exports = BinCalculator;
