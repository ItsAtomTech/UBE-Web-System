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
     create_loading();



function loadToCodeMirror(){
	areaEditorCode.setValue(_('code_input').value);
}

function getFromCodeMirror(){
	_('code_input').value = areaEditorCode.getValue();
}

let COURSE_DATA;
let CODE_RUN = false;
let ACTIVITY_ID = 0;


//User Stats client side only tracking
let TOTAL_ITEMS;
let CORRECT_ITEMS = 0;
let WRONG_ITEMS = 0;



//closes the activity page
function closePlayer(){

	let conf = window.confirm("Are you sure you want to stop and exit? Progress will not be saved");

	if(conf == true){
		postMessageToParent("close");
	}
}

let ACTIVITY = {};
let pendingCurrent = 0;
function loadActivity(id,current=undefined){

    let params = [
        {'name':'activity_id', 'value':id }
    ];
    CODE_RUN = false;


    if(current_page == "assessment_play"){
        qBuilder.server_address = "get_assessment_student";

        params = [
            {'name':'assessment_id', 'value':id }
        ];

    }

    qBuilder.sendQuery(processData,undefined,params,handleError);
    ACTIVITY_ID = id;
    if(current){
        pendingCurrent = current;
    }

}

function handleError(data){
    _("continue_button").innerText = "CONTINUE";
}


let TRUE_COUNTS = 0;

async function processData(){
	let res_data = (JSON.parse(event.target.responseText));
    // console.log(res_data);
    if(res_data.type != "success"){
        _("continue_button").innerText = "CONTINUE";
        destroy_dia();
        return false;
    }

    let act_data = res_data.activity || res_data.assessment;
    ACTIVITY = act_data;
    
    if(res_data.true_count){
        TRUE_COUNTS = res_data.true_count;
    }
    
    _('mutiple_choice_view').classList.add("fadesOut");
    _('coding_view').classList.add("fadesOut");
    await sleep(300);
    _('mutiple_choice_view').style.display = "none";
    _('coding_view').style.display = "none";
    _('mutiple_choice_view').classList.remove("fadesOut");
    _('coding_view').classList.remove("fadesOut");


    if(act_data.activity_type == "multiple" || act_data.assesment_type == "multiple"){
        loadMultiChoice(act_data);
    }else if(act_data.activity_type == "coding" || act_data.assesment_type == "coding"){
        loadCodingView(act_data);
    }else{
        console.log("Type not supported for: " + act_data.activity_type);
    }

    hideResultDisplay();
    CURRENT_ACTIVE = pendingCurrent; //Update current after loading
    
    if(CURRENT_ACTIVE >= ACTIVITY_LIST.length - 1){
        for(each of tag("skip_button")){
            each.style.display = "none";
        }
    }else{
        for(each of tag("skip_button")){
            each.style.display = "initial";
        }
    }
}

function loadMultiChoice(data, Isshuffle=true){

   let c_index = 0;
   _('choice_box').innerHTML = "";


   _("question_text").innerText = data.activity_prompt;
   _("question_title").innerText = data.name;
    
   clicked_choices.length = 0; 
    
    //Shuffle choices if desired
    let shuffled ;

    if(typeof(data.choices) != "object"){
        data.choices = JSON.parse(data.choices)
    }

    if(Isshuffle){
        shuffled = shuffle(data.choices);
    }else{
        shuffled = data.choices;
    }

   for(each of shuffled){
    const template = document.getElementById("choice_button");
    const clone = template.content.cloneNode(true);
    // Find all elements with "tag" attribute
    let label = clone.querySelectorAll("[tag='label']")[0];
    let check = clone.querySelectorAll("[tag='check_box']")[0];
        label.setAttribute('for', 'c_'+c_index);
        check.setAttribute('id', 'c_'+c_index);

        label.innerText = each;
        check.value = each;

        _('choice_box').appendChild(clone);

    c_index++;
   }

    _('mutiple_choice_view').style.display = "flex";

}


