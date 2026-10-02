// Return all elements with defined id all in one object
// linter: ngspicejs-lint --browser
// global:
"use strict";

export function elementsWithId () {
    // return all elements with defined id, if id is set
    var o = {};
    for (var n of document.body.querySelectorAll('[id]')) {
        if (n.id) {
            o[n.id] = n;
        }
    }
    return o;
}

