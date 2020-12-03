'use strict';



// -------------------------------------------------------------------------------------------------


function Main() {
    console.log('Cortex');

    /*
    let button = document.createElement('button');
    button.innerHTML = 'Button';
    button.classList.add('button');
    button.addEventListener('click', (function() {
        console.log('button clicked');
    }).bind(this));
    document.body.appendChild(button);

    let xml_http = new XMLHttpRequest();
    xml_http.onreadystatechange = function() {
        if (xml_http.readyState == 4) {
            if (xml_http.status == 200) {
                let items = JSON.parse(xml_http.responseText);
                for (let i in items) {
                    let item = items[i];
                    if (item.state.on) {
                        document.write(item.name + ' on: ' + item.state.bri + ' / ' + item.state.ct);
                    } else {
                        document.write(item.name + ' off');
                    }
                    document.write('<br><br>');
                }
            } else {
                throw new Error('Error ' + xml_http.status + ' while fetching Hue status');
            }
        }
    };
    xml_http.open('GET', 'http://192.168.178.22:80/api/lights', true);
    xml_http.send(null);
    */
}
