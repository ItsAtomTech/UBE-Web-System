

//For Saving Config
function saveConfig(){
	let values = formMaker.retriveFormInput(true);
	let params = [
		{
		"name": "config_data",
		"value": JSON.stringify(values),
		}
	
	];
	
	
	
	if(!validateRequired(formIdCollections)){
		return;
	};
	
	
	qBuilder.sendQuery(feedBackSaving,"save_config", params);
	createDialogue("wait");

}





function feedBackSaving(){
	let res_data = (JSON.parse(event.target.responseText));
	createDialogue("info", res_data.message);
	

}





function loadForEdit(){
	let params = [
		{
		"name": "sample",
		"data": "",
		}
	];
	qBuilder.sendQuery(loadIntoForms,"get_config", params);
	
}


function loadIntoForms(){
	let setdata = JSON.parse(event.target.responseText);
	
	
	if(setdata.type != "success"){
		return;
	}
	
	loadEvents();
	
	let datajs = setdata.data;
	
	    for (let key in datajs) {
        if (datajs.hasOwnProperty(key)) {
            let itemValue = datajs[key];
			
			try{
				let form = formDatas.forms[formIdCollections.indexOf(key)];
					if(form.type == "date"){
						itemValue = utility.dateNormalize(itemValue);
					}
				
				setValues(key, itemValue,form);
				
				
				
			}catch(e){
				
			}
			
        }
    }
	
	addFancyPlaceholder();
	
}


loadForEdit();




function cancelEditor(){
	if(!hasChanges){
		postMessageToParent("close");
		return;
	}
	
	
	let conf = window.confirm("Are you sure to discard your changes? ");	
	if(conf == true){
		postMessageToParent("close");
	}
}




