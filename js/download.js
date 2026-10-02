// Download piece of data using blob
// linter: ngspicejs-lint --browser
"use strict";

export function download (data, filename = 'data.txt') {
    // Download piece of data using blob
    if (typeof data !== 'string') {
        throw "download(data) data must be string";
    }
    var blob = new Blob([data], { type: "text/plain" });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename || 'data.txt';
    a.click();
    URL.revokeObjectURL(a.href);
}