function loadCodingView(data){

    _("prompt_text").innerHTML = data.activity_prompt;
    _("code_input").innerHTML = "";
    _("code_input").value = data.code_input;
    _("code_expected_output").innerHTML = data.expected_output;
    _("code_output").innerText = "Output:";
    loadToCodeMirror();
    _("prompt_title").innerText = data.name;

    _('coding_view').style.display = "flex";

    const containerHeight = _('code_container').offsetHeight;
    areaEditorCode.setSize(null, containerHeight);

    areaEditorCode.refresh();
}


//Fisher–Yates shuffle algorithm
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick a random index
    [array[i], array[j]] = [array[j], array[i]]; // swap elements
  }
  return array;
}


function checkActivity(){
   // console.log(ACTIVITY);

    if(ACTIVITY.activity_type == "coding" || ACTIVITY.assesment_type == "coding"){
        if(!CODE_RUN){
            showToast("Please Run the Code First!");
            return false;
        }
        getFromCodeMirror(); //ensure code is updated
        validateCodeSubmit();

    }else{
        validateMultipleChoice();
        console.log("Multiple Choice Code");
    }


}



function validateCodeSubmit(){
    let param = [
        {'name': 'activity_id', 'value': ACTIVITY_ID},
        {'name': 'assessment_id', 'value': ACTIVITY_ID},
        {'name': 'code', 'value': _("code_input").value},
    ]
    createDialogue('wait',"Checking Result");

    if(current_page == "assessment_play"){
        qBuilder.sendQuery(feedbackCode,'check_assessment_output',param);
        return;
    }

    qBuilder.sendQuery(feedbackCode,'check_activity_output',param);

}

function feedbackCode(){
    let res_data = (JSON.parse(event.target.responseText));
    console.log(res_data);
    let result = res_data.results;

    if(res_data.type != "success"){
        createDialogue("error", "Problem Getting the Result");
        return false;
    }

        let is_correct = true;
        let message = "";
        let output_check = true;


        try{
            let llm_check = JSON.parse(result.llm_check);


            if(llm_check.type == "error"){
                showToast(llm_check.message);
                destroy_dia();
                return false;
            }
             is_correct = (llm_check.correct);
             message = (llm_check.message);
        }catch(e){
            console.log(e);
            is_correct = false;
            message = "";
            if(/\"correct\"\s*:\s*true/i.test(result.llm_check)){
                is_correct = true;
            }

            try{
                if(result.llm_check.indexOf("LLM check failed") >= 0){
                    showToast("Check Error Occured, try again.");
                    destroy_dia();
                    return false;
                }
            }catch(e){
                //-

            }



        }

        //No LLM Prompt
        if(result.llm_check == undefined || result.llm_check == null){
            is_correct = true;
        }


        if(result.output_check == "match" || result.output_check == undefined){
            output_check = true;
        }else{
             output_check = false;
        }

        if(is_correct && output_check){
            ShowResultDisplay('correct', "");
        }else{
            ShowResultDisplay('wrong', message);
        }

    destroy_dia();

}

