const { listCharts,getChart } = require('billboard-top-100');

listCharts((err, charts) => {
    if (err) console.log(err);
    console.log(charts); // prints array of all charts

    
  });