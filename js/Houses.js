// Manage all houses
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Houses {
    // Manage all houses

    constructor () {
        this.items = [];
    }

    fromJSON (json) {
        // deserialize all items
        var t = this;
        this.items.forEach((o) => o.release());
        this.items = [];
        json.forEach((o) => {
            var h = new SC.House(o);
            t.items.push(h);
        });
    }

    toJSON () {
        // serialize all items
        return this.items.map((r) => r.toJSON());
    }

    findByXZ (x, z) {
        // find house at (integer) x/z position
        return this.items.find((h) => h.x === x && h.z === z);
    }

    addXZ (x, z) {
        // add random house at given position
        var h = this.findByXZ(x, z);
        if (h) {
            this.items.splice(this.items.indexOf(h), 1);
            h.release();
            return;
        }
        if (SC.roads.findByXZ(x, z)) {
            SC.toast('House cannot be on the road');
            return;
        }
        var json = {
            x,
            z,
            rotation: 0,
            shop: SC.randomItem(Object.keys(SC.Specs.shop)),
            floors: [
                SC.randomItem(Object.keys(SC.Specs.floor)),
                SC.randomItem(Object.keys(SC.Specs.floor)),
            ],
            roof: SC.randomItem(Object.keys(SC.Specs.roof)),
            leftAd: 0,
            rightAd: 0,
            fireEscape: false,
            signage: Math.random() < 0.2 ? SC.randomItem([1,2,3,4,5]) : 0 // doctor etc should not have signage "hotel" or "cafe", so I should check floors and shop and choose signage then
        };
        // some houses will have third floor
        if (Math.random() < 0.3) {
            json.floors.push(SC.randomItem(Object.keys(SC.Specs.floor)));
        }
        // these floor types should not have fire escape (has signage or style that doesn't suit it)
        json.fireEscape = !json.floors.find((f) => ['4','5','10','12'].includes(f));
        // and only half of the houses that can have fire escape will have it
        if (json.fireEscape) {
            json.fireEscape = Math.random() < 0.5;
        }
        // make new house face camera (maybe it should face road instead?)
        var c = SC.grid.fromWorld(SC.camera.position.x, SC.camera.position.z);
        var dx = c.x - x;
        var dz = c.z - z;
        if (dx > 0) json.rotation = 90;
        if (dx < 0) json.rotation = 270;
        if (dz > 0) json.rotation = 0;
        if (dz < 0) json.rotation = 180;
        //console.log(dx, dz, json.rotation);
        // add
        h = new SC.House(json);
        this.items.push(h);
    }

    select () {
        // select house by clicking on it's AABB
        var hits = [];
        SC.grid.updateRaycaster();
        this.items.forEach((h) => {
            var box = h.aabb();
            var p = new THREE.Vector3();
            if (SC.grid.raycaster.ray.intersectBox(box, p)) {
                hits.push({p,h,d:SC.camera.position.distanceTo(p)});
            }
        });
        hits = hits.sort((a,b) => a.d - b.d).map((o) => o.h).at(0);
        return hits;
    }

    update() {
        // hide distant houses
        var c = SC.grid.fromWorld(SC.camera.position.x, SC.camera.position.z);
        var cam = c;
        var p = window.p || 0.65;

        if (this.updateCamPos && this.updateCamPos.x === c.x && this.updateCamPos.z === c.z) {
            return;
        }
        this.visibleCount = 0;
        this.items.forEach((h) => {
            var house = h;
            var dx = Math.abs(house.x - cam.x);
            var dz = Math.abs(house.z - cam.z);
            // pure manhattan (80 houses)
            //h.object.visible = h.alwaysVisible || (dx + dz < 10);

            // blend manhattan with euclidian circle but use q<1 for inward shaped star instead (61 houses)
            var d = Math.pow(Math.pow(dx, p) + Math.pow(dz, p), 1/p);
            h.object.visible = h.alwaysVisible || d < 10 || ((dx < 2 || dz < 2) && (dx+dz < 10));

            if (h.object.visible) {
                this.visibleCount++;
            }
        });
        this.updateCamPos = c;
    }
}