function testRunCode() {
    if (utility.spammingJam()) {
        return showToast("Too many actions! Try Again Later");
    }
    getFromCodeMirror();

    let payload = {
        "language": COURSE_DATA.language,
        "stdin": "",
        "files": [
            {
                "name": "index." + getFileTypes(COURSE_DATA.language),
                "content": _('code_input').value
            }
        ]
    };
    
    createDialogue("wait");

    let ajax_request = new XMLHttpRequest();
    ajax_request.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                try {
                    let result = JSON.parse(this.responseText);
                    //console.log("Compile raw result:", result);

                    if (result.type === "success") {
                        let msg = result.message; // this is the compiler's JSON
                        if (msg.stdout) {
                            //showToast("Output: " + msg.stdout);
                            _("code_output").innerHTML = msg.stdout;
                            destroy_dia();

                        } else if (msg.stderr) {
                            //showToast("Error: " + msg.stderr);
                            console.log(msg);
                             _("code_output").innerHTML = msg.exception;
                             destroy_dia();
                        } else {
                            showToast("No output received");
                            destroy_dia();
                        }

                    CODE_RUN = true;

                    } else {
                        showToast("Error: " + result.message);
                    }

                } catch (e) {
                    console.error("Failed to parse response:", e);
                    showToast("Invalid response from server");
                    destroy_dia();
                }
            } else {
                console.error("Compile error:", this.status, this.statusText);
                showToast("Failed to run code: " + this.statusText);
                destroy_dia();
            }
        }
    };

    ajax_request.open("POST", "/test_compile", true);
    ajax_request.setRequestHeader("Content-Type", "application/json");
    ajax_request.send(JSON.stringify(payload));
}



function compileOut(){
    let res_data = (JSON.parse(event.target.responseText));
    console.log(res_data);

}


function validateMultipleChoice(){
    let selected_choice = getCheckedValues();
    if (utility.spammingJam()) {
        return showToast("Too many actions! Try Again Later");
    }

    if(selected_choice.length <= 0){
        return showToast('No selection, choose your answer.');
    }

    let param = [
        {'name': 'activity_id', 'value': ACTIVITY_ID},
        {'name': 'assessment_id', 'value': ACTIVITY_ID},
        {'name': 'choices', 'value': JSON.stringify(selected_choice)},
    ]
    createDialogue('wait',"Checking Result");

    if(current_page == "assessment_play"){
        qBuilder.sendQuery(feedbackAnswer,'check_assessment_multi',param);
    }else{
         qBuilder.sendQuery(feedbackAnswer,'check_activity_multi',param);
    }




}


function feedbackAnswer(){
    let res_data = (JSON.parse(event.target.responseText));
    console.log(res_data);
    destroy_dia();

    if(res_data.type == "correct"){
        ShowResultDisplay('correct');
    }else{
        let str = "Correct Answer(s): "+ res_data.expected.join(", ");
        ShowResultDisplay('wrong', str);
    }

}



function getCheckedValues() {
  const container = _("choice_box");
  const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
  const values = Array.from(checkboxes).map(cb => cb.value);
  return values;
}


//Monitor how much choices are clicked at on a time

let clicked_choices = []; // check html elements

function choices_click(elm){
    let choice = elm;
    
    if(elm.checked){
        clicked_choices.push(elm);
    }else{
        //remove the selected elm from the index if found
        clicked_choices = clicked_choices.filter(e => e !== elm);
    }
    
    
    if(clicked_choices.length > TRUE_COUNTS ){
        clicked_choices[0].checked = false;
        clicked_choices.shift();
    }
}


//skip the current actice item
function skipCurrent(confirmed){
	if(confirmed == undefined){
		askUser("Are you sure to skip now?",skipCurrent,arguments);
		return;
	}
	destroy_dia();
	if(confirmed == 'fail'){
		return;
	}
    
    swapWithLast(ACTIVITY_LIST, CURRENT_ACTIVE);
    
    showToast("Skipping Current Item...");
    
    loadActivity(ACTIVITY_LIST[CURRENT_ACTIVE].id);
    
    
    function swapWithLast(ACTIVITY_LIST, CURRENT_ACTIVE) {
        const lastIndex = ACTIVITY_LIST.length - 1;

        if (CURRENT_ACTIVE < 0 || CURRENT_ACTIVE >= ACTIVITY_LIST.length) {
            console.error("Invalid CURRENT_ACTIVE index");
            return;
        }

        // Swap the elements
        [ACTIVITY_LIST[CURRENT_ACTIVE], ACTIVITY_LIST[lastIndex]] = 
        [ACTIVITY_LIST[lastIndex], ACTIVITY_LIST[CURRENT_ACTIVE]];
    }
}





