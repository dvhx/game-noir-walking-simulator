// Single road segment
// linter: ngspicejs-lint --browser
// global: SC
"use strict";

export class Road {
    // Single road segment

    constructor ({x = 0, z = 0, n = false, e = false, s = false, w = false} = {}) {
        this.x = x;
        this.z = z;
        this.n = n;
        this.e = e;
        this.s = s;
        this.w = w;
        this.rebuild();
    }

    toJSON () {
        // serialize
        return {
            x: this.x,
            z: this.z,
            n: this.n,
            e: this.e,
            s: this.s,
            w: this.w
        };
    }

    getCode () {
        // convert NESW to 0..15
        return (this.n ? 1 : 0) + (this.e ? 2 : 0) + (this.s ? 4 : 0) + (this.w ? 8 : 0);
    }

    rebuild () {
        // create model and add it to scene
        if (this.object) {
            this.release();
        }
        var code = (this.n ? 'N' : '') + (this.e ? 'E' : '') + (this.s ? 'S' : '') + (this.w ? 'W' : '');
        var path = this.path;
        var rot = 0;
        switch (code) {
        case '': path = 'road/cross'; rot = 0; break;
        case 'NESW': path = 'road/cross'; rot = 0; break;
        case 'EW': path = 'road/road'; rot = 0; break;
        case 'NS': path = 'road/road'; rot = 1; break;
        case 'NES': path = 'road/tee'; rot = 0; break;
        case 'NEW': path = 'road/tee'; rot = 1; break;
        case 'NSW': path = 'road/tee'; rot = 2; break;
        case 'ESW': path = 'road/tee'; rot = 3; break;
        case 'NE': path = 'road/curve'; rot = 0; break;
        case 'NW': path = 'road/curve'; rot = 1; break;
        case 'SW': path = 'road/curve'; rot = 2; break;
        case 'ES': path = 'road/curve'; rot = 3; break;
        case 'N': path = 'road/end'; rot = 1; break;
        case 'W': path = 'road/end'; rot = 2; break;
        case 'E': path = 'road/end'; rot = 0; break;
        case 'S': path = 'road/end'; rot = 3; break;
        default:
            throw "Unhandled road case " + code;
        }
        this.object = SC.models.cache[path].group.clone();
        //var col = 0.1;
        //this.object.children[0].material.color.set(col, col, col);
        this.object.rotation.y = rot * Math.PI / 2;
        this.object.position.set(this.x * 10 + 1 * 5, 0, this.z * 10 + 1 * 5);
        SC.scene.add(this.object);
    }

    release () {
        // remove this road from scene
        if (!this.object) {
            return;
        }
        this.object.removeFromParent();
        this.object = null;
    }
}
