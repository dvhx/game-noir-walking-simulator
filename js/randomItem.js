// Return random item of array
// linter: ngspicejs-lint --browser
"use strict";

export function randomItem (arr) {
    // Return random item of array
    return arr[Math.floor(arr.length * Math.random())];
}