function ShowResultDisplay(type, message=""){

    let result_style =_('result_status');
    let result_icon =_('result_icon');
    _("message_info").innerText = "";

    _('modalResult').showModal();
    _("response_container").style.display = "flex";
    _("continue_button").innerText = "CONTINUE";



    if(current_role != "student"){
        _("continue_button").innerText = "DONE";
    }


    if(type != 'correct'){
        result_style.classList.add("wrong");
        result_icon.classList.add("fa-times");
        result_icon.classList.remove("fa-check");

        _("resulting_text").innerText = "Wrong!"
        _("message_info").innerText = message;

        WRONG_ITEMS++;
        
        try{
            playSfx('item_wrong.mp3');
        }catch(e){
            //--
        }
        
        
    }else{
        result_style.classList.remove("wrong");
        result_icon.classList.add("fa-check");
        result_icon.classList.remove("fa-times");
        
        try{
            playSfx('item_correct.mp3');
        }catch(e){
            //--
        }
        
        CORRECT_ITEMS++;
        _("resulting_text").innerText = "Correct!"

    }
    
    processUSerStatsDisplay();
    

}



function hideResultDisplay(type, message=""){
    _("response_container").style.display = "none";
    _('modalResult').close();
}

function setProgressBar(percent=10){
    _("progress_level").style.width = percent+"%";
}


function processUSerStatsDisplay(){
    
    _("items_total").innerText = TOTAL_ITEMS;
    _("correct_items").innerText = CORRECT_ITEMS;
    _("wrong_items").innerText = WRONG_ITEMS;
    
    
    
    
}



//Dummy






function loadCourseData(){

    	let params = [
		{
		"name": "lesson_id",
		"value": getparam("lesson_id"),
		},
		{
		"name": "course_id",
		"value": getparam("course_id"),
		},

	];

    qBuilder.sendQuery(process, 'get_course_by_lesson', params);
    create_loading();
    function process(data){
        reflectFromCourse(data);

    };
}

loadCourseData();


function reflectFromCourse(data){
    let res_data = (JSON.parse(event.target.responseText));
    console.log(res_data);
        if(res_data.type != "success"){
            return;
        }

    let langtype = res_data.course.language;
    COURSE_DATA = res_data.course;
    //AutoLoad Modes

    let info = CodeMirror.findModeByMIME( getMimeTypes(langtype));

    if (info) {
      CodeMirror.autoLoadMode(areaEditorCode, info.mode);
      areaEditorCode.setOption("mode", info.mime);
    }
    
    //load defined set if not student
    if(current_role != "student"){
        
        loadActivityItems();
        finished_load();
        return;
    }
    
    
    //load items from server
    loadSuggestedFromServer();
    finished_load();
}





/*
Suggested Activity Loader
*/

function loadSuggestedFromServer(){
    let params = [
		{
		"name": "lesson_id",
		"value": getparam("lesson_id"),
        },
		{
		"name": "room_id",
		"value": getparam("room_id"),
        },
		{
		"name": "course_id",
		"value": getparam("course_id"),
        },
		{
		"name": "quarter",
		"value": getparam("quarter"),
        }
	];


	if(current_page == "assessment_play"){
        qBuilder.sendQuery(processAssess, 'get_recommend_assessments', params);
	}else{
      qBuilder.sendQuery(process, 'get_recommend_activities', params);
    }



    function process(data){
        loadSuggestions(data);
    };

    function processAssess(data){
        loadSuggestionsAssessment(data);
    };
}




if(current_role != "student"){
     _("title_name").innerHTML = _("title_name").innerHTML + ("(Test Mode)")
}






let ACTIVITY_LIST = [];
let CURRENT_ACTIVE = 0;


