## Project example templates

the current workspace holds a complete template / boilerplate / preset  for a full front and backend application including a GUI. it mostly written in native javascript. it seems like a  webapplication but is not a 'website' or 'webapp' in the classical sense. it simply makes use of the browser to make use of the convenient javascript/html/css GUI possibilities. it can be extended to any kind of application, for example: 
- Utility — small focused tool (calculator, file renamer, converter)
- Monitoring tool — GPU stats, system health, network traffic
- Dashboard — visual overview of data/metrics
- Admin panel — manage a service or system
- Developer tool / devtool — debugger, profiler, code generator
- Productivity app — notes, task manager, editor
- Automation tool — scripting, scheduling, batch processing
- Creative tool — 3D modeling, image editing, music production
- Communication tool — chat, video, collaboration
- Data viewer / explorer — database browser, log viewer, file inspector. 



## example project: iot esp32 project

this project is going to be a tool to configure and flash a software onto a microcontroller. 

hardware: 
esp32
28byj-48 stepper motor

software:
desktop application (denojs server side, native js client side, json db)
CLI tools

make sure ever CLI command run can be visually shown in the GUI (for debugging)

make sure every configurable value will be stored in o_keyvalpair


flashing process: 
- user starts websersocket 'deno task run'
- websersocket makes sure that every software requirement is met (installs CLI tools that are required, sets permission on /dev/tty... if required)
- user opens localhost:port
- user uses GUI to configure the esp32 programm (sets stuff like wifi SSID and password, pin numbers for stepper motors)
- user connects esp32 
- user clicks 'compile and flash'
- esp32 is flashed
- GUI asks user to click 'EN' button on esp32 (maybe not neede)
- after a successfull flash the serial monitor should be started and the network connection info of the esp32 (IP, ssid) shoud be shown 


esp32 program:
this particular programm is going to be a stepper motor that can be configured to: 
- after getting power , repeat the procedure for n minutes
- the procedure: 
  - turn n degrees in one direction
  - turn n degrees in the other direction 
  
- when the n minutes are reached, a last time , turn n degrees into a certain direction.  