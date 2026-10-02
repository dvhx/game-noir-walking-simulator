// Univerzal undo
// linter: ngspicejs-lint --browser
// global:
"use strict";

export class Undo {

    constructor (seriazables, size = 10) {
        // usage: var undo = new Undo([SC.houses, SC.roads, SC.lamps]); undo.push(); ... undo.pop();
        this.seriazables = seriazables; // array of objects that has toJSON() and fromJSON(o)
        this.items = [];
        this.size = size;
    }

    push () {
        // push current state to undo stack
        var s = JSON.stringify(this.seriazables.map(s => s.toJSON()));
        if (this.items.at(-1) !== s) {
            this.items.push(s);
            if (this.items.length > this.size) {
                this.items.shift();
            }
        }
    }

    pop () {
        // undo last change
        var s = this.items.pop();
        if (s) {
            s = JSON.parse(s);
            this.seriazables.forEach((o,i) => o.fromJSON(s[i]));
        }
    }

}