function loadSuggestions(){
    let res_data = (JSON.parse(event.target.responseText));
        if(res_data.type != "success"){
            
            createDialogue("error", res_data.message);
            _('coding_view').style.display = "none";
            return;
        }
    ACTIVITY_LIST = (res_data.suggestions);
    CURRENT_ACTIVE = 0;
    WRONG_ITEMS = 0;
    CORRECT_ITEMS = 0;
    setProgressBar(0);

    qBuilder.sendQuery(undefined,'resetscore');
    if(ACTIVITY_LIST.length <= 0){
        createDialogue("error", "No sets of Activities yet!");
        _('coding_view').style.display = "none";
    }

    loadActivity(ACTIVITY_LIST[CURRENT_ACTIVE].id);
    TOTAL_ITEMS = ACTIVITY_LIST.length;
    processUSerStatsDisplay();
}



function loadSuggestionsAssessment(){
    let res_data = (JSON.parse(event.target.responseText));
        if(res_data.type != "success"){
            createDialogue("error", res_data.message);
                _('coding_view').style.display = "none";
            return;
        }
    ACTIVITY_LIST = (res_data.suggestions);
    CURRENT_ACTIVE = 0;
    WRONG_ITEMS = 0;
    CORRECT_ITEMS = 0;
    setProgressBar(0);
    qBuilder.sendQuery(undefined,'resetscore');
    console.log(res_data);

    if(ACTIVITY_LIST.length <= 0){
        createDialogue("error", "No sets of Assessment yet!");
        _('coding_view').style.display = "none";
    }

    loadActivity(ACTIVITY_LIST[CURRENT_ACTIVE].id);
    TOTAL_ITEMS = ACTIVITY_LIST.length;
    processUSerStatsDisplay();
}


function proccedActivity(){

    if(current_role != "student"){
        
        postMessageToParent("close");
        return;
    }
    
    
    
    let percent = ((CURRENT_ACTIVE+1) / ACTIVITY_LIST.length )*100;
        console.log(percent)
    setProgressBar(percent);
    if(CURRENT_ACTIVE+1 >= ACTIVITY_LIST.length){
        _("continue_button").innerHTML = "<span class='fa fa-spinner fa-2x fa-spin'> </span>";
        return finishPlayer();
    }
    loadActivity(ACTIVITY_LIST[CURRENT_ACTIVE+1].id, CURRENT_ACTIVE+1);
    destroy_dia();
    _("continue_button").innerHTML = "<span class='fa fa-spinner fa-2x fa-spin'> </span>"


}


/*============================
For Finishing Activity/Session
============================*/

function finishPlayer (){
    let params = [];

    if(current_page == "assessment_play"){
        params = [{'name':'course_id', 'value': getparam('course_id')}]

        if(getparam('quarter')){
            params.push({'name':'quarter', 'value': getparam('quarter')});
        }


       qBuilder.sendQuery(processPassData, 'finish_assessment', params, handleError);
        return;
    }

    qBuilder.sendQuery(processPassData, 'finish_activity', params, handleError);


}


function processPassData(){
    let res_data = (JSON.parse(event.target.responseText));
    if(res_data.type != "success"){
        console.log(res_data);
        return;
    }

    localStorage.setItem("playerFinished","true");

    console.log(res_data);

    let passed = true;
    
    if(res_data.percent > 1){
        res_data.percent = (res_data.percent / 100);
    }
    
    if(res_data.percent < 0.75){
        passed = false;
    }


    hideResultDisplay();
    showFinishDisplay(passed, res_data);


}





