// Single house (shop + floors + roof + sides)
// linter: ngspicejs-lint --browser
// global: THREE, SC
"use strict";

export class House {
    // Single house (shop + floors + roof + sides)

    constructor ({x = 0, z = 0, rotation = 0, shop = 1, floors = [1, 1], roof = 0, leftAd = 0, rightAd = 0, fireEscape = false, signage = 0, alwaysVisible = false} = {}) {
        this.x = x;
        this.z = z;
        this.rotation = rotation; // 0,90,180,270
        this.shop = shop;  // see Specs.js for values
        this.floors = floors.slice();
        this.roof = roof;
        this.leftAd = leftAd;
        this.rightAd = rightAd;
        this.fireEscape = fireEscape;
        this.signage = signage;
        this.alwaysVisible = alwaysVisible;
        this.rebuild();
    }

    toJSON () {
        // serialize
        return {
            x: this.x,
            z: this.z,
            rotation: this.rotation,
            shop: this.shop,
            floors: this.floors.slice(),
            roof: this.roof,
            leftAd: this.leftAd,
            rightAd: this.rightAd,
            fireEscape: this.fireEscape,
            signage: this.signage
        };
    }

    center () {
        // return center of the house
        return this.object.position;
    }

    aabb () {
        // return simplified AABB of the house
        // for actual size use: new THREE.Box3().setFromObject(house.object);
        var p = this.object.position;
        var a = SC.grid.cellSize / 2;
        return new THREE.Box3(
            new THREE.Vector3(p.x - a, 0, p.z - a),
            new THREE.Vector3(p.x + a, this.height, p.z + a)
        );
    }

    setRotation (angleDeg) {
        // rotate entire house (0,90,180 or 270 deg), if undefined adds 90deg to current rotation
        if (angleDeg === undefined) {
            angleDeg = (this.rotation + 90) % 360;
        }
        this.rotation = angleDeg;
        this.object.rotation.y = THREE.MathUtils.degToRad(this.rotation);
    }

    toggleAds () {
        // cycle through all ads or turn it off, affects wall closer to the camera

        // first find which wall is closer to camera
        var l = SC.camera.position.distanceTo(SC.worldPosition(this.objects.leftWall));
        var r = SC.camera.position.distanceTo(SC.worldPosition(this.objects.rightWall));
        console.log('ads', this.leftAd, this.rightAd, l, r);

        function nextAd(old) { // noapi
            // cycle through ads on the side of the house
            var a = Object.keys(SC.Specs.sideAd);
            var i = a.indexOf(old);
            return i >= 0 ? a[i+1] : a[0];
        }
        if (l < r) {
            // left wall closer
            this.leftAd = nextAd(this.leftAd);
            this.rightAd = 0;
        } else {
            // right wall closer
            this.leftAd = 0;
            this.rightAd = nextAd(this.rightAd);
        }
        //console.log('ads', this.leftAd, this.rightAd);
        this.rebuild();
    }

    changeNumberOfFloors(n) {
        // change number of floors
        this.floors = [];
        for (var i = 1; i < n; i++) {
            this.floors.push(SC.randomItem(Object.keys(SC.Specs.floor)));
        }
        this.rebuild();
    }

    reuseOrCloneGeometryMaterial (object, spec, heighMultiplier) { // noapi
        // reuse geometry or clone it and uv it
        if (spec.geometry) {
            // reusing spec geometry
            object.children[0].geometry = spec.geometry;
        } else {
            // first use of this geometry, clone it now and apply uv
            spec.geometry = object.children[0].geometry.clone();
            if (spec.uvScaleY && (spec.uvScaleY !== 1)) {
                SC.uvTransform(spec.geometry, 1, spec.uvScaleY * (heighMultiplier || 1), 0, 0);
            }
            object.children[0].geometry = spec.geometry;
        }
        // reuse material or clone and darken it
        if (spec.material) {
            // reusing spec material
            object.children[0].material = spec.material;
        } else {
            // first use of this side so clone it now
            spec.material = object.children[0].material.clone();
            spec.material.color.set(spec.color, spec.color, spec.color);
            object.children[0].material = spec.material;
        }
    }

