
let finishedLoad = false;
function loadAllItems(dataOnly=false){
	
	let sortings = _("sort_options").value.split(",");

	qBuilder.sort = sortings[0];
	qBuilder.order_by = sortings[1];
	// qBuilder.filters.type = _("account_type").value;
	qBuilder.search = _("search_input").value;
	qBuilder.filters['course_id'] = getparam('course_id');

	qBuilder.sendQuery(process);
	
	//createDialogue("wait", "Please wait...");
	if(dataOnly == true){
		createDialogue('wait', 'loading');
	}
		
		let lessMain = _('lesson_con');
	
		lessMain.innerHTML = "Loading Lessons <span class='fa fa-spinner fa-spin'> <span>";
	
	
	function process(data){
			
			lessonsLoader(data);
			genPages(data.responseText);
	}

	finishedLoad = true;
}

loadAllItems();


function delayedQuerry(){
    if(finishedLoad == true){
	    window.setTimeout(loadAllItems, 500);
    }
	finishedLoad = false;
}

monitorChanges('lessonChanges',loadAllItems);


//Context Menu Setup


let menuItems = [
{
  content: `<span class="normal"><span class="fa fa-pencil"> &nbsp;</span>Edit </span>`,
  events: {
    click: e => openEditLesson(selectedLessonId),

  } },

{ content: `<span class="normal"><span class="fa fa-folder-open"> &nbsp;</span>Open </span>`,
 events: {
    click: e => openCourseLesson(selectedLessonId),
  }
 },

 { content: `<span class="normal"><span class="fa fa-trash"> &nbsp;</span>Remove </span>`,
 events: {
    click: e => removeLesson(),
  }
 },

{
  content: `<span class="normal"><span class="fa fa-close"> &nbsp;</span>Cancel </span>`,
  divider: "top" // top, bottom, top-bottom
}];




//loads the rooms into view
function lessonsLoader(data){
	let resData = (JSON.parse(data.responseText));
	let lessons = resData.lessons;
	
	let lessMain = _('lesson_con');
	
		lessMain.innerHTML = "";
	let add_button  = _('add_button').content.cloneNode(true);
	
	// console.log(lessons);
	
    let oIndex = 0;
	for(each of lessons){
        each.index = oIndex;
		lessMain.appendChild(createLessonCard(each));

    //adds context menu

	let lesson_action = new ContextMenu({
      target: ".room_action_control_"+ oIndex,
      mode: "light", // default: "dark"
      menuItems,
      onclick: true,  });

      if(current_theme == 'dark'){
        lesson_action.mode = 'dark'
      }


	lesson_action.init();

        oIndex++;
	}

	lessMain.appendChild(add_button);
}





//DOM creator
function createLessonCard(data) {
    // Get template
    const template = document.getElementById("lesson_card");
    const clone = template.content.cloneNode(true);
    let outIndex = data.index;
    // Find all elements with "tag" attribute
    clone.querySelectorAll("[tag]").forEach(el => {
        let key = el.getAttribute("tag");
        if (data.hasOwnProperty(key)) {
            let value = data[key];
				//Custmize specific keys ====

				if(key == 'index'){
					el.setAttribute("lesson_id", data['lesson_id']);
				}
				if(key == 'lesson_id'){
                    el.classList.add('room_action_control_'+outIndex);
				}

				
            // Parse JSON string arrays
            if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
                try {
                    value = JSON.parse(value).join(", ");
                } catch (e) {}
            }
			if(key != 'lesson_id' && key != 'index' ){
				  el.innerText = value ?? "";
			}
        }
    });

    return clone;
}


function addNewLesson(){
	if(inIframe()){
		postMessageToParent('openModal:{"link":"new_lesson_editor?course_id='+parseInt(get('course_id'))+'","custom_class":"no_close_button,blurred"}');
	}else{
		open_modal('new_lesson_editor?course_id='+parseInt(get('course_id')),'no_close_button,blurred');
	}
}




function openEditLesson(id){
	if(inIframe()){
		postMessageToParent('openModal:{"link":"edit_lesson_editor?id='+id+'","custom_class":"no_close_button,blurred"}');
	}else{
		open_modal('edit_lesson_editor?id='+id,'no_close_button,blurred');
	}
}


/*=============================
Assessment Features Section
=============================*/
function addAssessment(){

	if(inIframe()){
		postMessageToParent('openModal:{"link":"new_assessment_editor?course_id='+parseInt(getparam('course_id'))+'","custom_class":"no_close_button,blurred"}');
	}else{
		open_modal('new_assessment?course_id='+parseInt(getparam('course_id')),'no_close_button,blurred');
	}

}



