// FPS counter
// linter: ngspicejs-lint --browser
// global: performance
"use strict";

export class FpsCounter {
    // FPS counter

    constructor (elementId) {
        this.fps = 0;
        this.time = 0;
        this.frames = 0;
        this.old = performance.now();
        this.element = document.getElementById(elementId);
    }

    update() {
        // update fps counter once a second
        var now = performance.now();
        this.frames++;
        this.time += now - this.old;
        this.old = now;

        if (this.frames >= 60) {
            this.fps = 1000 / (this.time / this.frames);
            this.time = 0;
            this.frames = 0;
            if (this.element) {
                this.element.textContent = this.fps.toFixed(1) + ' FPS';
            }
        }
    }
}
