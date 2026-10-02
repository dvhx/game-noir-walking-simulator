// WASD movement, shift slow, space jump
// linter: ngspicejs-lint --browser
// global: THREE, PointerLockControls, SC
"use strict";

export class Wasd {
    // WASD movement, shift slow, space jump

    constructor ({walkSpeed = 10.0, shiftMultiplier = 0.3, cameraHeight = 1.7, gravity = 9.81, jumpForce = 4} = {}) {
        this.walkSpeed = walkSpeed;
        this.shiftMultiplier = shiftMultiplier;
        this.cameraHeight = cameraHeight;
        this.cameraHeightOriginal = cameraHeight;
        this.gravity = gravity;
        this.jumpForce = jumpForce;
        this.state = {
            time: 0,
            forward: false,
            backward: false,
            left: false,
            right: false,
            shift: false,
            jumping: false,
            verticalVelocity: 0
        };

        document.addEventListener('click', (event) => {
            // engage pointer lock on click
            if (event.target.nodeName === 'CANVAS') {
                if (SC.controls instanceof PointerLockControls) {
                    if (!SC.controls.isLocked) {
                        SC.controls.lock();
                        return;
                    }
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            // track pressed keys
            //console.log(event.code);
            switch (event.code) {
            // help
            case 'F1':
                event.preventDefault();
                if (SC.e.help.open) {
                    SC.e.help.close();
                } else {
                    SC.e.help.showModal();
                }
                break;
            // camera up/down
            case 'PageUp':
                this.cameraHeight++;
                break;
            case 'PageDown':
                this.cameraHeight--;
                if (this.cameraHeight < this.cameraHeightOriginal) {
                    this.cameraHeight = this.cameraHeightOriginal;
                }
                break;
            // wasd walking
            case 'KeyW':
                this.state.forward = true;
                break;
            case 'KeyS':
                if (event.ctrlKey) {
                    event.preventDefault();
                    SC.renderer.render(SC.scene, SC.camera);
                    var dataURL = SC.renderer.domElement.toDataURL('image/png');
                    var link = document.createElement('a');
                    link.download = 'nws-screenshot-' + (new Date()).toTimeString().substr(0,9).replace(/:/g,'-') + '.png';
                    link.href = dataURL;
                    link.click();
                    break;
                }
                this.state.backward = true;
                break;
            case 'KeyA':
                this.state.left = true;
                break;
            case 'KeyD':
                this.state.right = true;
                break;
            // map
            case 'KeyM':
                SC.miniMap.toggle();
                break;
            // load other maps
            case 'KeyN':
                SC.e.fps.onclick();
                break;
            // jumping
            case 'Space':
                if (!this.state.jumping) {
                    this.state.verticalVelocity = this.jumpForce;
                    this.state.jumping = true;
                }
                break;
            // slow walking
            case 'ShiftLeft':
            case 'ShiftRight':
                this.state.shift = true;
                break;
            }
        });

        document.addEventListener('keyup', (event) => {
            // track released keys
            switch (event.code) {
            case 'KeyW':
                this.state.forward = false;
                break;
            case 'KeyS':
                this.state.backward = false;
                break;
            case 'KeyA':
                this.state.left = false;
                break;
            case 'KeyD':
                this.state.right = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.state.shift = false;
                break;
            }
        });
    }

    update (timestamp) {
        // main update
        // find dt
        if (!timestamp) {
            return;
        }
        if (!this.state.time) {
            this.state.time = timestamp;
        }
        var dt = Math.min(60, (timestamp - this.state.time) / 1000);
        this.state.time = timestamp;
        if (dt <= 0) {
            return;
        }

        // gravity
        this.state.verticalVelocity -= this.gravity * dt;
        SC.camera.position.y += this.state.verticalVelocity * dt;

        // ground
        if (SC.camera.position.y < this.cameraHeight) {
            SC.camera.position.y = this.cameraHeight;
            this.state.verticalVelocity = 0;
            this.state.jumping = false;
        }

        // forward vector
        var forward = new THREE.Vector3(0, 0, -1).applyQuaternion(SC.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        // right vector
        var right = new THREE.Vector3(1, 0, 0).applyQuaternion(SC.camera.quaternion);
        right.y = 0;
        right.normalize();

        // move
        var currentSpeed = this.walkSpeed * (this.state.shift ? this.shiftMultiplier : 1.0) * dt;
        var moveDelta = new THREE.Vector3(0, 0, 0);
        if (this.state.forward) moveDelta.add(forward);
        if (this.state.backward) moveDelta.sub(forward);
        if (this.state.right) moveDelta.add(right);
        if (this.state.left) moveDelta.sub(right);
        if (moveDelta.length() > 0) {
            moveDelta.normalize().multiplyScalar(currentSpeed);
            SC.camera.position.x += moveDelta.x;
            SC.camera.position.z += moveDelta.z;
        }
    }
}