let selectedAssessmentId = null;
function setAsCurrentAssessment(elm){
    let id = (elm.parentNode.parentNode).getAttribute("assessment_id");
    selectedAssessmentId = id;
}



let menuAssessmentItems = [
{
  content: `<span class="normal"><span class="fa fa-pencil"> &nbsp;</span>Edit </span>`,
  events: {
    click: e => openEditActivity(selectedAssessmentId),

  } },

  {
  content: `<span class="normal"><span class="fa fa-flask"> &nbsp;</span>Test </span>`,
  events: {
    click: e => testAssessmentItem(selectedAssessmentId),

  } },

 { content: `<span class="normal"><span class="fa fa-trash"> &nbsp;</span>Remove </span>`,
 events: {
    click: e => removeAssessment(),
  }
 },

{
  content: `<span class="normal"><span class="fa fa-close"> &nbsp;</span>Cancel </span>`,
  divider: "top" // top, bottom, top-bottom
}];


function getAssessments(data={}){

	let params = [
		{'name':'course_id', 'value': getparam('course_id')},
		{'name':'room_id', 'value': getparam('room_id')},
	];
	
	//For Search on Expanded Panels
	
	if(data.search){
		let search_payload = {'name':'search', 'value': data.search};
		params.push(search_payload);
	}	
	
	if(data.difficulty){
		let difficulty = {'name':'difficulty', 'value': data.difficulty};
		params.push(difficulty);
	}
		
		
	if(data.quarter){
		let quarter = {'name':'quarter', 'value': data.quarter};
		params.push(quarter);
	}
	
	
	qBuilder.sendQuery(process,'assessments_list', params);
	function process(data){
			assessmentLoader(data);
			// genPages(data.responseText);
	}

}

getAssessments();

async function delayedAsmQuerry(elm){
	let dataToPass = {};
	
	if(!elm){
		return getAssessments();
	}
	
	let elmParent = elm.parentNode.parentNode;
	
	let options = tag("dif_option",elmParent)[0].value;
	let search = tag("search_query",elmParent)[0].value;
	let quarter = tag("quarter",elmParent)[0].value;
	
	dataToPass["search"] = search;
	dataToPass["difficulty"] = options;
	dataToPass["quarter"] = quarter;
	
	await sleep(500);
	getAssessments(dataToPass);
}


function assessmentLoader(data){
    let resData = (JSON.parse(data.responseText));
    activities = resData.assessments;

    // console.log(resData);

	let lessMain = _('activities_main');

		lessMain.innerHTML = "";
	let add_button  = _('add_card').content.cloneNode(true);


		lessMain.appendChild(add_button);


    let oIndex = 1;
	for(each of activities){
        each.index = oIndex;
		lessMain.appendChild(createActivityCard(each));

    //adds context menu

	 let card_action_a = new ContextMenu({
       target: ".assessment_action_control_"+ oIndex,
       mode: "light", // default: "dark"
       menuItems: menuAssessmentItems,
       onclick: true,  });

       if(current_theme == 'dark'){
         card_action_a.mode = 'dark'
       }


	    card_action_a.init();


        oIndex++;
	}

}

monitorChanges("assessmentChanges", getAssessments)

//DOM creator
function createActivityCard(data) {
    // Get template
    const template = document.getElementById("activity_card");
    const clone = template.content.cloneNode(true);
    let outIndex = data.index;
    // Find all elements with "tag" attribute
    clone.querySelectorAll("[tag]").forEach(el => {
        let key = el.getAttribute("tag");
        if (data.hasOwnProperty(key)) {
            let value = data[key];
				//Custmize specific keys ====

				if(key == 'assessment_id'){
					el.setAttribute("assessment_id", data['assessment_id']);
				}
				if(key == 'index'){
                    el.classList.add('assessment_action_control_'+outIndex);
				}

            // Parse JSON string arrays
            if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
                try {
                    value = JSON.parse(value).join(", ");
                } catch (e) {}
            }
			if(key != 'id' && key != 'index' && key != 'assessment_id' ){
				  el.innerText = value ?? "";
			}
        }
    });

    return clone;
}




function openAssessment(elm){

	if(event.target.classList.contains('action_button')){
		return;
	};

	if(typeof(elm) != 'object'){
	    //return go_to('assessment_view?lesson_id='+elm);
	}

	let assessment_id = elm.getAttribute('assessment_id');

}



