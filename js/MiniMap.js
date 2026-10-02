// Rendering of minimap
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class MiniMap {
    // Rendering of minimap

    constructor (canvas, pixelSize) {
        this.name = 'noname';
        this.gridSize = 10;
        this.size = pixelSize;
        this.canvas = canvas;
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        this.canvas.style.width = this.size + 'px';
        this.canvas.style.height = this.size + 'px';
        this.canvas.style.display = 'none';
        this.context = this.canvas.getContext('2d');
        this.roadNone = document.createElement('canvas');
        this.roadCache = {};
        //this.toggle();
    }

    toggle () {
        // toggle map on/off
        this.canvas.style.display = this.canvas.style.display === 'none' ? 'block' : 'none';
        this.render();
    }

    roadCanvas (road, cellSize) {
        // get cached road canvas mini tile to blit on map
        var code = road.getCode();
        if (this.roadCache[code]) {
            return this.roadCache[code];
        }
        var img = road.object.children[0].material.map.image;
        if (!img || (img.naturalHeight <= 0)) {
            return this.roadNone;
        }
        var canvas = document.createElement('canvas');
        canvas.width = cellSize;
        canvas.height = cellSize;
        var ctx = canvas.getContext('2d');
        var angle = {
            0: 0,
            1: 2,
            2: 1,
            3: 1,
            4: 0,
            5: 0,
            6: 0,
            7: 1,
            8: 3,
            9: 2,
            10: 1,
            11: 2,
            12: 3,
            13: 3,
            14: 0,
            15: 0
        };

        ctx.save();
        ctx.translate(cellSize / 2, cellSize / 2);
        ctx.rotate(-angle[code] * Math.PI / 2);
        ctx.translate(-cellSize / 2, -cellSize / 2);
        ctx.drawImage(img, 0, 0, cellSize, cellSize);
        ctx.restore();

        //ctx.fillText(code.toString(), 5, 15);
        this.roadCache[code] = canvas;
        return canvas;
    }

    gridToMap(x,z,canvasCellSize) {
        // convert grid coordinates (roads,houses) to minimap canvas coordinates
        return {
            x: this.size / 2 + z * canvasCellSize,
            y: this.size / 2 - x * canvasCellSize
        };
    }

    worldToMap(x,z,canvasCellSize) {
        // convert world coordinates (lamps,camera) to minimap canvas coordinates
        return {
            x: this.size / 2 + (z / this.gridSize) * canvasCellSize,
            y: this.size / 2 - (-1 + x / this.gridSize) * canvasCellSize
        };
    }

    render () {
        // render minimap
        if (!SC.roads || !SC.houses || this.canvas.style.display === 'none') {
            return;
        }
        var t1 = performance.now();
        var ctx = this.context, s = this.size;
        ctx.clearRect(0, 0, s, s);
        // get player's position
        var p = SC.grid.fromWorld(SC.camera.position.x, SC.camera.position.z);
        // find constraints
        var minx = 0;
        var maxx = 0;
        var minz = 0;
        var maxz = 0;
        SC.roads.items.forEach((r) => {
            minx = Math.min(minx, r.x);
            maxx = Math.max(maxx, r.x);
            minz = Math.min(minz, r.z);
            maxz = Math.max(maxz, r.z);
        });
        SC.houses.items.forEach((r) => {
            minx = Math.min(minx, r.x);
            maxx = Math.max(maxx, r.x);
            minz = Math.min(minz, r.z);
            maxz = Math.max(maxz, r.z);
        });
        var extent = Math.max.apply({}, [minx,maxx,minz,maxz,p.x,p.z].map((v) => Math.abs(v))) + 1;
        //console.log({minx,maxx,minz,maxz,extent});
        // render cells
        var cell_size = s / (2 * extent);
        //console.log(cell_size);
        // roads
        var m;
        SC.roads.items.forEach((r) => {
            ctx.globalAlpha = r.object.visible ? 1 : 0.5;
            m = this.gridToMap(r.x, r.z, cell_size);
            //var x = s / 2 + r.z * cell_size;
            //var y = s / 2 - r.x * cell_size;
            var c = this.roadCanvas(r, cell_size);
            ctx.drawImage(c, m.x, m.y, cell_size, cell_size);
        });
        // houses
        SC.houses.items.forEach((r) => {
            var x = s / 2 + r.z * cell_size;
            var y = s / 2 - r.x * cell_size;
            ctx.globalAlpha = r.object.visible ? 1 : 0.5;
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, cell_size - 1, cell_size - 1);
            var w;
            if (r.leftAd) {
                w = SC.worldPosition(r.objects.leftWall);
                m = this.worldToMap(w.x, w.z, cell_size);
                ctx.fillStyle = 'fuchsia';
                ctx.fillRect(m.x - 1, m.y - 1, 2, 2);
            }
            if (r.rightAd) {
                w = SC.worldPosition(r.objects.rightWall);
                m = this.worldToMap(w.x, w.z, cell_size);
                ctx.fillStyle = 'fuchsia';
                ctx.fillRect(m.x - 1, m.y - 1, 2, 2);
            }
        });
        // lamps
        ctx.globalAlpha = 1;
        SC.lamps.items.forEach((l) => {
            ctx.globalAlpha = l.object.visible ? 1 : 0.5;
            var x = s / 2 + (l.z / this.gridSize) * cell_size;
            var y = s / 2 - (-1 + l.x / this.gridSize) * cell_size;
            ctx.fillStyle = l.spotlight ? 'lime' : 'green';
            ctx.fillRect(x-1, y-1, 2, 2);
        });
        // player
        var x = s / 2 + (SC.camera.position.z / this.gridSize) * cell_size;
        var y = s / 2 - (-1 + SC.camera.position.x / this.gridSize) * cell_size;
        ctx.fillStyle = 'pink';
        ctx.fillRect(x - 2, y - 2, 4, 4);
        // fov triangle
        ctx.strokeStyle = 'yellow';
        var fwd = new THREE.Vector3();
        SC.camera.getWorldDirection(fwd);
        var up = new THREE.Vector3(0, 1, 0).applyQuaternion(SC.camera.quaternion);
        var fov = THREE.MathUtils.degToRad(SC.camera.fov);
        var aspect = SC.camera.aspect;
        var hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
        var left = fwd.clone().applyAxisAngle(up, hfov / 2);
        var right = fwd.clone().applyAxisAngle(up, -hfov / 2);
        var lx = x + left.z * cell_size;
        var ly = y - left.x * cell_size;
        var rx = x + right.z * cell_size;
        var ry = y - right.x * cell_size;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(x, y);
        ctx.lineTo(lx, ly);
        ctx.closePath();
        ctx.stroke();
        var t2 = performance.now();
        this.renderTime = t2 - t1;
    }

}


