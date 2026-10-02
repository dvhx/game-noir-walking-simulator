// Collisions with houses (simplest possible implementation)
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

var oldCamPos;

export function collisions () {
    // Check for house collisions and resolve it
    if (SC.editor.clipping) {
        return;
    }
    var cam = SC.camera.position;
    if (!oldCamPos) {
        oldCamPos = new THREE.Vector3();
        oldCamPos.copy(cam);
    }
    var dir = cam.clone().sub(oldCamPos);
    var grid = SC.grid.fromWorld(cam.x, cam.z);
    var house = SC.houses.findByXZ(grid.x, grid.z);
    if (house) {
        // simplest version = gradually repel camera away from center, works ok for cars
        /*
        var center = house.center();
        var out = cam.clone().sub(center);
        var len = out.length();
        out.multiplyScalar(0.1/len);
        SC.camera.position.add(out);
        */
        // improved version = move camera to contact point with house, ten bit out to prevent stucking
        var aabb = house.aabb();
        var ray = new THREE.Ray(oldCamPos, dir);
        var point = new THREE.Vector3();
        if (ray.intersectBox(aabb, point)) {
            SC.camera.position.copy(point);
            SC.camera.position.add(dir.clone().multiplyScalar(-0.5));
        }
    }
    oldCamPos.copy(cam);
}
