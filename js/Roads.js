// Manage all roads
// linter: ngspicejs-lint --browser
// global: SC
"use strict";

export class Roads {
    // Manage all roads

    constructor () {
        this.items = [];
    }

    fromJSON (json) {
        // deserialize all roads
        var self = this;
        this.items.forEach((o) => o.release());
        this.items = [];
        json.forEach((o) => {
            var r = new SC.Road(o);
            self.items.push(r);
        });
    }

    toJSON () {
        // serialize all roads
        return this.items.map((r) => r.toJSON());
    }

    findByXZ (x, z) {
        // find road at (integer) x/z position
        return this.items.find((h) => h.x === x && h.z === z);
    }

    add (x, z, n, e, s, w) {
        // add new road segment
        var r = SC.Road.fromJSON({x, z, n, e, s, w});
        this.items.push(r);
        return r;
    }

    addXZ (x, z) {
        // add or remove road, handle neighbour connections
        var h = SC.houses.select();
        if (h) {
            SC.toast('House obstructs view');
            return;
        }
        var tt = this.findByXZ(x,z);
        var nn = this.findByXZ(x + 1,z);
        var ee = this.findByXZ(x,z + 1);
        var ss = this.findByXZ(x - 1,z);
        var ww = this.findByXZ(x,z - 1);
        if (tt) {
            tt.object.removeFromParent();
            this.items.splice(this.items.indexOf(tt), 1);
            // update neighbours as well
            if (nn) { nn.s = false; nn.rebuild(); }
            if (ee) { ee.w = false; ee.rebuild(); }
            if (ss) { ss.n = false; ss.rebuild(); }
            if (ww) { ww.e = false; ww.rebuild(); }
            return;
        }
        var r = new SC.Road({
            x,
            z,
            n: !!nn,
            e: !!ee,
            s: !!ss,
            w: !!ww
        });
        this.items.push(r);
        // update neighbours as well
        if (nn) { nn.s = true; nn.rebuild(); }
        if (ee) { ee.w = true; ee.rebuild(); }
        if (ss) { ss.n = true; ss.rebuild(); }
        if (ww) { ww.e = true; ww.rebuild(); }
        return r;
    }

    update() {
        // hide distant road segments
        var c = SC.grid.fromWorld(SC.camera.position.x, SC.camera.position.z);
        if (this.updateCamPos && this.updateCamPos.x === c.x && this.updateCamPos.z === c.z) {
            return;
        }
        this.items.forEach((r) => {
            var d = Math.abs(r.x - c.x) + Math.abs(r.z - c.z);
            r.object.visible = d < 8;
        });
        this.updateCamPos = c;
    }
}