function openEditActivity(id){
	if(inIframe()){
		postMessageToParent('openModal:{"link":"edit_assessment_editor?id='+id+'","custom_class":"no_close_button,blurred"}');
	}else{
		open_modal('edit_assessment_editor?id='+id,'no_close_button,blurred');
	}
}


function removeAssessment(confirmed = undefined,silent=false){
	if(confirmed == undefined){
		askUser("Are you sure to remove this item?",removeAssessment,arguments);
		return;
	}
	destroy_dia();
	if(confirmed == 'fail'){
		return;
	}
	let itemvalue = [{"name":"assessment_id", "value": selectedAssessmentId}];
	qBuilder.sendQuery(feedBackRemovingAssessment,"/remove_assessment",itemvalue);
}




//Helper Function for providing expanded view of assessments rail list
async function expanded(st,srcElm){
	let expandable = srcElm.parentNode.parentNode;
	console.log(expandable);
	
	if(st){
		expandable.classList.add("fullscreen_rail");
	}else{
		expandable = srcElm.parentNode.parentNode.parentNode;
		
		expandable.classList.add("slideOutDown","animated");
		await sleep(450);
		expandable.classList.remove("fullscreen_rail");
		expandable.classList.remove("slideOutDown","animated");
		utility.smoothScroll(expandable);
		
		tag("search_query", expandable)[0].value = "";
		tag("dif_option", expandable)[0].value = "all";
		tag("quarter", expandable)[0].value = "all";
		delayedAsmQuerry();
		// delayedActsQuerry();
		
	}
	
	
}



/*=============================
Assessment Features Section END
=============================*/


function removeLesson(confirmed = undefined,silent=false){
	if(confirmed == undefined){
		askUser("Are you sure to remove this lesson?",removeLesson,arguments);
		return;
	}
	destroy_dia();
	if(confirmed == 'fail'){
		return;
	}
	let itemvalue = [{"name":"lesson_id", "value": selectedLessonId}];
	qBuilder.sendQuery(feedBackRemoving,"/remove_lesson_item",itemvalue);
}


function feedBackRemoving(){
	console.log(event);
	let res_data = (JSON.parse(event.target.responseText));


	if(res_data.type == "success"){
	    showToast("Lesson Removed");
		localStorage.setItem("lessonChanges","true");
	}else{
	    createDialogue(res_data.type, res_data.message);
	}
}

function feedBackRemovingAssessment(){
	console.log(event);
	let res_data = (JSON.parse(event.target.responseText));


	if(res_data.type == "success"){
	    showToast("Assessment Removed");
		localStorage.setItem("assessmentChanges","true");
	}else{
	    createDialogue(res_data.type, res_data.message);
	}
}



const testAssessmentItem = function(id){
	console.log("Testing Item: ", id);
	
	if(current_role == "student"){
		return;
	}
	
	let course_id = getparam("course_id");

	let activityUrl = 'assessment?test_id=' + id + '&course_id=' + course_id;

	if (inIframe()) {
		postMessageToParent(
			'openModal:{"link":"' + activityUrl + '","custom_class":"no_close_button,blurred"}'
		);
	} else {
		open_modal(activityUrl, 'no_close_button,blurred');
	}

	
}





function openCourseLesson(elm){

	if(event.target.classList.contains('action_button')){
		return;
	};

	if(typeof(elm) != 'object'){
	    return go_to('lesson_view?lesson_id='+elm);
	}

	let lesson_id = elm.getAttribute('lesson_id');
	go_to('lesson_view?lesson_id='+lesson_id);
	
}


let selectedLessonId = null;
function setAsCurrent(elm){
    let id = (elm.parentNode.parentNode).getAttribute("lesson_id");
    selectedLessonId = id;
}

//Pagination Function Helpers ===
function genPages(data){
	let paginations = JSON.parse(data).pagination_data;	
	let generated = generatePagination(paginations,'paginates', 'jumpToPage');
	_("paginations") ? _("paginations").innerHTML = generated.innerHTML : false;
}

function paginates(dir){
	qBuilder.paginate(dir,true);
	delayedQuerry();
};


function jumpToPage(page_n){
	page = page_n;
	qBuilder.page = page;
	delayedQuerry();
}


function refreshLessons(){
    if(utility.spammingJam()){
        return;
    }

    delayedQuerry();
}


function getNameById(id,data) {
    const item = data.find(obj => obj.id == id);
    return item ? item.name : null; // returns null if not found
}
