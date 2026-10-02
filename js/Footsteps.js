// Footsteps audio effects
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Footsteps {
    // Footsteps audio effects

    constructor () {
        this.footstepLength = 4;
        this.walkedDistance = 0;
        this.oldPosition = new THREE.Vector3();
        this.oldPosition.copy(SC.camera.position);
        this.time = Date.now();
        this.audio = [];
        for (var i = 1; i <= 6; i++) {
            var a = document.createElement('audio');
            a.src = 'audio/walk' + i + '.ogg';
            a.loop = false;
            this.audio.push(a);
        }
        this.next = this.audio.slice();
        this.ready();
    }

    ready () {
        // make next step be heard immediately after first move
        this.walkedDistance = this.footstepLength - 0.001;
        this.oldPosition.copy(SC.camera.position);
    }

    update () {
        // track traveled distance and play footstep sounds
        var d = SC.camera.position.distanceTo(this.oldPosition);
        this.oldPosition.copy(SC.camera.position);
        this.walkedDistance += d;
        if (this.walkedDistance > this.footstepLength) {
            var t = Date.now();
            if (t - this.time > 300) {
                var a = this.next.pop();
                a.play();
                if (this.next.length <= 0) {
                    this.next = this.audio.slice();
                }
                this.time = t;
            }
            this.walkedDistance = 0;
        }
    }
}

