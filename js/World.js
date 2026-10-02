// World persistence
// linter: ngspicejs-lint --browser
// global: SC
"use strict";

export class World {

    static toJSON() {
        // export entire world to json
        return {
            name: SC.miniMap.name,
            houses: SC.houses.items,
            roads: SC.roads.items,
            lamps: SC.lamps.items,
            camera: {
                position: SC.camera.position.toArray(),
                quaternion: SC.camera.quaternion.toArray(),
            }
        };
    }

    static fromJSON (json) {
        // import entire world from json
        if (json.houses && json.roads && json.lamps && json.camera) {
            SC.miniMap.name = json.name || 'noname',
            SC.houses.fromJSON(json.houses || []);
            SC.roads.fromJSON(json.roads || []);
            SC.lamps.fromJSON(json.lamps || []);
            SC.camera.position.fromArray(json.camera.position || [5, 1.7, 5]);
            SC.camera.quaternion.fromArray(json.camera.quaternion || [0, -0.707, 0, 0.707]);
            SC.footsteps.ready();
            SC.houses.updateCamPos = null;
            return true;
        }
    }

    static load(name = 'default') {
        // load world from local storage
        var s = localStorage.getItem('world.' + name);
        if (!s) {
            return;
        }
        var o = JSON.parse(s);
        World.fromJSON(o);
    }

    static save(name = 'default') {
        // save world to local storage
        localStorage.setItem('world.' + name, JSON.stringify(World.toJSON()));
    }

    static export(name = 'default') {
        // export world to file
        name = prompt('Map name (without .nws extension)', name);
        if (name) {
            SC.miniMap.name = name;
            var data = JSON.stringify(World.toJSON(), undefined, 1);
            SC.download(data, name + '.nws');
        }
    }

    static import() {
        // import world from user-selected file
        SC.chooseFiles('*.nws', function (files) {
            if (!World.fromJSON(JSON.parse(files[0].data))) {
                SC.toast('Invalid file format!');
            }
        }, true);
    }

    static fetch(url, callback) {
        // fetch world from url
        SC.fetchJSON(url, function (json) {
            World.fromJSON(json);
            if (callback) callback();
        });
    }

}
