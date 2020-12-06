'use strict';


// Home config -------------------------------------------------------------------------------------


let rooms = {
    'Living room': [
        'Live Beige Lamp',
        'Live Blue Lamp',
        'Live Ground Lamp',
    ],
    'Bedroom': [
        'Bed Lamp',
    ],
    'Office': [
        'Desk Left Lamp',
        'Desk Right Lamp',
    ],
    'The rest': [
        'Bath Lamp',
        'Hall Lamp',
    ],
};


// Element factories -------------------------------------------------------------------------------


function CreateControl(control_name, lights_on, brightness) {
    let control = document.createElement('div');
    control.classList.add('control');

    let container_a = document.createElement('div');
    control.appendChild(container_a);
    let container_b = document.createElement('div');
    control.appendChild(container_b);

    let text = document.createElement('span');
    text.classList.add('text');
    text.innerHTML = control_name;
    container_a.appendChild(text);

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = lights_on;
    container_a.appendChild(checkbox);

    let range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.value = '' + brightness;
    range.disabled = !lights_on;
    container_b.appendChild(range);

    console.log(control_name + ' lights ' + (lights_on ? 'on' : 'off') + ' @ ' + brightness + '%');
    return control;
}

function CreateRoom(room_name) {
    let room = document.createElement('div');
    room.classList.add('room');

    let text = document.createElement('span');
    text.classList.add('text');
    text.innerHTML = room_name;
    room.appendChild(text);

    return room;
}


// Page builder ------------------------------------------------------------------------------------


function ProcessHue(response) {
    let items = JSON.parse(response);

    // controls is a map from control name to HTML element for that control
    let controls = {};
    for (let i in items) {
        let item = items[i];
        let lights_on = item.state.on;
        let brightness = Math.round(item.state.bri / 254 * 100);
        let control = CreateControl(item.name, lights_on, brightness);
        controls[item.name] = control;
    }

    // rooms is a map from room name to list of control names in that room
    for (let room_name in rooms) {
        let room = CreateRoom(room_name);

        let controls_in_room = rooms[room_name];
        for (let i in controls_in_room) {
            let control = controls[controls_in_room[i]];
            room.appendChild(control);
        }

        document.body.appendChild(room);
    }
}


// -------------------------------------------------------------------------------------------------


function Main() {
    console.log('Cortex running');

    /*
    let xml_http = new XMLHttpRequest();
    xml_http.onreadystatechange = function() {
        if (xml_http.readyState == 4) {
            if (xml_http.status == 200) {
                ProcessHue(xml_http.responseText);
            } else {
                throw new Error('Error ' + xml_http.status + ' while fetching Hue status');
            }
        }
    };
    xml_http.open('GET', 'http://192.168.178.22:80/api/lights', true);
    xml_http.send(null);
    */

    let hue_response = '{"1":{"state":{"on":true,"bri":203,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":false},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:53"},"type":"Color temperature light","name":"Bed Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:d3:43:12-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"2":{"state":{"on":true,"bri":254,"ct":380,"alert":"none","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:13"},"type":"Color temperature light","name":"Live Beige Lamp","modelid":"LTW001","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:10:2a:23:40-0b","swversion":"5.130.1.30000"},"3":{"state":{"on":true,"bri":254,"ct":380,"alert":"none","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:08"},"type":"Color temperature light","name":"Live Blue Lamp","modelid":"LTW001","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:10:2a:1d:d6-0b","swversion":"5.130.1.30000"},"4":{"state":{"on":false,"bri":128,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:50"},"type":"Color temperature light","name":"Hall Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:a0:82:8c-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"5":{"state":{"on":true,"bri":128,"ct":320,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:58"},"type":"Color temperature light","name":"Bath Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:03:9e:90:18-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"6":{"state":{"on":true,"bri":242,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:03"},"type":"Color temperature light","name":"Live Ground Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:56:49:36-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"7":{"state":{"on":true,"bri":26,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-07-02T12:33:21"},"type":"Color temperature light","name":"Desk Left Lamp","modelid":"LTG002","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance spot","capabilities":{"certified":true,"control":{"mindimlevel":200,"maxlumen":350,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"spotbulb","function":"functional","direction":"downwards","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:08:45:a0:17-0b","swversion":"1.65.11_hB798F2","swconfigid":"EB7E2352","productid":"Philips-LTG002-1-GU10CTv2"},"8":{"state":{"on":true,"bri":62,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-07-02T12:33:18"},"type":"Color temperature light","name":"Desk Right Lamp","modelid":"LTG002","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance spot","capabilities":{"certified":true,"control":{"mindimlevel":200,"maxlumen":350,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"spotbulb","function":"functional","direction":"downwards","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:08:45:9e:12-0b","swversion":"1.65.11_hB798F2","swconfigid":"EB7E2352","productid":"Philips-LTG002-1-GU10CTv2"}}';
    ProcessHue(hue_response);
}
