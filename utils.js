'use strict';


function Clamp(value, min, max) {
    return value <= min ? min : value >= max ? max : value;
}


// -------------------------------------------------------------------------------------------------


function PerformHttpRequest(method, url, payload, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (200 <= xhr.status && xhr.status < 300) {
                let response;
                try {
                    let response = JSON.parse(xhr.responseText);
                    Debug.Log(callback ? 2 : 1, method + ' ' + url + ' +', payload, '=> (' + xhr.status + ') ', response);
                    if (callback) {
                        callback(response);
                    }
                } catch (error) {
                    throw new Error(method + ' ' + url + ' + ' + payload + ' => (' + xhr.status + ') JSON parse ' + error);
                }
            } else {
                throw new Error(method + ' ' + url + ' + ' + payload + ' => (' + xhr.status + ') ' + xhr.statusText);
            }
        }
    };
    xhr.open(method, url);
    xhr.send(payload);
}
