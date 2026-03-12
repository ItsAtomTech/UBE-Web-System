// Multiple datasets with their own labels
const datasets = [
  {
    label: "BLIS",
    data: [
      ['2023 - 1st Sem', 12],
      ['2023 - 2nd Sem', 1],
      ['2024 - 1st Sem', 23],
      ['2024 - 2nd Sem', 43],
      ['2025 - 1st Sem', 32],
      ['2025 - 2nd Sem', 71],
    ]
  },
  {
    label: "BSIT",
    data: [
      ['2023 - 1st Sem', 31],
      ['2023 - 2nd Sem', 43],
      ['2024 - 1st Sem', 43],
      ['2024 - 2nd Sem', 12],
      ['2025 - 1st Sem', 76],
      ['2025 - 2nd Sem', 83],
    ]
  },
  {
    label: "BEED",
    data: [
      ['2023 - 1st Sem', 12],
      ['2023 - 2nd Sem', 43],
      ['2024 - 1st Sem', 50],
      ['2024 - 2nd Sem', 85],
      ['2025 - 1st Sem', 32],
      ['2025 - 2nd Sem', 10],
    ]
  },
  
];

generateMultiLineChart(
  datasets,
  'probationLineChart',
  false  // asPercentage = false for raw numbers
);