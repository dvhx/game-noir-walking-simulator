// Touch controls for mobile phones
// linter: ngspicejs-lint --browser
// global: THREE, screen, SC
"use strict";

export class TouchControls {
    constructor (camera) {
        this.isTouch = 'ontouchstart' in window || window.navigator.maxTouchPoints > 0;
        if (!this.isTouch) {
            return;
        }
        SC.e.fullscreen.onclick = (e) => this.toggleFullscreen(e);
        SC.e.fullscreen.style.display = 'block';
        SC.e.touchhelp.classList.add('show');
        SC.e.touchhelp.classList.add('fade');
        this.camera = camera;
        this.moveSpeed = 0.1;
        this.lookSensitivity = 0.0055;
        this.maxJoystickRadius = 50;
        this.element = document.body;
        // movement state (left half)
        this.leftTouchId = null;
        this.leftStart = new THREE.Vector2();
        this.moveVector = new THREE.Vector2();
        // look state (right half)
        this.rightTouchId = null;
        this.lastRightPos = new THREE.Vector2();
        this.yaw = this.camera.rotation.y;
        this.pitch = this.camera.rotation.x;
        // events
        this.element.style.touchAction = 'none';
        this.element.addEventListener('touchstart', (e) => this._onTouchStart(e), false);
        this.element.addEventListener('touchmove', (e) => this._onTouchMove(e), false);
        this.element.addEventListener('touchend', (e) => this._onTouchEnd(e), false);
        this.element.addEventListener('touchcancel', (e) => this._onTouchEnd(e), false);
    }

    toggleFullscreen() {
        // request fullscreen then landscape
        var isFullscreen = !!document.fullscreenElement;
        var isLandscape = window.innerHeight < window.innerWidth;
        if (isFullscreen || isLandscape) {
            document.exitFullscreen();
            screen.orientation.unlock();
            // i have exhausted non-nuclear options to fix chrome's return from fullscreen
            //window.setTimeout(() => document.location.reload(), 2000);
            return;
        }
        document.documentElement.requestFullscreen().then(() => {
            return screen.orientation.lock('landscape');
        }).then(() => {
            console.log('Orientation locked to landscape');
        }).catch((err) => {
            console.error('Lock failed:', err);
        });

    }

    _onTouchStart(e) {
        // touch started
        var halfWidth = window.innerWidth / 2;
        for (var touch of e.changedTouches) {
            // movement
            if (touch.clientX < halfWidth && this.leftTouchId === null) {
                this.leftTouchId = touch.identifier;
                this.leftStart.set(touch.clientX, touch.clientY);
                this.moveVector.set(0, 0);
            } else if (touch.clientX >= halfWidth && this.rightTouchId === null) {
                // look
                this.rightTouchId = touch.identifier;
                this.lastRightPos.set(touch.clientX, touch.clientY);
            }
        }
    }

    _onTouchMove(e) {
        // touch continue
        e.preventDefault();
        for (var touch of e.changedTouches) {
            // movement
            var dx, dy;
            if (touch.identifier === this.leftTouchId) {
                dx = touch.clientX - this.leftStart.x;
                dy = touch.clientY - this.leftStart.y;
                this.moveVector.x = Math.max(-1, Math.min(1, dx / this.maxJoystickRadius));
                this.moveVector.y = Math.max(-1, Math.min(1, dy / this.maxJoystickRadius));
            }
            // look
            if (touch.identifier === this.rightTouchId) {
                dx = touch.clientX - this.lastRightPos.x;
                dy = touch.clientY - this.lastRightPos.y;
                this.yaw -= dx * this.lookSensitivity;
                this.pitch -= dy * this.lookSensitivity;
                var maxPitch = Math.PI / 2 - 0.05;
                this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
                this.lastRightPos.set(touch.clientX, touch.clientY);
            }
        }
    }

    _onTouchEnd(e) {
        // touch end
        for (var touch of e.changedTouches) {
            // movement
            if (touch.identifier === this.leftTouchId) {
                this.leftTouchId = null;
                this.moveVector.set(0, 0);
            }
            // look
            if (touch.identifier === this.rightTouchId) {
                this.rightTouchId = null;
            }
        }
    }

    update() {
        // update rotation and movement of camera
        this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
        if (this.moveVector.x !== 0 || this.moveVector.y !== 0) {
            var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
            var right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
            forward.y = 0;
            forward.normalize();
            right.y = 0;
            right.normalize();
            this.camera.position.addScaledVector(forward, -this.moveVector.y * this.moveSpeed);
            this.camera.position.addScaledVector(right, this.moveVector.x * this.moveSpeed);
        }
    }
}