    rebuild () {
        // create all parts of the house and add them to scene
        if (this.object) {
            this.release();
        }
        var x = this.x * 10 + 5;
        var y = 0;
        var z = this.z * 10 + 5;
        var spec;
        this.object = new THREE.Object3D();
        this.object.position.set(x, y, z);
        this.setRotation(this.rotation);
        this.objects = {};

        // shop front
        this.objects.shop = SC.models.cache['shop/' + this.shop].group.clone();
        this.object.add(this.objects.shop);
        // shop back
        this.objects.shopBack = SC.models.cache['shop/' + this.shop].group.clone();
        this.objects.shopBack.rotation.y = Math.PI;
        this.object.add(this.objects.shopBack);

        // signage
        if (this.signage > 0) {
            // front
            this.objects.signage = SC.models.cache['prop/signage'].group.clone();
            this.objects.signage.children[0].geometry = this.objects.signage.children[0].geometry.clone();
            SC.uvTransform(this.objects.signage.children[0].geometry, 1, 1, (this.signage - 1) * 0.2,0);
            this.object.add(this.objects.signage);
            // back
            this.objects.signageBack = SC.models.cache['prop/signage'].group.clone();
            this.objects.signageBack.children[0].geometry = this.objects.signageBack.children[0].geometry.clone();
            this.objects.signageBack.rotation.y = Math.PI;
            SC.uvTransform(this.objects.signageBack.children[0].geometry, 1, 1, (this.signage - 1) * 0.2,0);
            this.object.add(this.objects.signageBack);
        }

        // shop side right
        spec = SC.Specs.shop[this.shop];
        this.objects.shopSideRight = SC.models.cache['side/' + spec.side].group.clone();
        this.reuseOrCloneGeometryMaterial(this.objects.shopSideRight, spec);//, this.floors.length + 1);
        //this.objects.shopRightSide.scale.y = this.floors.length + 1;
        this.object.add(this.objects.shopSideRight);

        // shop side left
        this.objects.shopSideLeft = SC.models.cache['side/' + spec.side].group.clone();
        this.reuseOrCloneGeometryMaterial(this.objects.shopSideLeft, spec);//, this.floors.length + 1);
        this.objects.shopSideLeft.rotation.y = Math.PI;
        //this.objects.shopRightSide.scale.y = this.floors.length + 1;
        this.object.add(this.objects.shopSideLeft);

        // left and right wall points (only used to find which wall is closer)
        this.objects.leftWall = new THREE.Object3D();
        this.objects.leftWall.position.x = -5;
        this.object.add(this.objects.leftWall);
        this.objects.rightWall = new THREE.Object3D();
        this.objects.rightWall.position.x = 5;
        this.object.add(this.objects.rightWall);

        // move to first floor
        y += 5;

        // right ad
        if (this.rightAd > 0) {
            spec = SC.Specs.sideAd[this.rightAd];
            this.objects.rightAd = SC.models.cache['side/' + this.rightAd].group.clone();
            this.objects.rightAd.position.set(0, y, 0);
            this.objects.rightAd.scale.y = this.floors.length;
            this.objects.rightAd.children[0].material.color.set(spec.color, spec.color, spec.color);
            this.object.add(this.objects.rightAd);
        }
        // left ad
        if (this.leftAd > 0) {
            spec = SC.Specs.sideAd[this.leftAd];
            this.objects.leftAd = SC.models.cache['side/' + this.leftAd].group.clone();
            this.objects.leftAd.position.set(0, y, 0);
            this.objects.leftAd.scale.y = this.floors.length;
            this.objects.leftAd.rotation.y = Math.PI;
            this.objects.leftAd.children[0].material.color.set(spec.color, spec.color, spec.color);
            this.object.add(this.objects.leftAd);
        }

        // floors (and their sides)
        this.objects.floorsFront = [];
        this.objects.floorsBack = [];
        this.objects.floorsFrontFireEscape = [];
        this.objects.floorsBackFireEscape = [];
        this.objects.floorsSideRight = [];
        this.objects.floorsSideLeft = [];
        this.floors.forEach((f) => {
            // floor front
            var o = SC.models.cache['floor/' + f].group.clone();
            o.position.set(0, y, 0);
            this.objects.floorsFront.push(o);
            this.object.add(o);
            // floor back
            o = SC.models.cache['floor/' + f].group.clone();
            o.position.set(0, y, 0);
            o.rotation.y = Math.PI;
            this.objects.floorsBack.push(o);
            this.object.add(o);
            // fire escape
            if (this.fireEscape) {
                // font
                o = SC.models.cache['prop/fire_escape'].group.clone();
                o.position.set(0, y, 0);
                this.objects.floorsFrontFireEscape.push(o);
                this.object.add(o);
                // back
                o = SC.models.cache['prop/fire_escape'].group.clone();
                o.position.set(0, y, 0);
                o.rotation.y = Math.PI;
                this.objects.floorsBackFireEscape.push(o);
                this.object.add(o);
            }
            // floor side right
            if (!this.rightAd) {
                spec = SC.Specs.floor[f];
                o = SC.models.cache['side/' + spec.side].group.clone();
                o.position.set(0, y, 0);
                this.reuseOrCloneGeometryMaterial(o, spec);
                this.objects.floorsSideRight.push(o);
                this.object.add(o);
            }
            // floor side left
            if (!this.leftAd) {
                spec = SC.Specs.floor[f];
                o = SC.models.cache['side/' + spec.side].group.clone();
                o.position.set(0, y, 0);
                o.rotation.y = Math.PI;
                this.reuseOrCloneGeometryMaterial(o, spec);
                this.objects.floorsSideLeft.push(o);
                this.object.add(o);
            }
            // next floor
            y += 5;
        });
        // roof
        this.objects.roof = SC.models.cache['roof/' + this.roof].group.clone();
        this.objects.roof.position.set(0, y, 0);
        this.object.add(this.objects.roof);
        // add to scene
        SC.scene.add(this.object);
        this.height = y + SC.Specs.roof[this.roof].height;
    }

