const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const port = new SerialPort({ path: '/dev/ttyACM0', baudRate: 9600 }); // Attach Arduino
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const express = require('express');
const app = express();

const mqtt = require('mqtt');
const mqttOptions = {   // Set up your mqtt credentials here
    port: 1883,
    host: '10.0.0.0',
    username: 'username',
    password: 'password',
    protocolVersion: 4,
};
const client = mqtt.connect('mqtt://10.0.0.0', mqttOptions);    // change ip to your mqtt server
const topic = 'home/gate';

var arduino = "disconnected";
var UID = "";
var lockState = "locked";
var unlockCount = 0;

// handle data from arduino
parser.on('data', (data) => {
//    console.log(`[DEBUG] ${data}`);
    if(data.includes("UID=")) {     // extract UID from RFID card
      UID = data.slice(4);
      client.publish(`${topic}/uid`, UID);
      console.log(UID);
    }

    switch(data) {
        case "arduino_on":
            arduino = "connected";
            console.log("Arduino connected")
            break;

        case "relay_on":
            unlockCount++
            lockState = "unlocked";
            client.publish(`${topic}/state`, 'UNLOCK');
            console.log("Unlocked")
            break;

        case "relay_off":
            lockState = "locked";
            client.publish(`${topic}/state`, 'LOCK');
            console.log("Locked")
            break;
    }
});

parser.on('error', (err) => {
    console.log(err.message);
});

// REST Api endpoints
app.get('/status', (req, res) => {
    let data = {
        "arduino": arduino,
        "UID": UID,
        "state": lockState,
        "unlocks": unlockCount
    }
    res.send(data);
});

app.get('/unlock', (req, res) => {
    port.write('unlock\n');
    client.publish(`${topic}/state`, 'UNLOCK');
    UID = "webapi";
    client.publish(`${topic}/uid`, UID);
    res.send('sent');
});

app.get('/lock', (req, res) => {
    port.write('lock\n');
    client.publish(`${topic}/state`, 'LOCK');
    UID = "webapi";
    client.publish(`${topic}/uid`, UID);
    res.send('sent');
});

const server = app.listen(5001, () => {
    console.log("API up on :5001")
});

// mqtt communication
client.on('connect', () => {
    console.log('MQTT Connected');
    client.subscribe(`${topic}/set`, () => {
        client.on('message', (topic, message, packet) => {
            console.log(`MQTT: ${message}`);
            if(message == 'UNLOCK'){
                port.write('unlock\n');
                client.publish(`${topic}/state`, 'UNLOCK');
                UID = 'MQTT';
                client.publish(`${topic}/uid`, 'MQTT');
            } else if(message == "LOCK"){
                port.write('lock\n');
                client.publish(`${topic}/state`, 'LOCK');
                UID = 'MQTT';
                client.publish(`${topic}/uid`, 'MQTT');
            };
        });
    });
});