async function showFinishDisplay(passed = true, data){

    let dailog = _("finish_play");

    let result_icon = _("icon_finish");
    let result_style = _("finish_result");

    if(!passed){
        result_style.classList.add("fail");
        result_icon.classList.add("fa-times");
        result_icon.classList.remove("fa-check");
        result_icon.classList.remove("animated");

        _("resulting_text").innerText = "Wrong!"
        _("result_title_finish").innerText = "Activity Failed!";


        if(current_page == "assessment_play"){
            _("result_title_finish").innerText = "Assessment Failed!"
        }else{
            _("result_title_finish").innerText = "Activity Failed!"
        }




    }else{
        result_style.classList.remove("fail");
        result_icon.classList.add("fa-check");
        result_icon.classList.remove("fa-times");
        result_icon.classList.add("animated");


        if(current_page == "assessment_play"){
            _("result_title_finish").innerText = "Assessment Passed!"
             result_icon.classList.add("fa-trophy");
        }else{
            _("result_title_finish").innerText = "Activity Passed!"
        }

        try{
            playSfx('fanfare.mp3');
        }catch(e){
            //--
        }


    }

    _("score_value").innerText = data.score;
    _("score_total").innerText = data.total;
    
    let own_percent = ((data.score / data.total ) * 100).toFixed(2);
    
    
    dailog.showModal();
    dailog.style.display = "flex";
    await sleep(500);
    
    
    let additional_message = 
    "\n Rating: "+ getRating(parseInt(own_percent), data.time_score)
    +"\n Time taken: "+ secondsToHms(data.time_taken);
    
    typeEffect("additional_message", "Score Average: "+ (own_percent) + "% " + additional_message, 3);
    
}



//Calculate and return overall rating for both score and time score
function getRating(own_percent, time_score) {
  const average = (parseInt(own_percent) + parseInt(time_score)) / 2;

  if (average >= 99) return "Excellent";
  if (average >= 85) return "Very Good";
  if (average >= 80) return "Good";
  if (average >= 75) return "Passed";
  return "Failed";
}





function closeActivity(){

    if(current_page == "assessment_play"){
        showAssessResult();

        return;
    }


    localStorage.setItem("scoreUpdate", "true");
	postMessageToParent("close");
}


/*Assessment Charts Function*/

function showMyStats(){

     let params = [
		{
		"name": "lesson_id",
		"value": getparam("lesson_id"),
        },
		{
		"name": "room_id",
		"value": getparam("room_id"),
        },
		{
		"name": "course_id",
		"value": getparam("course_id"),
        }
	];

    qBuilder.sendQuery(parseData, 'get_weak_categories_as', params);



    function parseData(data){
        let resp = data.responseText;
            resp = JSON.parse(resp);
            console.log(resp);
           genFunctions(resp);


    }


}


function genFunctions(datas){
    let data = datas.data;
    renderWeakAssessmentCategoriesChart(data.assessments);
    renderWeakActsCategoriesChart(data.activities, 'weak_assessment_lesson');
    console.log(data);


}

