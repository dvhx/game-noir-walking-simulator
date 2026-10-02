// Various functions
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export function worldPosition (object) {
    // Return world position
    var v = new THREE.Vector3();
    object.getWorldPosition(v);
    return v;
}

export function leakCheck () {
    // return counts of various object for leak checks
    var n = 0;
    SC.scene.traverse(() => n++);
    return SC.renderer.info.programs.length + 'prog,' +
           SC.renderer.info.memory.geometries + 'geo,' +
           SC.renderer.info.memory.textures + 'tex,' +
           n + 'obj';
}

export function uvTransform (geometry, sx, sy, dx, dy) {
    // Scale and offset UV of textures
    var uv = geometry.attributes.uv;
    for (var i = 0; i < uv.count; i++) {
        uv.setXY(i, uv.getX(i) * sx + dx, uv.getY(i) * sy + dy);
    }
    uv.needsUpdate = true;
    return geometry;
}


