// Lamps with fixed amount of spotlights assigned to nearest lamps
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Lamps {
    // Lamps with fixed amount of spotlights assigned to nearest lamps

    constructor (maxSpotlights = 4) {
        this.FADE_START = 10;
        this.FADE_END   = 90;
        this.intensity = 400;
        this.items = [];
        // 4 nearest spotlights
        this.spotlight = [];
        for (var i = 0; i < maxSpotlights; i++) {
            var s = new THREE.SpotLight(0xffffff, 100);
            s.position.set(0, 4.86, 0);
            s.angle = THREE.MathUtils.degToRad(60);
            s.penumbra = 0.2;
            s.distance = 25;
            s.decay = 2;
            s.castShadow = false;
            s.intensity = 0;
            s.target.position.set(0, -1, 0);
            s.add(s.target);
            // s.shadow.mapSize.width = 512;
            // s.shadow.mapSize.height = 512;
            // s.shadow.bias = -0.003;
            this.spotlight.push(s);
            SC.scene.add(s);
        }
        this.lastUpdate = 0;
    }

    fromJSON (json) {
        // deserialize all lamps
        // note: this function (and in Houses and Roads) needs better name
        var t = this;
        this.items.forEach((o) => o.release());
        this.items = [];
        json.forEach((o) => {
            var l = new SC.Lamp(o);
            t.items.push(l);
        });
    }

    toJSON () {
        // serialize all lamps
        return this.items.map((r) => r.toJSON());
    }

    fade (distance) {
        // fading curve that determine how distant lamp intensity gradually decrease instead of suddently going off
        var t = THREE.MathUtils.clamp(
            (this.FADE_END - distance) / (this.FADE_END - this.FADE_START),
            0, 1
        );
        return t * t * (3 - 2 * t);
    }

    nearest (x, z) {
        // return lamps sorted by distance
        // manhattan distance
        return this.items
            .map(lamp => ({lamp, d: lamp.object.position.manhattanDistanceTo({x,y:0,z})}))
            .sort((a, b) => a.d - b.d);
            /*
        // euclidian distance
        return this.items
            .map(lamp => ({lamp, d: lamp.object.position.distanceTo({x,y:0,z})}))
            .sort((a, b) => a.d - b.d);
            */
    }

    forceUpdate () {
        // move lights to nearest lamps and fade them correctly by distance
        // find point 10m in front of camera
        const dir = new THREE.Vector3();
        SC.camera.getWorldDirection(dir);
        const front = new THREE.Vector3();
        front.copy(SC.camera.position).addScaledVector(dir, 10);
        // sort lamps to nearest from this point
        var sorted = this.nearest(front.x, front.z).slice(0, this.spotlight.length);
        //console.log('sorted', sorted);
        this.items.forEach(l => l.spotlight = null);
        this.spotlight.forEach((s,i) => {
            if (sorted[i]) {
                sorted[i].lamp.spotlight = s;
                //console.log(i, sorted[i].lamp, sorted[i].d);
                s.position.copy(sorted[i].lamp.object.position);
                s.position.y = 4.86;
                s.targetIntensity = this.intensity * this.fade(sorted[i].d);
                //console.log(s.intensity);
            } else {
                //console.log(i, 'off');
                s.targetIntensity = 0;
            }
        });
    }

    update () {
        // calls forceUpdate() no sooner than every 100ms
        var t = Date.now();
        if (t - this.lastUpdate > 100) {
            this.forceUpdate();
            this.lastUpdate = t;
        }
        this.spotlight.forEach((s) => {
            s.intensity += s.intensity < s.targetIntensity ? 5 : -5;
        });
    }

    addXZ (x, z) {
        // add/remove lamp at given coords
        if (SC.camera.position.distanceTo({x,y:0,z}) > 15) {
            SC.toast('Too far to accurately place lamp!');
            return;
        }
        var ld = this.nearest(x, z).at(0);
        if (!ld || ld.d > 3) {
            // add new lamp at x,z
            var g = SC.grid.fromWorld(x, z);
            var h = SC.houses.findByXZ(g.x, g.z);
            if (h) {
                SC.toast("Don't place lamp inside the house!");
                return;
            }
            var l = new SC.Lamp({x: x, z: z});
            this.items.push(l);
            SC.miniMap.render();
            console.log('added', l);
        } else {
            // remove existing lamp
            ld.lamp.release();
            var i = this.items.indexOf(ld.lamp);
            if (i >= 0) {
                this.items.splice(i, 1);
            }
            console.log('removed');
        }
    }

}