function renderWeakAssessmentCategoriesChart(data, elementId = 'weak_assessment_chart') {
    let isPlaceholder = false;

    if (!data || data.length === 0) {
        console.warn("No weak assessment categories data available.");
        data = [{
            avg_progress: 0,
            category: "no_data_yet"
        }];
        isPlaceholder = true;
    }

    // Convert underscored category names → Sentence Case
    const formattedData = data.map(item => {
        let name = item.category.replace(/_/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return [name, item.avg_progress];
    });

    const canvas = document.getElementById(elementId);
    const rowHeight = 45;
    canvas.height = Math.max(200, formattedData.length * rowHeight);

    if (!canvas.parentElement.classList.contains('scrollable-chart')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('scrollable-chart');
        wrapper.style.maxHeight = '350px';
        wrapper.style.overflowY = 'auto';
        wrapper.style.padding = '5px';
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }

    // Override datalabels formatter
    const originalFormatter = Chart.defaults.plugins.datalabels?.formatter;
    Chart.defaults.plugins.datalabels.formatter = (value) => {
        if (isPlaceholder) return "";
        // Auto-handle both 0.0–1.0 and 0–100 scale
        const scaled = value <= 1 ? value * 100 : value;
        return `${scaled.toFixed(1)}%`;
    };

    const barColor = isPlaceholder ? ['#9E9E9Eaa'] : [materialColors[0]];

    generateHorizontalBarChart(
        formattedData,
        elementId,
        "Weak Assessment Categories (Avg)",
        barColor
    );

    if (originalFormatter) {
        Chart.defaults.plugins.datalabels.formatter = originalFormatter;
    }
}

function renderWeakActsCategoriesChart(data, elementId = 'weak_assessment_chart') {
    let isPlaceholder = false;

    if (!data || data.length === 0) {
        console.warn("No weak assessment categories data available.");
        data = [{
            avg_progress: 0,
            category: "no_data_yet"
        }];
        isPlaceholder = true;
    }

    // Convert underscored category names → Sentence Case
    const formattedData = data.map(item => {
        let name = item.category.replace(/_/g, ' ');
        name = name.charAt(0).toUpperCase() + name.slice(1);
        return [name, item.avg_progress];
    });

    const canvas = document.getElementById(elementId);
    const rowHeight = 45;
    canvas.height = Math.max(200, formattedData.length * rowHeight);

    if (!canvas.parentElement.classList.contains('scrollable-chart')) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('scrollable-chart');
        wrapper.style.maxHeight = '350px';
        wrapper.style.overflowY = 'auto';
        wrapper.style.padding = '5px';
        canvas.parentElement.insertBefore(wrapper, canvas);
        wrapper.appendChild(canvas);
    }

    // Override datalabels formatter
    const originalFormatter = Chart.defaults.plugins.datalabels?.formatter;
    Chart.defaults.plugins.datalabels.formatter = (value) => {
        if (isPlaceholder) return "";
        // Auto-handle both 0.0–1.0 and 0–100 scale
        const scaled = value <= 1 ? value * 100 : value;
        return `${scaled.toFixed(1)}%`;
    };

    const barColor = isPlaceholder ? ['#9E9E9Eaa'] : [materialColors[2]];

    generateHorizontalBarChart(
        formattedData,
        elementId,
        "Weak Lesson Categories (Avg)",
        barColor
    );

    if (originalFormatter) {
        Chart.defaults.plugins.datalabels.formatter = originalFormatter;
    }
}



function closeAssessmentView(){
    localStorage.setItem("scoreUpdate", "true");
	postMessageToParent("close");

}




function showAssessResult(){
    showMyStats();
    _("finish_play").style.display = "none";
    _("finish_play").close();
    closeModalContent('finish_play');
    showModalContent("finish_overview");
}


/*=========================
Interaction Observer Block
===========================*/
async function requestClipboardPermission() {
    let intervalId = null;

    const tryRequestPermission = async () => {
        try {
            // Attempt real clipboard read to trigger permission prompt
            await navigator.clipboard.readText();
            console.log("Clipboard permission granted via real read.");
            return true;
        } catch (err) {
            console.warn("Clipboard access not granted yet:", err);
            return false;
        }
    };

    const checkPermission = async () => {
        try {
            if (!navigator.permissions) {
                console.warn("Permissions API not supported in this browser.");
                showModalContent('allow_clipboard');
                return false;
            }

            const readPerm = await navigator.permissions.query({ name: "clipboard-read" });
            const writePerm = await navigator.permissions.query({ name: "clipboard-write" });

            const readGranted = readPerm.state === "granted";
            const writeGranted = writePerm.state === "granted";

            if (!readGranted || !writeGranted) {
                showModalContent('allow_clipboard');
                console.log("Waiting for clipboard permission...");
                WaitingForClipBoard = true;
                return false;
            }

            clearInterval(intervalId);

            console.log("✅ Clipboard permission granted!");
            WaitingForClipBoard = false;
            enableFullscreenAuto();
            return true;

        } catch (err) {
            console.error("Clipboard permission check failed:", err);
            showModalContent('allow_clipboard');
            return false;
        }
    };

    await checkPermission();
    intervalId = setInterval(checkPermission, 3000);

    // Optional helper — called when user clicks "Enable Clipboard" in your modal
    window.enableClipboardAccess = async () => {
        const granted = await tryRequestPermission();
        if (granted) {
            console.log("✅ Clipboard permission granted after user click!");
            clearInterval(intervalId);
        } else {
            console.warn("Clipboard permission still denied.");
        }
    };
}

