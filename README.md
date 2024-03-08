# Door lock

Raspberry pi + Arduino locking system
- Unlock with:
- RFID cards
- MQTT
- Rest API


## Installation

[Node.js](https://nodejs.org/) v18+ to run.

Clone this repo, set your pins and UIDs in the .ino file and flash it on the Arduino.
Then install the dependencies, set up the mqtt credentials, serial port and start the server.

```sh
git clone https://github.com/Dravelz-21/door-lock.git
cd door-lock
npm i --save
cd raspberry
node main.js 
```

Communication between RPI and Arduino is done with an USB cable.