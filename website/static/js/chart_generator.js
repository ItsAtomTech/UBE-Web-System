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




qBuilder.server_address = "_";

//getsems_progdata





function getSemServerData(){
	
	
	let querys = qBuilder.sendQuery(renderToGraph,"getsems_progdata",[],undefined);
	
	
}


function renderToGraph(data){
	let setsdata = JSON.parse(event.target.responseText);
	// console.log(setsdata);
	
	generateMultiLineChart(
	  setsdata.data,
	  'probationLineChart',
	  false  // asPercentage = false for raw numbers
	);
	
	
}


getSemServerData();
window.setInterval(getSemServerData, 2000);



//Filters and Modal Pickers Function:

let program_filter = [];



 function searchProgramOptions(searchText) {
    var listContainer = document.getElementById("group_text_3_");
    if (!listContainer) {
      return;
    }

    var query = (searchText || "").toString().trim().toLowerCase();
    var optionRows = listContainer.getElementsByClassName("check_options");

    for (var i = 0; i < optionRows.length; i++) {
      var row = optionRows[i];
      var input = row.querySelector('input[type="checkbox"]');
      var label = row.querySelector("label");

      if (!input || !label) {
        continue;
      }

      if (input.id === "check_all_") {
        row.style.display = "";
        continue;
      }

      var name = (label.textContent || label.innerText || "")
        .trim()
        .toLowerCase();
      row.style.display = name.indexOf(query) !== -1 ? "" : "none";
    }
  }
  
  
  
function getAllCheckedPrograms() {
    const checked = document.querySelectorAll('.check_options_input:checked');
    return Array.from(checked).map(cb => cb.value);
}


function selectAllProgram(el) {
    const allChecks = document.querySelectorAll('.check_options_input:not(#check_all_)');
    allChecks.forEach(cb => cb.checked = el.checked ? false : cb.checked);
	
	if(!el.checked){
		renderSelection();
	}
	
}


  
function deselectAll(el) {
    document.getElementById('check_all_').checked = false;
}


function saveSelection(){
	let allChecked = getAllCheckedPrograms();
	
	program_filter = allChecked;
	
	localStorage.setItem("savedSelections", JSON.stringify(program_filter));
	
	
}


function renderSelection() {
    const allChecks = document.querySelectorAll('.check_options_input:not(#check_all_)');
    allChecks.forEach(cb => {
        cb.checked = program_filter.includes(cb.value);
    });
	
	
	deselectAll();//removes the selection on "all" button
}


function loadSavedSelections(){
	let saves = localStorage.getItem("savedSelections");
	if(saves == null){
		selectRandoms();	
		saveSelection();		
	}else{
		program_filter = JSON.parse(saves);
		renderSelection();
	}
}




function randomizeLoadout(counts = 10) {
	if(utility.spammingJam()){
		showToast("Too many actions... please relax a bit!");
		return false;
	};
	

    const allChecks = Array.from(document.querySelectorAll('.check_options_input:not(#check_all_)'));
    
    allChecks.forEach(cb => cb.checked = false);

    const shuffled = allChecks.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(counts, allChecks.length));

    selected.forEach(cb => cb.checked = true);
}


loadSavedSelections();

