selectedItemId = null;

async function getPrintableData(){
	qBuilder.server_address = "_";
	_("wrapper_doc").classList.add("blur_docs");
	await sleep(800);
	let data = localStorage.getItem("reportFile");
	
	if(data){
		data = JSON.parse(data);
	}
	

	getInformationData(data);

	_("print_date").innerText = getCurrentDate();
	
	
	// await sleep(200);
	// _("wrapper_doc").classList.remove("blur_docs");
	// await sleep(500);
	// print();
}



function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}/${day}/${year}`;
}



function getInformationData(data){
		console.log(data);
		
		let params =  [
			{ 
				"name":"currentFilters",
				"value": JSON.stringify(data.currentFilters),
			},
			{ 
				"name":"stat_filters",
				"value": JSON.stringify(data.stat_filters),
			}
		];
		
		qBuilder.sendQuery(generateDataTables,'get_data_per_stat',params);	
}


let canvasIds = {};


function generateDataTables(dataraw){
	let data = (JSON.parse(dataraw.responseText));
	_("charts_section").innerHTML = "";
	let stats = data.data_per_stat;
		canvasIds = {};
	
	
	//Generate Canvas Elements before putting data into them
	
	for(each of stats){		
		let clone = document.importNode(_("stat_chart_section").content, true);
		let canvas = tag("chartCanvas",clone)[0];
		let title = tag("stat_title",clone)[0];
		
		
		canvasIds[each.stat_name] = "c_"+ each.stat_name;
		canvas.setAttribute("id", "c_"+ each.stat_name);
		title.innerText = each.stat_name;
		
		console.log(each);
		
		_("charts_section").appendChild(clone);
	}
	

	
	
}




//Calls this function when the page is done loading
window.onload = () => getPrintableData();