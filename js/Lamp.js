// Street lamp with point light
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Lamp {
    // Street lamp with point light

    constructor ({x = 0, z = 0} = {}) {
        this.x = x;
        this.z = z;
        this.rebuild();
    }

    toJSON () {
        // serialize
        return {
            x: this.x,
            z: this.z,
        };
    }

    rebuild () {
        // create model and place it to scene
        if (this.object) {
            this.release();
        }
        this.object = SC.models.cache['prop/lamp'].group.clone();
        this.object.position.set(this.x, 0.2, this.z);
        this.object.children[0].castShadow = false;
        SC.scene.add(this.object);
    }

    release () {
        // remove lamp from scene
        if (!this.object) {
            return;
        }
        this.object.removeFromParent();
        this.object = null;
        this.spotLight = null;
    }
}
