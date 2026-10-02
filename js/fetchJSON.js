// Fetch JSON from server then call callback
// linter: ngspicejs-lint --browser
"use strict";

export function fetchJSON (url, callback) {
    // Fetch JSON from server then call callback
    var p = fetch(url).then((r) => r.json());
    return callback ? p.then(callback) : p;
}
