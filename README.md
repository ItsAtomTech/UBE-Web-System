# On Probation Mon. System



### About



This is a web system developed for the purpose as stated on the title.



###### Tech Stack



This system has the tech stalk of the following:


* **Backend**

  * **Python (min v3.8)**
  * **Python Flask Framework**
  * **Flask SQL Alchemy**
  * **Jinja Templating Engine**
* **Front End**

  * **Vanilla JS**
  * **Standard CSS3**
  * **HTML5** 

&#x09;



###### Installation



Before Running the installation .bat scripts, you first need to have Python Ready on your Environment, the current install scripts is written for Windows System Only, for now.







1. To setup the system for the first time, you need to run ***setup\_env.bat***, this setup the virtual env on the Project folder, which it need to run on most cases and is much preferred on shared resources. This will then install the dependencies listed on the ***requirements.txt***, all of this would run on its own unless problem arises during installation.

2. After the installations are done, you can now start the server, run the **start.bat** file, this will then execute the run script properly to activate the services for the server.

The **start.bat** will open up two terminal apps, the first one is the actual server itself, which runs the ***main.py*** of the webserver. 

The second Terminal app is a stand alone python script the pings and runs the crons job. This is necessary if the server is only run on a environment which has no dedicated crons service, this is done by calling a certain endpoint on the server which triggers a routine, like for automated notifications etc.     

&#x20;
3. Currently the version runs SQLite for the database, which can easily be changedto be SQL server based by changing some lines on the \_\_init\_\_ file. 

4. You might need to have the .env file inside the "website" server,

which needs the following lines:





test=testcode

MAIL\_PASSWORD=\*password

MAIL\_USERNAME=\*smpt\_email

CRON\_TOKEN=\*md5 or other kinds of string token, should be same on the cron script values on  notify\_cron\_service?token=*value* 

