'use strict';


// -------------------------------------------------------------------------------------------------


var Debug = {
    Log: function(level, a, b, c, d, e, f) {
        let prefix = Debug.level == 0 ? '' : '[' + level + ']';
        if (Debug.level >= level) {
            if (f != undefined) {
                console.log(prefix, a, b, c, d, e, f);
            } else if (e != undefined) {
                console.log(prefix, a, b, c, d, e);
            } else if (d != undefined) {
                console.log(prefix, a, b, c, d);
            } else if (c != undefined) {
                console.log(prefix, a, b, c);
            } else if (b != undefined) {
                console.log(prefix, a, b);
            } else {
                console.log(prefix, a);
            }
        }
    },

    level: ['localhost', '127.0.0.1'].includes(location.hostname) ? 2 : 0,
};


// -------------------------------------------------------------------------------------------------


function LoadScripts(script_urls, on_loaded) {
    Debug.Log(1, 'Loading scripts', script_urls);
    let ready = false;
    let pending = 0;
    for (let i in script_urls) {
        let script = document.createElement('script');
        script.onload = function() {
            Debug.Log(2, 'Loaded script', script.src);
            pending -= 1;
            if (pending == 0 && ready) {
                Debug.Log(1, 'Loaded all scripts', script_urls);
                on_loaded();
            }
        };
        pending += 1;
        script.src = script_urls[i];
        document.head.appendChild(script);
    };
    ready = true;
    if (pending == 0) {
        Debug.Log(1, 'Loaded all ' + script_urls.length + ' scripts', script_urls);
        on_loaded();
    }
}


// -------------------------------------------------------------------------------------------------


function Main() {
    Debug.Log(1, 'Main running');
    let scripts = [
        '/utils.js',
        '/cortex.js',
    ];
    LoadScripts(scripts, function() { window['CortexMain'](); });
}
