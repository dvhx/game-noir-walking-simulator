// Scene editor (adding roads, houses, props, lamps)
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class Editor {
    // Scene editor for adding roads, houses, props, lamps

    constructor () {
        this.enabled = false;
        this.clipping = false;
        this.mode = 'road'; // house, road, lamp
        this.onClick = this.onClick.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        document.addEventListener('click', this.onClick);
        document.addEventListener('keydown', this.onKeyDown);
    }

    onClick (event) { // noapi
        // handle click events
        if (event.target.nodeName !== 'CANVAS' || !this.enabled) {
            return;
        }
        // house
        if (this.mode === 'house' && SC.grid.cursor) {
            SC.undo.push();
            SC.houses.addXZ(SC.grid.cursor.x, SC.grid.cursor.z);
        }
        // road
        if (this.mode === 'road' && SC.grid.cursor) {
            SC.undo.push();
            SC.roads.addXZ(SC.grid.cursor.x, SC.grid.cursor.z);
        }
        // lamp
        if (this.mode === 'lamp' && SC.grid.cursorFloat) {
            SC.undo.push();
            SC.lamps.addXZ(SC.grid.cursorFloat.x, SC.grid.cursorFloat.z);
        }
    }

    onKeyDown (event) { // noapi
        // handle key events
        //console.log('editor', event.code, this);
        if (!this.enabled && event.code !== 'KeyE') {
            return;
        }
        var h;
        switch (event.code) {
        // save
        case 'F2':
            SC.World.save(SC.miniMap.name);
            SC.toast('Saved!');
            break;
        // export/import
        case 'F3':
            event.preventDefault();
            SC.World.export(SC.miniMap.name);
            SC.toast('Exported export.nws!');
            break;
        case 'F4':
            SC.World.import();
            break;
        // floors
        case 'Digit1':
            h = SC.houses.select();
            h.changeNumberOfFloors(1);
            break;
        case 'Digit2':
            h = SC.houses.select();
            h.changeNumberOfFloors(2);
            break;
        case 'Digit3':
            h = SC.houses.select();
            h.changeNumberOfFloors(3);
            break;
        case 'Digit4':
            h = SC.houses.select();
            h.changeNumberOfFloors(4);
            break;
        case 'Digit5':
            h = SC.houses.select();
            h.changeNumberOfFloors(5);
            break;
        // editor on/off
        case 'KeyE':
            this.enabled = !this.enabled;
            SC.grid.indicator.visible = this.enabled;
            SC.toast(this.enabled ? 'Editor enabled' : 'Editor disabled');
            SC.e.crosshair.style.background = this.enabled ? 'yellow' : 'transparent';
            break;
        // clipping on/off
        case 'KeyC':
            this.clipping = !this.clipping;
            SC.toast(this.clipping ? 'Clipping enabled' : 'Clipping disabled');
            break;
        // toggle alwaysVisible
        case 'KeyB':
            h = SC.houses.select();
            if (h) {
                h.alwaysVisible = !h.alwaysVisible;
                SC.houses.updateCamPos = null;
                SC.toast(h.alwaysVisible ? 'Always visible' : 'Distant hidden');
            }
            break;
        // changing mode
        case 'KeyH':
            this.mode = 'house';
            SC.toast('Click on ground to add/remove house');
            break;
        case 'KeyR':
            if (!event.ctrlKey) {
                this.mode = 'road';
                SC.toast('Click on ground to add/remove road');
            }
            break;
        case 'KeyL':
            this.mode = 'lamp';
            SC.toast('Click on sidewalk to add/remove lamp');
            break;
        // rotate house
        case 'KeyO':
            h = SC.houses.select();
            if (h) {
                SC.undo.push();
                h.setRotation();
            } else {
                SC.toast('Point at house you want to rotate');
            }
            break;
        // ads
        case 'KeyV':
            h = SC.houses.select();
            if (h) {
                SC.undo.push();
                h.toggleAds();
            } else {
                SC.toast('Point at the side of the house to cycle through ads');
            }
            break;
        // fire escape
        case 'KeyF':
            h = SC.houses.select();
            if (h) {
                SC.undo.push();
                h.fireEscape = !h.fireEscape;
                h.rebuild();
            } else {
                SC.toast('Point at the house to toggle fire escape');
            }
            break;
        // signage
        case 'KeyG':
            h = SC.houses.select();
            if (h) {
                SC.undo.push();
                h.signage = (h.signage + 1) % 5;
                h.rebuild();
            } else {
                SC.toast('Point at the house to cycle through signage');
            }
            break;
        // undo
        case 'KeyZ':
            if (event.ctrlKey) {
                SC.undo.pop();
            }
            break;
        }
    }
}
