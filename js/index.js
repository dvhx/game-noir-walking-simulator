// Initialize scene, camera, renderer, controls, lights, ground, grid
// linter: ngspicejs-lint --browser
// global: THREE, PointerLockControls
"use strict";

var SC = globalThis.SC || {};

SC.frame = 0;
SC.animate = function (timestamp) {
    // main animation loop
    SC.frame++;
    window.requestAnimationFrame(SC.animate);
    SC.fpsCounter.update();
    SC.wasd.update(timestamp);
    SC.controls.update();
    SC.collisions();
    if (SC.frame % 13 === 0) {
        SC.roads.update();
    }
    if (SC.frame % 11 === 0) {
        SC.houses.update();
    }
    SC.lamps.update();
    SC.renderer.render(SC.scene, SC.camera);
    SC.footsteps.update();
};

window.addEventListener('DOMContentLoaded', function () {
    // initialize everything
    SC.e = SC.elementsWithId();
    // scene
    SC.scene = new THREE.Scene();
    SC.scene.background = new THREE.Color(0x222222); // 0x1a1a2e
    SC.scene.fog = new THREE.Fog(0x000000, 3, 100);
    SC.panorama = new THREE.TextureLoader().load('image/panorama.jpg');
    SC.panorama.mapping = THREE.EquirectangularReflectionMapping;
    SC.panorama.colorSpace = THREE.SRGBColorSpace;
    SC.scene.background = SC.panorama;
    // axis helper
    /*
    SC.axisHelper = new THREE.AxesHelper(100);
    SC.axisHelper.setColors(0xff0000, 0x00ff00, 0x0000ff);
    SC.axisHelper.position.y = 0.05;
    SC.scene.add(SC.axisHelper);
    */
    // camera
    SC.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    SC.camera.position.set(10, 1.7, 10);
    SC.camera.lookAt(0, 0, 0);
    // renderer
    SC.renderer = new THREE.WebGLRenderer({antialias: true});
    SC.renderer.setSize(window.innerWidth, window.innerHeight);
    SC.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    SC.renderer.shadowMap.enabled = true;
    SC.renderer.shadowMap.type = THREE.PCFShadowMap;
    document.body.appendChild(SC.renderer.domElement);
    // lights
    SC.light = {};
    // ambient light
    SC.light.ambient = new THREE.AmbientLight(0xffffff, 2.0);
    SC.scene.add(SC.light.ambient);
    // directional light
    SC.light.dir = new THREE.DirectionalLight(0xffffff, 3.0);
    SC.light.dir.position.set(10, 20, 10);
    SC.light.dir.castShadow = true;
    SC.light.dir.shadow.mapSize.width = 2048;
    SC.light.dir.shadow.mapSize.height = 2048;
    SC.light.dir.shadow.camera.near = 0.5;
    SC.light.dir.shadow.camera.far = 50;
    SC.light.dir.shadow.camera.left = -15;
    SC.light.dir.shadow.camera.right = 15;
    SC.light.dir.shadow.camera.top = 15;
    SC.light.dir.shadow.camera.bottom = -15;
    SC.scene.add(SC.light.dir);
    // ground grid and cursor
    SC.grid = new SC.Grid();
    // fps counter
    SC.fpsCounter = new SC.FpsCounter('fps');
    // minimap
    SC.miniMap = new SC.MiniMap(SC.e.minimap, 200);
    window.setInterval(() => SC.miniMap.render(), 300);
    // wasd
    SC.wasd = new SC.Wasd();
    // pointer lock controls
    SC.plControls = new PointerLockControls(SC.camera, SC.renderer.domElement);
    // touch controls
    SC.touchControls = new SC.TouchControls(SC.camera);
    if (SC.touchControls.isTouch) {
        SC.controls = SC.touchControls;
    } else {
        SC.controls = SC.plControls;
        SC.toast('Click anywhere to lock pointer');
    }
    SC.e.fps.onclick = function () {
        // this allows changing maps on mobile that has no controls
        SC.choose(['Empty map', 'Small city', 'Large city', 'MiniMap']).then((s) => {
            switch (s) {
            case 'Empty map':
                SC.World.fetch('./map/empty.nws', SC.World.save);
                break;
            case 'Small city':
                SC.World.fetch('./map/small.nws', SC.World.save);
                break;
            case 'Large city':
                SC.World.fetch('./map/large.nws', SC.World.save);
                break;
            case 'MiniMap':
                SC.miniMap.toggle();
                break;
            }
        });
    }
    // editor
    SC.editor = new SC.Editor();
    // footsteps sounds
    SC.footsteps = new SC.Footsteps();
    // convert model specs to paths of all models
    var paths =
        ['road/road', 'road/cross', 'road/curve', 'road/tee', 'road/end']
        .concat(Object.keys(SC.Specs.side).map((k) => 'side/' + k))
        .concat(Object.keys(SC.Specs.sideAd).map((k) => 'side/' + k))
        .concat(Object.keys(SC.Specs.shop).map((k) => 'shop/' + k))
        .concat(Object.keys(SC.Specs.floor).map((k) => 'floor/' + k))
        .concat(Object.keys(SC.Specs.roof).map((k) => 'roof/' + k))
        .concat(Object.keys(SC.Specs.prop).map((k) => 'prop/' + k));
    // load all objects
    var t1 = Date.now();
    SC.models = new SC.Models();
    SC.models.load(paths, function () {
        // load everything from local storage
        console.log(Object.keys(SC.models.cache).length + ' OBJs loaded in ' + ((Date.now() - t1)/1000).toFixed(1) + 's');
        // roads
        SC.roads = new SC.Roads();
        // houses
        SC.houses = new SC.Houses();
        // lamps
        SC.lamps = new SC.Lamps();
        // undo
        SC.undo = new SC.Undo([SC.roads, SC.houses, SC.lamps], 10);

        function finish() { // noapi
            // finish loading world
            // minimap
            SC.miniMap.render();
            // custom code goes here

            // start main animation loop
            SC.animate();
            console.log('game started in ' + ((Date.now() - t1)/1000).toFixed(1) + 's');
        }

        // handle first run
        if (localStorage.getItem('installed')) {
            SC.World.load('default');
            finish();
        } else {
            SC.World.fetch('./map/small.nws', function () { // noapi
                // mark default world as loaded
                SC.World.save('default');
                localStorage.setItem('installed', 'true');
                console.log('installed');
                finish();
            });
        }
    });

    // sliders for tuning lights
    SC.e.tune_lighths_amb.oninput = (e) => SC.light.ambient.intensity = e.target.value;
    SC.e.tune_lighths_dir.oninput = (e) => SC.light.dir.intensity = e.target.value;

    window.addEventListener('resize', () => {
        // handle screen resize
        SC.camera.aspect = window.innerWidth / window.innerHeight;
        SC.camera.updateProjectionMatrix();
        SC.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('beforeunload', () => {
        // autosave camera position
        // SC.storage.setObject('camera.position', SC.camera.position);
        // SC.storage.setObject('camera.rotation', SC.camera.rotation);
    });
});

