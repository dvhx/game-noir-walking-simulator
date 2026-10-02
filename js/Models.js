// Load all obj models at once on startup
// linter: ngspicejs-lint --browser
// global: THREE, OBJLoader, SC
"use strict";

var anisotropy = 8;

export class Models {
    // Load all obj models at once on startup

    constructor () {
        this.cache = {};
    }

    load (paths, callback) {
        // load all obj models at once, then call callback, models are in .cache{path}
        var ret = {}, remaining = paths.length, self = this;

        function cb() {  // noapi
            //console.log('cb', aPath, remaining);
            if (remaining === 0 && callback) {
                callback(ret);
            }
        }

        function one(path) { // noapi
            // load one obj model
            var base = path.split('/').at(0);
            // obj model
            var objLoader = new OBJLoader();
            objLoader.load('model/' + path + '/' + base + '.obj', function (group) { // noapi
                // because I don't want to load mtl so I use group name as texture name
                var isPng = group.children[0].name.endsWith('.png');
                // texture
                var textureLoader = new THREE.TextureLoader();
                var texture = textureLoader.load('model/' + path + '/' + base + (isPng ? '.png' : '.jpg'));
                texture.colorSpace = THREE.SRGBColorSpace;
                texture.wrapT = THREE.RepeatWrapping;
                texture.wrapS = THREE.RepeatWrapping;
                texture.anisotropy = Math.min(anisotropy, SC.renderer.capabilities.getMaxAnisotropy());
                //console.log('loaded', aPath);
                group.children[0].material = new THREE.MeshLambertMaterial({map: texture});
                group.children[0].receiveShadow = false;
                // make pngs transparent
                if (isPng) {
                    group.children[0].material.transparent = true;
                    group.children[0].material.alphaTest = 0.1;
                }
                ret[path] = {group, texture, material: group.children[0].material};
                self.cache[path] = ret[path];
                remaining--;
                cb();
            });
        }

        paths.forEach(one);
    }
}