    release () {
        // remove this house from scene and null object/objects
        if (!this.objects) {
            return;
        }
        this.objects.floorsBack.forEach((o) => o.removeFromParent());
        delete this.objects.floorsBack;
        this.objects.floorsFront.forEach((o) => o.removeFromParent());
        delete this.objects.floorsFront;
        this.objects.floorsBackFireEscape.forEach((o) => o.removeFromParent());
        delete this.objects.floorsBackFireEscape;
        this.objects.floorsFrontFireEscape.forEach((o) => o.removeFromParent());
        delete this.objects.floorsFrontFireEscape;
        this.objects.floorsSideLeft.forEach((o) => o.removeFromParent());
        delete this.objects.floorsSideLeft;
        this.objects.floorsSideRight.forEach((o) => o.removeFromParent());
        delete this.objects.floorsSideRight;
        this.objects.roof.removeFromParent();
        delete this.objects.roof;
        this.objects.shop.removeFromParent();
        delete this.objects.shop;
        this.objects.shopBack.removeFromParent();
        delete this.objects.shopBack;
        if (this.objects.signage) {
            this.objects.signage.removeFromParent();
            this.objects.signage.children[0].geometry.dispose();
            delete this.objects.signage;
        }
        if (this.objects.signageBack) {
            this.objects.signageBack.removeFromParent();
            this.objects.signageBack.children[0].geometry.dispose();
            delete this.objects.signageBack;
        }
        this.objects.shopSideLeft.removeFromParent();
        delete this.objects.shopSideLeft;
        this.objects.shopSideRight.removeFromParent();
        delete this.objects.shopSideRight;
        if (this.objects.leftAd) {
            this.objects.leftAd.removeFromParent();
            delete this.objects.leftAd;
        }
        if (this.objects.rightAd) {
            this.objects.rightAd.removeFromParent();
            delete this.objects.rightAd;
        }
        this.objects.leftWall.removeFromParent();
        delete this.objects.leftWall;
        this.objects.rightWall.removeFromParent();
        delete this.objects.rightWall;
        console.assert(Object.keys(this.objects).length === 0, 'Something stayed in house.objects unreleased');
        this.objects = null;
        this.object.removeFromParent();
        this.object = null;
    }
}