const IGNORE_ALL = false;


function closeTaker(){
	postMessageToParent("close");
}



// User Monitoring Below, Doesn't Execute if user is not of student type
// ======================


if(current_role == "student"){
 
 
 try{
        const watcher = new UserActivityWatcher({
            onExitFullscreen: () => showModalContent('go_full_screen'),
            onWindowBlur: () => focusUp(),
            onPasteExternal: (data) => pastedOutside(data),
            onThresholdReached: (stats) => invalidateTaker(stats),
            onDevToolsOpen: () => DevToolsAction()
        });
        showModalContent('go_full_screen');
        
     }catch(e){
         //--
     }
}

 
 

 

function enableFullscreenAuto() {
    const elem = document.documentElement;
    
    if(current_role != "student"){
        return;
    }
    
    
    if(WaitingForClipBoard){return};
    
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

// Wait for first user interaction
window.addEventListener('click', enableFullscreenAuto, { once: true });
window.addEventListener('keydown', enableFullscreenAuto, { once: true });



function closeModalThis(elm){
    closeModalContent(elm);
}

 
async function focusUp(){
    showModalContent('go_full_focus');
    
    try {
        await navigator.clipboard.writeText("");
        console.log("Clipboard cleared.");
    } catch (err) {
        console.warn("Unable to clear clipboard:", err);
    }
    
} 
 
function DevToolsAction(){
    showModalContent('go_no_dev');
}


const invalidateTaker = function(stats){
    console.warn("⚠️ Threshold reached!", stats);

    qBuilder.sendQuery(undefined,'invalidatetaker');
    closeModalThis('go_full_screen');
    showModalContent('go_invalid');
    _('coding_view').style.display = "none";
    _('mutiple_choice_view').style.display = "none";
}


async function pastedOutside(data) {
    showToast("Pasted From Outside Source!");

    if (window.areaEditorCode) {
        const doc = areaEditorCode.getDoc();
        const cursor = doc.getCursor();

        // Detect pasted content lines
        const lines = data.split("\n");

        // Determine where to delete
        let from;
        if (lines.length === 1) {
            from = { line: cursor.line, ch: cursor.ch - lines[0].length };
        } else {
            const lineCount = lines.length - 1;
            const firstLineLength = lines[0].length;
            const targetLine = cursor.line - lineCount;
            const targetCh = doc.getLine(targetLine)
                ? doc.getLine(targetLine).length - firstLineLength
                : 0;
            from = { line: targetLine, ch: Math.max(targetCh, 0) };
        }

        // Remove pasted content
        doc.replaceRange("", from, cursor);

        // Clear undo/redo history
        if (typeof doc.clearHistory === "function") {
            doc.clearHistory();
            console.log("CodeMirror history cleared.");
        }

        // Optional: mark a new clean history state
        if (typeof doc.markClean === "function") {
            doc.markClean();
        }
    }

    try {
        await navigator.clipboard.writeText("");
        console.log("Clipboard cleared.");
    } catch (err) {
        console.warn("Unable to clear clipboard:", err);
    }
}


window.addEventListener("load", async () => {
    
    if(current_role != "student"){
        return;
    }
    
    
    await requestClipboardPermission();

    new UserActivityWatcher({
        onPasteExternal: async (data) => {
            showToast("Pasted from outside source!");
            try {
                await navigator.clipboard.writeText("");
            } catch (err) {
                console.warn("Clipboard clear failed:", err);
            }
        }
    });
});



