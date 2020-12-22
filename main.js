'use strict';


const HUE_HOST = '192.168.178.22'
const HUE_KEY = '';
const HUE_API = 'http://' + HUE_HOST + '/api/' + HUE_KEY;


// -------------------------------------------------------------------------------------------------


function CreateControl(light_id, group_id, room_name, lights_on, intensity) {
    let control = document.createElement('div');
    control.classList.add('control');

    let container_a = document.createElement('div');
    control.appendChild(container_a);
    let container_b = document.createElement('div');
    control.appendChild(container_b);

    let text = document.createElement('span');
    text.classList.add('text');
    text.innerHTML = room_name;
    container_a.appendChild(text);

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = lights_on;
    container_a.appendChild(checkbox);

    let range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '2';
    range.value = '' + intensity;
    range.disabled = !lights_on;
    container_b.appendChild(range);

    checkbox.addEventListener('change', (event) => {
        lights_on = !lights_on;
        checkbox.checked = lights_on;
        range.disabled = !lights_on;

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log('Hue response: ' + xhr.status + ' - ' + xhr.responseText);
            }
        };
        let url;
        if (light_id) {
            url = HUE_API + '/lights/' + light_id + '/state';
        } else {
            url = HUE_API + '/groups/' + group_id + '/action';
        }
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        let payload = JSON.stringify({'on': lights_on});
        console.log('Hue request: ' + url + ' - ' + payload);
        xhr.send(payload);
    })

    range.addEventListener('change', (event) => {
        let intensity = parseInt(range.value);

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                console.log('Hue response: ' + xhr.status + ' - ' + xhr.responseText);
            }
        };
        let url;
        if (light_id) {
            url = HUE_API + '/lights/' + light_id + '/state';
        } else {
            url = HUE_API + '/groups/' + group_id + '/action';
        }
        xhr.open('PUT', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        let payload = JSON.stringify({
            'bri': GetBrightness(intensity),
            'ct': GetColor(intensity),
        });
        console.log('Hue request: ' + url + ' - ' + payload);
        xhr.send(payload);
    })

    console.log(room_name + ' lights ' + (lights_on ? 'on' : 'off') + ' @ ' + intensity + '%');
    return control;
}


function ProcessHue(response) {
    let house_lights = 0;
    let house_lights_on = false;
    let house_intensity = 0;

    let items = JSON.parse(response);
    for (let item_id in items) {
        let item = items[item_id];
        let lights_on = item.state.on;

        let brightness = Math.round(item.state.bri / 254 * 100);
        let control = CreateControl(item.name, lights_on, brightness);
        GetMainContainer().appendChild(control);

        let intensity = GetIntensity(item.state.bri, item.state.ct);
        let control = CreateControl(item_id, null, item.name, lights_on, intensity);
        document.getElementsByClassName('main_container')[0].appendChild(control);

        ++house_lights;
        house_lights_on = house_lights_on || lights_on;
        house_intensity += intensity;
    }

    let control = CreateControl(null, 0, 'House', house_lights_on, Math.round(house_intensity / house_lights));
    document.getElementsByClassName('main_container')[0].prepend(control);
}


// -------------------------------------------------------------------------------------------------


/*
Actual mapping from brightness and color to intensity:

{"bri":254,"ct":320}, 100
{"bri":254,"ct":380}, 80
{"bri":180,"ct":400}, 60
{"bri":120,"ct":420}, 40
{"bri":60,"ct":454},  20
{"bri":1,"ct":454},    0
*/


function clamp(value, min, max) {
    return value <= min ? min : value >= max ? max : value;
}


function GetIntensity(brightness, color) {
    brightness = clamp(brightness, 1, 254);

    if (brightness == 254) {
        color = clamp(color, 320, 380);
        return Math.round(100 - (color - 320) / 60 * 20);
    }

    // color = clamp(color, 320, 454);
    return Math.round((brightness - 1) / 253 * 80);
}


function GetBrightness(intensity) {
    intensity = clamp(intensity, 0, 100);
    if (intensity >= 80) {
        return 254;
    }
    return Math.round(intensity / 80 * 253 + 1);
}


function GetColor(intensity) {
    intensity = clamp(intensity, 0, 100);
    if (intensity <= 20) {
        return 454;
    }
    return Math.round(454 - (intensity - 20) / 80 * 134);
}


// -------------------------------------------------------------------------------------------------


function Main() {
    console.log('Cortex running');

    /*
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                ProcessHue(xhr.responseText);
            } else {
                throw new Error('Error ' + xhr.status + ' while fetching Hue status');
            }
        }
    };
    xhr.open('GET', HUE_API + '/lights', true);
    xhr.send(null);
    */

    let hue_response = '{"1":{"state":{"on":true,"bri":203,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":false},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:53"},"type":"Color temperature light","name":"Bed Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:d3:43:12-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"2":{"state":{"on":true,"bri":254,"ct":380,"alert":"none","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:13"},"type":"Color temperature light","name":"Live Beige Lamp","modelid":"LTW001","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:10:2a:23:40-0b","swversion":"5.130.1.30000"},"3":{"state":{"on":true,"bri":254,"ct":380,"alert":"none","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:08"},"type":"Color temperature light","name":"Live Blue Lamp","modelid":"LTW001","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:10:2a:1d:d6-0b","swversion":"5.130.1.30000"},"4":{"state":{"on":false,"bri":128,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:50"},"type":"Color temperature light","name":"Hall Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:a0:82:8c-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"5":{"state":{"on":true,"bri":128,"ct":320,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:16:58"},"type":"Color temperature light","name":"Bath Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:03:9e:90:18-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"6":{"state":{"on":true,"bri":242,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-03-03T13:17:03"},"type":"Color temperature light","name":"Live Ground Lamp","modelid":"LTW010","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance lamp","capabilities":{"certified":true,"control":{"mindimlevel":1000,"maxlumen":806,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"sultanbulb","function":"functional","direction":"omnidirectional","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:04:56:49:36-0b","swversion":"1.50.2_r30933","swconfigid":"20CFB29D","productid":"Philips-LTW010-1-A19CTv2"},"7":{"state":{"on":true,"bri":26,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-07-02T12:33:21"},"type":"Color temperature light","name":"Desk Left Lamp","modelid":"LTG002","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance spot","capabilities":{"certified":true,"control":{"mindimlevel":200,"maxlumen":350,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"spotbulb","function":"functional","direction":"downwards","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:08:45:a0:17-0b","swversion":"1.65.11_hB798F2","swconfigid":"EB7E2352","productid":"Philips-LTG002-1-GU10CTv2"},"8":{"state":{"on":true,"bri":62,"ct":380,"alert":"select","colormode":"ct","mode":"homeautomation","reachable":true},"swupdate":{"state":"noupdates","lastinstall":"2020-07-02T12:33:18"},"type":"Color temperature light","name":"Desk Right Lamp","modelid":"LTG002","manufacturername":"Signify Netherlands B.V.","productname":"Hue ambiance spot","capabilities":{"certified":true,"control":{"mindimlevel":200,"maxlumen":350,"ct":{"min":153,"max":454}},"streaming":{"renderer":false,"proxy":false}},"config":{"archetype":"spotbulb","function":"functional","direction":"downwards","startup":{"mode":"powerfail","configured":true}},"uniqueid":"00:17:88:01:08:45:9e:12-0b","swversion":"1.65.11_hB798F2","swconfigid":"EB7E2352","productid":"Philips-LTG002-1-GU10CTv2"}}';
    ProcessHue(hue_response);
}
