// Import everything, make them accessible in console (and in chrome extensions, without importmap, without build step)
// linter: ngspicejs-lint --browser
// global:
"use strict";

var SC = globalThis.SC || {};
globalThis.SC = SC;

// THREE
import * as THREE from '../depend/three/three.module.js';
globalThis.THREE = THREE;
import { OBJLoader } from '../depend/three/OBJLoader.js';
globalThis.OBJLoader = OBJLoader;
import { MTLLoader } from '../depend/three/MTLLoader.js';
globalThis.MTLLoader = MTLLoader;
import { OrbitControls } from '../depend/three/OrbitControls.js';
globalThis.OrbitControls = OrbitControls;
import { TransformControls } from '../depend/three/TransformControls.js';
globalThis.TransformControls = TransformControls;
import { PointerLockControls } from '../depend/three/PointerLockControls.js';
globalThis.PointerLockControls = PointerLockControls;

// noir
import { toast } from './toast.js';
SC.toast = toast;
import { download } from './download.js';
SC.download = download;
import { fetchJSON } from './fetchJSON.js';
SC.fetchJSON = fetchJSON;
import { Undo } from './Undo.js';
SC.Undo = Undo;
import { randomItem } from './randomItem.js';
SC.randomItem = randomItem;
import { rad } from './rad.js';
SC.rad = rad;
import { elementsWithId } from './elementsWithId.js';
SC.elementsWithId = elementsWithId;
import { FpsCounter } from './FpsCounter.js';
SC.FpsCounter = FpsCounter;
import { worldPosition,leakCheck,uvTransform } from './utils.js';
SC.worldPosition = worldPosition;
SC.leakCheck = leakCheck;
SC.uvTransform = uvTransform;
import { Grid } from './Grid.js';
SC.Grid = Grid;
import { Models } from './Models.js';
SC.Models = Models;
import { Lamp } from './Lamp.js';
SC.Lamp = Lamp;
import { Lamps } from './Lamps.js';
SC.Lamps = Lamps;
import { Road } from './Road.js';
SC.Road = Road;
import { Roads } from './Roads.js';
SC.Roads = Roads;
import { House } from './House.js';
SC.House = House;
import { Houses } from './Houses.js';
SC.Houses = Houses;
import { collisions } from './collisions.js';
SC.collisions = collisions;
import { Specs } from './Specs.js';
SC.Specs = Specs;
import { MiniMap } from './MiniMap.js';
SC.MiniMap = MiniMap;
import { Wasd } from './Wasd.js';
SC.Wasd = Wasd;
import { Editor } from './Editor.js';
SC.Editor = Editor;
import { Footsteps } from './Footsteps.js';
SC.Footsteps = Footsteps;
import { TouchControls } from './TouchControls.js?v=22';
SC.TouchControls = TouchControls;
import { World } from './World.js';
SC.World = World;
import { chooseFiles } from './chooseFiles.js';
SC.chooseFiles = chooseFiles;
import { choose } from './choose.js';
SC.choose = choose;

