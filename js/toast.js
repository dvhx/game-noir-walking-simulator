// Show small piece of text on screen
// linter: ngspicejs-lint --browser
"use strict";

var previous = null;

export function toast(message) {
    // show small piece of text at the bottom of screen
    if (previous) {
        previous.remove();
        previous = null;
    }
    var div, msg;
    div = document.createElement('div');
    div.className = 'toastContainer';
    div.style.position = 'fixed';
    div.style.left = '1cm';
    div.style.right = '1cm';
    div.style.bottom = '1cm';
    div.style.zIndex = 1000;
    div.style.textAlign = 'center';
    previous = div;
    msg = document.createElement('div');
    msg.className = 'toast';
    msg.textContent = message;
    msg.style.display = 'inline-block';
    msg.style.backgroundColor = 'rgba(0,0,0,0.7)';
    msg.style.color = 'white';
    msg.style.padding = '1ex';
    msg.style.borderRadius = '2ex';
    div.appendChild(msg);
    document.body.appendChild(div);
    window.setTimeout(() => div.remove(), 5000);
    return msg;
}
