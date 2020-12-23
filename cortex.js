'use strict';


// -------------------------------------------------------------------------------------------------


const HUE_API = localStorage.getItem('hue_api');

var g_lights = {};
var g_groups = {};


// -------------------------------------------------------------------------------------------------


/*
Actual mapping from brightness and color to intensity:

{"bri":254,"ct":320} => 100
{"bri":254,"ct":380} =>  80
{"bri":180,"ct":400} =>  60
{"bri":120,"ct":420} =>  40
{"bri":60,"ct":454}  =>  20
{"bri":1,"ct":454}   =>   0
*/


function GetIntensity(brightness, color) {
    brightness = Clamp(brightness, 1, 254);
    if (brightness == 254) {
        color = Clamp(color, 320, 380);
        return Math.round(100 - (color - 320) / 60 * 20);
    }
    return Math.round((brightness - 1) / 253 * 80);
}


function GetBrightness(intensity) {
    intensity = Clamp(intensity, 0, 100);
    if (intensity >= 80) {
        return 254;
    }
    return Math.round(intensity / 80 * 253 + 1);
}


function GetColor(intensity) {
    intensity = Clamp(intensity, 0, 100);
    if (intensity <= 20) {
        return 454;
    }
    return Math.round(454 - (intensity - 20) / 80 * 134);
}


// -------------------------------------------------------------------------------------------------


function CreateControl(id, name, on, intensity) {
    let control = document.createElement('div');
    control.classList.add('control');

    let container_a = document.createElement('div');
    control.appendChild(container_a);
    let container_b = document.createElement('div');
    control.appendChild(container_b);

    let text = document.createElement('span');
    text.classList.add('text');
    text.innerHTML = name;
    container_a.appendChild(text);

    let checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = on;
    container_a.appendChild(checkbox);

    let range = document.createElement('input');
    range.type = 'range';
    range.min = '0';
    range.max = '100';
    range.step = '5';
    range.value = '' + intensity;
    range.disabled = !on;
    container_b.appendChild(range);

    checkbox.addEventListener('change', (event) => {
        on = !on;
        checkbox.checked = on;
        range.disabled = !on;

        let url = HUE_API + '/groups/' + id + '/action';
        let payload = JSON.stringify({'on': on});
        PerformHttpRequest('PUT', url, payload, null);
    })

    range.addEventListener('change', (event) => {
        let intensity = parseInt(range.value);

        let url = HUE_API + '/groups/' + id + '/action';
        let payload = JSON.stringify({
            'bri': GetBrightness(intensity),
            'ct': GetColor(intensity),
        });
        PerformHttpRequest('PUT', url, payload, null);
    })

    Debug.Log(0, name + ' lights ' + (on ? 'on' : 'off') + ' @ ' + intensity + '%');
    return control;
}


// -------------------------------------------------------------------------------------------------


function CreateControls() {
    for (let id in g_groups) {
        let group = g_groups[id];
        let control = CreateControl(id, group.name, group.on, group.intensity);
        document.getElementsByClassName('main_container')[0].appendChild(control);
    }
}


// -------------------------------------------------------------------------------------------------


function ProcessLights(raw_lights) {
    for (let id in raw_lights) {
        let raw_light = raw_lights[id];
        if ('error' in raw_light) {
            console.log('Error processing Hue lights response', raw_light.error);
            continue;
        }

        g_lights[id] = {
            'name': raw_light.name,
            'on': raw_light.state.on,
            'intensity': GetIntensity(raw_light.state.bri, raw_light.state.ct),
        }
    }

    if (g_groups) {
        CreateControls();
    }
}


// -------------------------------------------------------------------------------------------------


function ProcessGroups(raw_groups) {
    for (let id in raw_groups) {
        let raw_group = raw_groups[id];
        if ('error' in raw_group) {
            console.log('Error processing Hue group response', raw_group.error);
            continue;
        }

        g_groups[id] = {
            'name': raw_group.name,
            'lights': raw_group.lights,
            'on': raw_group.action.on,
            'intensity': GetIntensity(raw_group.action.bri, raw_group.action.ct),
        }
    }

    if (g_lights) {
        CreateControls();
    }
}


// -------------------------------------------------------------------------------------------------


function ConfigureHueApi() {
    let hue_host = ''
    let hue_key = '';
    let hue_api = 'http://' + hue_host + '/api/' + hue_key;
    localStorage.setItem('hue_api', hue_api);
}


function ClearHueApi() {
    localStorage.setItem('hue_api', hue_api);
}


// -------------------------------------------------------------------------------------------------


function CortexMain() {
    Debug.Log(1, 'Cortex running');

    // ConfigureHueApi();
    // ClearHueApi();

    if (HUE_API) {
        PerformHttpRequest('GET', HUE_API + '/lights', null, ProcessLights);
        PerformHttpRequest('GET', HUE_API + '/groups', null, ProcessGroups);
    } else {
        Debug.Log(1, 'TODO: add mock data');
    }
}
