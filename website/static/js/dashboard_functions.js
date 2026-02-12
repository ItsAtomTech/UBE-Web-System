window.addEventListener('resize', () => {
	forceResize = true;
	
});



// ==========================
// Teacher Functions
// ==========================

function showRoomsTable(elm){
	activate(elm);

	let page = open_modal("teacher_rooms", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
}




function showRemovedTable(elm){
	activate(elm);

	let page = open_modal("trash", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
}


function showNotificationPage(elm){
	activate(elm);

	let page = open_modal("notifications", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
	elm.classList.remove("new_notification");
}


// ==========================
//Admin Functions
// ==========================

function showUsersTable(elm){
	activate(elm);

	let page = open_modal("user_table", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
}


function showCourseLessonPage (elm){
	activate(elm);

	let page = open_modal("course_view_admin", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
}



function showConfigs(elm){
	// activate(elm);
	let page = open_modal("config_editor", 'blurred');
}


function reloadData(func=undefined){
	if(utility.spammingJam()){
		createDialogue("info", "Too many Actions, try again in a short while.");
		return;
	};
	showToast("Getting Latest Data");
	
	if(func){
		func();
	}

	
}


// ==========================
// Student Functions
// ==========================


function showStudentRoom(elm){
	activate(elm);

	let page = open_modal("student_rooms", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
}



function closeAllPages(exclude=undefined){
	forceResize = true;
	
	let containment = _('general_container').getElementsByClassName('page_containment');
	
	try{
		_('dash_contents').classList.remove("hide_main_con");
	}catch(e){
		//--
	}
	

	
	for(each of containment){
		if(exclude){
			if(each.id == exclude.id){
				continue;
			}
		}
	
		let close_link = (each.getElementsByClassName("close_modal_rev")[0]);
		close_modalizer(close_link);
	}
	localStorage.setItem("codeMode","");
	
}

function addNewItem(){
	if(inIframe()){
		postMessageToParent('openModal:{"link":"editor","custom_class":"no_close_button,blurred"}');
	}else{
		open_modal('editor','no_close_button,blurred');
	}
	
}


//Recieve the Data from Barcode Scanner
function recievedBarData(data){
	let recieveMode = localStorage.getItem("codeMode");
	console.log("Code:", data);
	
	if(recieveMode == "form"){
		//Put Data from editor
		try{
				postMessageToModal("editor","function:loadToBarCode:"+ data);
		}catch(e){
			//--
		}
	}else{
		//Call Function for Auto Get Item from Records
		let params = [{
			"name": "code",
			"value": data.toString(),
		}];
		
		qBuilder.sendQuery(itemWithCode,"get_item_by_code",params);
	}
	
}


//parse the Data coming from server get for item
let selectedItemId;
function itemWithCode(data){
	if(!data.responseText){
		return createDialogue("error","Server Response error");
	}
	
	data = JSON.parse(data.responseText);
	
	if(data.type == "success"){
		//item is found
		
		console.log(data);
		_("modal_1").querySelector("[tag='item_name']").innerText = data.item.name; 
		_("modal_1").querySelector("[tag='item_code']").innerText = "Code: "+ data.item.code + " ,Available: "+ data.item.counts; 
		_("modal_1").querySelector("[tag='item_count']").value = 1; 
		
		selectedItemId = data.item.id;
		
		showModalContent("modal_1");
		
	}else{
		//if item not found
		showToast("This item is not in records!");
		
	}
	
}



function showNotificationPage(elm){
	activate(elm);

	let page = open_modal("notifications", 'modal_on_container,no_close_button,page_containment', _('general_container'));
	closeAllPages(page);
	_('dash_contents').classList.add("hide_main_con");
	elm.classList.remove("new_notification");
}




function itemNotifyUpdate(data){
	
	if(!data.responseText){
		return createDialogue("error","Server Response error");
	}
	
	data = JSON.parse(data.responseText);
	
	showToast(data.message);
	closeModalContent("modal_1");
	
}



//USB Serial Class Object
let COMport = {
    port: null,
    reader: null,
    keepReading: false,

    async autoConnect() {
        const ports = await navigator.serial.getPorts();
        if (ports.length > 0) {
            this.port = ports[0];
            await this.port.open({ baudRate: 9600 });
            this.keepReading = true;
            console.log("Auto-connected to known port");
            return true;
        }
        console.log("No previously authorized port found");
        return false;
    },

    async connect() {
        try {
            this.port = await navigator.serial.requestPort();
            await this.port.open({ baudRate: 9600 });
            this.keepReading = true;
            console.log("COM port connected manually");
			 createDialogue("success", "Device Connected!");
			 pressTimes = 0;
        } catch (err) {
            console.error("Manual connection failed:", err);
        }
    },

	async readLoop(onLine) {
		if (!this.port) {
			console.warn("Port not connected");
			return;
		}

		const decoder = new TextDecoderStream();
		const inputDone = this.port.readable.pipeTo(decoder.writable);
		const inputStream = decoder.readable;
		this.reader = inputStream.getReader();

		let buffer = '';

		try {
			while (this.keepReading) {
				const { value, done } = await this.reader.read();
				if (done) break;
				if (value) {
					buffer += value;
					let lines = buffer.split('\n');
					buffer = lines.pop(); // Save incomplete line for next round
					for (let line of lines) {
						onLine(line.trim()); // Send each complete line
					}
				}
			}
		} catch (err) {
			console.error("Reading error:", err);
		} finally {
			this.reader.releaseLock();
		}
	},

    async disconnect() {
        this.keepReading = false;
        if (this.reader) {
            await this.reader.cancel();
            this.reader = null;
        }
        if (this.port) {
            await this.port.close();
            this.port = null;
            console.log("COM port disconnected");
        }
    }
};


let pressTimes = 0;
async function connectScanner(){
	
	pressTimes++;
	
	if(COMport.port){
			if(pressTimes >= 2){
				COMport.port.forget();
				COMport.port = null;
				pressTimes = 0;
				 createDialogue("success", "Device Diconnected!");
				
				return;
			}
		setTimeout(resetCount, 400);
		function resetCount(){
			pressTimes = 0;
		}
		
		return showToast("Already Connected! Double Click to Disconnect.");
	}
	
		// Connect to the COM port
	await COMport.connect();

	// Start reading data and log it
	COMport.readLoop((data) => {
		recievedBarData(data);
		console.log("Data received:", data);
	});

}



/*window.addEventListener('DOMContentLoaded', async () => {
    const connected = await COMport.autoConnect();
    if (connected) {
        COMport.readLoop((data) => {
            
			recievedBarData(data);
        });
    } else {
        console.log("No previously authorized COM port");
    }
});*/

localStorage.setItem("codeMode","");


