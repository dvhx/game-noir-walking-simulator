// Ground grid and related functions
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Grid {
    // Ground grid and related functions

    constructor () {
        this.size = 15;          // number of cells from center to edge
        this.cellSize = 10;      // size of cell is 10m
        this.cursor = null;      // {x:floor(x), z:floor(z)} if user points on ground
        this.cursorFloat = null; // {x,z} if user points on ground
        // grid
        this.helper = new THREE.GridHelper(this.cellSize * 2 * this.size, this.size * 2, 0x0077ff, 0x555555);
        this.helper.position.y = -0.05;
        SC.scene.add(this.helper);
        // raycaster for plane colisions
        this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.raycaster = new THREE.Raycaster();
        // green indicator
        this.indicator = new THREE.Mesh(
            new THREE.PlaneGeometry(this.cellSize * 1.07, this.cellSize * 1.07),
            new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
        );
        this.indicator.rotation.x = -Math.PI / 2;
        this.indicator.position.y = 0.25;
        this.indicator.visible = false;
        SC.scene.add(this.indicator);
        // update loop
        var t = this;
        window.setInterval(function () { t.update(); }, 100);
    }

    toWorld (x, z) {
        // convert grid coordinates to world coordinates
        return {
            x: x * this.cellSize,
            y: 0,
            z: z * this.cellSize,
        };
    }

    fromWorld (x, z) {
        // convert world coordinates to integer grid coordinates
        return {
            x: Math.floor(x / this.cellSize),
            y: 0,
            z: Math.floor(z / this.cellSize),
        };
    }

    fromWorldFloat (x, z) {
        // convert world coordinates to real grid coordinates
        return {
            x: x / this.cellSize,
            y: 0,
            z: z / this.cellSize,
        };
    }

    updateRaycaster() {
        // update raycaster from camera pos and dir
        var forward = new THREE.Vector3();
        SC.camera.getWorldDirection(forward);
        this.raycaster.set(SC.camera.getWorldPosition(new THREE.Vector3()), forward);
    }

    update() {
        // update position of grid indicator (green square), update .cursor and .cursorFloat
        this.cursor = null;
        this.cursorFloat = null;
        if (!this.indicator.visible) {
            return;
        }
        var intersectionPoint = new THREE.Vector3();
        this.updateRaycaster();
        var hit = this.raycaster.ray.intersectPlane(this.plane, intersectionPoint);
        //console.log(hit);
        if (hit && Math.abs(hit.x) < this.size * this.cellSize && Math.abs(hit.z) < this.size * this.cellSize) {
            this.cursor = this.fromWorld(hit.x, hit.z);
            this.cursorFloat = hit;
            var w = this.toWorld(this.cursor.x, this.cursor.z);
            this.indicator.position.x = w.x + this.cellSize / 2;
            this.indicator.position.z = w.z + this.cellSize / 2;
            this.indicator.position.y = 0.25;
        } else {
            this.indicator.position.y = -1000;
        }
        return;
    }
}

