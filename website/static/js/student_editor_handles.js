

//For Saving User
function saveStudent(){
	let values = formMaker.retriveFormInput(true);
	let params = [
		{
		"name": "student_data",
		"value": JSON.stringify(values),
		}
	
	];
	
	if(!validateRequired(formIdCollections)){
		return;
	};
	
	//for updating
	if(pageType == "edit_student"){
		let custom_params = {
		"name": "user_id",
		"value": userID,
		}
		
		params.push(custom_params);
		qBuilder.sendQuery(feedBackSaving,"save_student_update", params);
		createDialogue("wait");
		return;
	}

	
	console.log(params);
	
	qBuilder.sendQuery(feedBackSaving,"save_student", params);
	createDialogue("wait");

}





function feedBackSaving(){
	let res_data = (JSON.parse(event.target.responseText));
	createDialogue("info", res_data.message);
	if(res_data.type == "success" && pageType != "edit_user"){
		window.setTimeout(close, 1000);
	}
	function close(){
		postMessageToParent("close");
	}
	localStorage.setItem("shouldReloadStudents","true");
	hasChanges = false;
}



//Load the Instructors List
function loadInstructorsData(){

    let params = [];
    qBuilder.sendQuery(process, 'get_instructors', params);

    function process(data){
        loadInstructors(data);
    };
}


function loadInstructors(data){
	let setdata = JSON.parse(event.target.responseText);
	
	
	if(setdata.type != "success"){
		return false;
	}
	
	_("instructor_id").innerHTML = "";
	
	_("instructor_id").appendChild(make("option"));
	
	for(each of setdata.instructors){
		let option = make("option");
			option.value = each.user_id;
			option.innerText = each.instructor_name;
		
		_("instructor_id").appendChild(option);
	}
	
	
	
}
loadInstructorsData();







function loadForEdit(){
	let params = [
		{
		"name": "user_id",
		"data": getparam('id'),
		}
	];
	qBuilder.sendQuery(loadIntoForms,"get_user_by_id", params);
	
}

let userID = undefined;
function loadIntoForms(){
	let setdata = JSON.parse(event.target.responseText);
	
	if(setdata.type != "success"){
		return;
	}
	
	userID = getparam('id');
	
	loadEvents();	
	let datajs = setdata.user;
	
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
			//	
			}
        }
    }
	addFancyPlaceholder();
}


if(pageType == "edit_user"){
	loadForEdit();
}


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




