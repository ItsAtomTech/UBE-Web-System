//Setup the code Input
let configCodeMirror = {
            lineNumbers: true, // Show line numbers
            mode: "javascript", // Specify syntax highlighting
            theme: "dracula" // Set the Dracula theme
	}

try{
	var areaEditorCode = CodeMirror.fromTextArea(_('code_input'), configCodeMirror);

}catch(e){
	// console.error("codeMirror is not available yet...");
}

areaEditorCode.refresh();






function loadToCodeMirror(){
	areaEditorCode.setValue(_('code_input').value);
}

function getFromCodeMirror(){
	_('code_input').value = areaEditorCode.getValue();
}



//For Saving
function saveActivity(){
    getFromCodeMirror();
	let values = formMaker.retriveFormInput(true);
	let params = [
		{
		"name": "activity_data",
		"value": JSON.stringify(values),
		},
		{
		"name": "lesson_id",
		"value": parseInt(get('lesson_id')),
		},

	];

	if(!validateRequired(formIdCollections)){
		// return;
	};

	//for updating
	if(pageType == "edit_activity"){
		let custom_params = {
		"name": "activity_id",
		"value": getparam('id'),
		}

		params.push(custom_params);
		console.log(params);
		qBuilder.sendQuery(feedBackSaving,"save_activity_update", params);
		createDialogue("wait");
		return;
	}


	console.log(params);


	qBuilder.sendQuery(feedBackSaving,"save_activity", params);
	createDialogue("wait");

}





function feedBackSaving(){
	let res_data = (JSON.parse(event.target.responseText));
	createDialogue("info", res_data.message);
	if(res_data.type == "success" && pageType != "edit_activity"){
		window.setTimeout(close, 1000);
	}
	function close(){
        if(pageType == "edit_activity"){
            return;
        }
		postMessageToParent("close");
	}
	localStorage.setItem("activityChanges","true");
	hasChanges = false;
}




function loadForEdit(){
	let params = [
		{
		"name": "id",
		"data": getparam('id'),
		}
	];
	qBuilder.sendQuery(loadIntoForms,"get_activity_by_id", params);

}

let activityID = undefined;
let lesson_id;
let responseData;
let itemValues;
function loadIntoForms(data){
	let setdata = JSON.parse(data.responseText) || data;

       // console.log(setdata);

	if(setdata.type != "success"){
		return;
	}
    responseData = data;
	activityID = getparam('id');

	loadEvents();
	let datajs = JSON.parse(setdata.activity.data);
	itemValues = datajs;
        lesson_id =setdata.activity.lesson_id;

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
    loadCourseData();
	loadToCodeMirror();
	loadListedEvents();
	
}


if(pageType == "edit_activity"){
	loadForEdit();
	_("_0").value = "Edit Activity"; //change the Editor Title
}else{
    lesson_id = getparam('lesson_id');
    loadCourseData();
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


function loadCourseData(){

    	let params = [
		{
		"name": "lesson_id",
		"value": lesson_id || parseInt(getparam('lesson_id')),
		},

	];


    qBuilder.sendQuery(process, 'get_course_by_lesson', params);

    function process(data){
        reflectFromCourse(data);

    };
}


let course_id;
let language = "";
function reflectFromCourse(data){
    let res_data = (JSON.parse(event.target.responseText));
    //console.log(res_data);
    if(res_data.type != "success"){
        res_data = {'course': getDataById(course_id)} ;
    }


    let langtype = res_data.course.language;
	language = langtype;
    course_id = res_data.course.course_id;
    //AutoLoad Modes

    let info = CodeMirror.findModeByMIME( getMimeTypes(langtype));

    if (info) {
      CodeMirror.autoLoadMode(areaEditorCode, info.mode);
      areaEditorCode.setOption("mode", info.mime);
    }

    areaEditorCode.refresh();
    populateCategories('category',getDataById(course_id).language);
    populateCategories('categories',getDataById(course_id).language);

    _('category').value = itemValues.category;
    addFancyPlaceholder();

}


function preLoadData(){
	let lescat = sessionStorage.getItem("lesson_category");
	if(lescat){
		console.log(lescat);
		setTimeout(preLoad, 1000);
	}
	
	function preLoad(){
		if(_('category').value == "" ){
			_('category').value = lescat;
			_('category').focus();
			_('category').blur();
		}
		
	}
}



/*=====================
Import and Export Handle
=====================*/

const fm = new FileManager({
  fileExtension: '.kdit',
  exportHandler: (data) => JSON.stringify(data, null, 2),
  importHandler: (content, filename) => {
    const parsed = JSON.parse(content);
    console.log(`Imported from ${filename}:`, parsed);
  }
});



function exportData(){
    let data =  {
        "name": "Data export",
        "items": [],
    }
    data.items.push(formMaker.retriveFormInput(true));
    fm.export(data,"Activity Item: "+ _("name").value);
}


fm.setImportHandler((content, filename) => {
  console.log('Received:', filename);
  try {
    const obj = JSON.parse(content);
    console.log('Imported object:', obj);
    if(obj.name){

        let firstItem = obj.items[0];
        loadIntoFormsRaw(firstItem);
        showToast("Imported from file");
    }

  } catch (err) {
    console.error('An Error occurred:', err);
  }
});


function loadIntoFormsRaw(data){
	let setdata =  data;

    console.log(data);

	loadEvents();
	let datajs = setdata;
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
	loadToCodeMirror();
	loadListedEvents();
}


function importData(){
    fm.import();
}



// ======================
// LLM Generate Handler
// ======================
function generateWithParams(){
	let lesson_data = sessionStorage.getItem("lesson_data");
	let category = sessionStorage.getItem("lesson_category");
	let additionalPrpmt = _("user_additional") ? _("user_additional").value: "No addtitional Prompt." ;
	let preJson = formMaker.retriveFormInput(true);
	
	createDialogue("wait","Generating Data...");
	
	let custom_param = [
		{"name": "lesson", "value": lesson_data},
		{"name": "json_data", "value": JSON.stringify(preJson) },
		{"name": "language", "value": language},
		{"name": "user_prompt", "value": additionalPrpmt},
	]
	
	
	
	qBuilder.sendQuery(feedBackGeneration,"gen_llm_act", custom_param);
	
	
}

//Proccess Callback for Generation
function feedBackGeneration(data){
	let res_data = (JSON.parse(data.responseText));
	destroy_dia();
	if(res_data.type == "success"){
		try{
			let datas;
			if(typeof(res_data.message) == "object"){
				datas = res_data.message;
			}else{
				datas = JSON.parse(res_data.message);
			}
			
			if(datas.items.length){	
				let act_ = datas.items[0]; //only get One
				loadIntoFormsRaw(act_);			
			}	
			console.log(datas);
			showToast("Generation Done!");
			closeModalContent('prompt_modal');
		}catch(e){
			console.log(e);
			showToast("Failed to Generate!");
		}
	}else{
		showToast("Error: "+ res_data.message);
	}
	console.log(res_data);
}


//Pre Load:
preLoadData(); //Like Category From Lesson etc.