// Multiple datasets with their own labels
const datasets = [
  {
    label: "BLIS",
    data: [
      ['2023 - 1st Sem', 60],
      ['2023 - 2nd Sem', 120],
      ['2024 - 1st Sem', 80],
      ['2024 - 2nd Sem', 80],
      ['2025 - 1st Sem', 80],
      ['2025 - 2nd Sem', 60],
    ]
  },
  {
    label: "BSIT",
    data: [
      ['2023 - 1st Sem', 60],
      ['2023 - 2nd Sem', 0],
      ['2024 - 1st Sem', 40],
      ['2024 - 2nd Sem', 40],
      ['2025 - 1st Sem', 40],
      ['2025 - 2nd Sem', 60],
    ]
  },
  {
    label: "BEED",
    data: [
      ['2023 - 1st Sem', null],
      ['2023 - 2nd Sem', null],
      ['2024 - 1st Sem', null],
      ['2024 - 2nd Sem', null],
      ['2025 - 1st Sem', 60],
      ['2025 - 2nd Sem', 60],
    ]
  },
  
];

generateMultiLineChart(
  datasets,
  'probationLineChart',
  false  // asPercentage = false for raw numbers
);