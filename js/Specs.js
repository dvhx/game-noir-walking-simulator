// Various extra informations of models (for combining them correctly)
// linter: ngspicejs-lint --browser
// global:
"use strict";

export const Specs = Object.freeze({
    // Sides (used both for shops and  floors)
    side: {
        1: {},
        2: {},
        3: {},
    },
    // side ads
    sideAd: {
        4: {color: 0.3},
        5: {color: 0.3},
        6: {color: 0.3},
        7: {color: 0.3},
    },
    // shop sides (10 different shop sides can be made using only 2 textures and different scaling and brightness)
    shop: {
        1: {side: 1, uvScaleY: 0.9, color: 0.8},
        2: {side: 1, uvScaleY: 1.0, color: 0.8},
        3: {side: 1, uvScaleY: 1.1, color: 1.2},
        4: {side: 2, uvScaleY: 2.5, color: 0.7},
        5: {side: 2, uvScaleY: 4.0, color: 0.15},
        6: {side: 2, uvScaleY: 2.5, color: 0.4},
        7: {side: 2, uvScaleY: 4.0, color: 0.4},
        8: {side: 2, uvScaleY: 7.5, color: 0.2},
        9: {side: 1, uvScaleY: 1.0, color: 0.9},
        10:{side: 2, uvScaleY: 4.2, color: 0.7},
    },
    // floor sides (16 floors need only 1 extra texture)
    floor: {
        1: {side: 3, uvScaleY: 3.20, color: 1.0},
        2: {side: 1, uvScaleY: 0.70, color: 1.0},
        3: {side: 1, uvScaleY: 0.58, color: 1.7},
        4: {side: 2, uvScaleY: 2.15, color: 0.7},
        5: {side: 3, uvScaleY: 0.35, color: 0.8},
        6: {side: 1, uvScaleY: 0.65, color: 1.0},
        7: {side: 1, uvScaleY: 0.55, color: 1.0},
        8: {side: 1, uvScaleY: 0.55, color: 0.6},
        9: {side: 1, uvScaleY: 0.70, color: 0.6},
        10:{side: 1, uvScaleY: 0.80, color: 0.8},
        11:{side: 1, uvScaleY: 0.45, color: 0.6},
        12:{side: 2, uvScaleY: 2.60, color: 0.7},
        13:{side: 3, uvScaleY: 0.35, color: 0.8},
        14:{side: 1, uvScaleY: 0.60, color: 0.7},
        15:{side: 1, uvScaleY: 0.60, color: 0.5},
        16:{side: 1, uvScaleY: 0.60, color: 0.7},
    },
    // roof heights
    roof: {
        1: {height: 0},
        2: {height: 0.5},
        3: {height: 1.0},
        4: {height: 2.39},
    },
    // props
    prop: {
        "fire_escape": {},
        "signage": {},
        "lamp": {}
    }
});

