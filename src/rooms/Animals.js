import * as THREE from 'three';
import ControllerMenu from '../lib/ControllerMenu';

var scene, doorMaterial, door, Fox;
var mixer;
var clock;
var animalScene;
var controllerMenu;
var menuInfo = {
      "name": "Animal Menu",
      "btnWidth": 0.075,
      "btnHeight": 0.075,
      "btnColor": 0xFFFF00,
      "btnSpacing": 0.1,
      "btnColumns": 2,
      "btnRows": 2,
      "animals": [
        {
          "name": "Fox",
          "btnTexture": "fox_btn_tex",
          "modelID": "animal_fox_model"
        },
        {
          "name": "Elephant",
          "btnTexture": "elephant_btn_tex",
          "modelID": "animal_elephant_model"
        },
        {
          "name": "Hippo",
          "btnTexture": "hippo_btn_tex",
          "modelID": "animal_hippo_model"
        },
        {
          "name": "Rhino",
          "btnTexture": "rhino_btn_tex",
          "modelID": "animal_rhino_model"
        },
        {
          "name": "Croc",
          "btnTexture": "croc_btn_tex",
          "modelID": "animal_croc_model"
        },
        {
          "name": "Bear",
          "btnTexture": "bear_btn_tex",
          "modelID": "animal_bear_model"
        },
        {
          "name": "Zebra",
          "btnImageURL": "zebra_btn_tex",
          "modelID": "animal_zebra_model"
        },
        {
          "name": "Rabbit",
          "btnTexture": "rabbit_btn_tex",
          "modelID": "animal_rabbit_model"
        },
        {
          "name": "Chicken",
          "btnTexture": "chicken_btn_tex",
          "modelID": "animal_chicken_model"
        }
      ]
    };

function createDoorMaterial(ctx) {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: {value: 0},
      selected: {value: 0},
      tex: {value: ctx.assets['doorfx_tex']}
    },
    vertexShader: ctx.shaders.basic_vert,
    fragmentShader: ctx.shaders.door_frag
  });
}

function getIndexFromName(btnName){
  for (var i = 0; i < menuInfo.animals.length; i++) {
    if(menuInfo.animals[i].name == btnName){
      console.log("FOUND: " + btnName);
      return i;
    } 
  }
}

function hideAllAnimals(){
  for (var i = 0; i < menuInfo.animals.length; i++) {
    if(menuInfo.animals[i].model != null){
      menuInfo.animals[i].model.visible = false;
    } 
  }
}

function attachControllerMenu(ctx, controllerData) {
    let controller = controllerData.controller;
    const assets = ctx.assets;

    controllerMenu = new ControllerMenu(ctx, menuInfo, menuInfo.animals, controller, (btnName) => {
      if(btnName != null){
        handleMenuClick(ctx, btnName);
      }

    });

    controllerMenu.enter();
}

function handleMenuClick(ctx, btnName){
  var anmlIndex = getIndexFromName(btnName);
  console.log("Controller click: " + menuInfo.animals[anmlIndex].modelID);

  showAnimal(anmlIndex, ctx);
}

function showAnimal(index, ctx){

  console.log("HELLO WORLD...");
  hideAllAnimals();

  var animalInfo = menuInfo.animals[index];
  if(animalInfo.model != null){
    animalInfo.model.visible = true;
  }else{
    var animalModel = ctx.assets[animalInfo.modelID];
    animalInfo.model = animalModel.scene;
    animalScene.add(animalInfo.model);
  }

  console.log("ANIMAL ANIMATION COUNT: " + animalModel.animations.length)
  if ( animalModel.animations.length > 0 ) {
      mixer = new THREE.AnimationMixer( animalInfo.model );
      for ( var i = 0; i < animalModel.animations.length; i ++ ) {
          var animation = animalModel.animations[ i ];
          mixer.clipAction( animation ).play();
      }
  }
  animalInfo.animations = animalModel.animations;
  menuInfo.animals[index] = animalInfo;
}

function animalAnimate(){
    console.log("animating.....");
}

export function setup(ctx) {
  console.log("LOADING ANIMALS...");
  const assets = ctx.assets;
  scene = assets['pg_object_model'].scene;
  scene.rotation.y = -Math.PI / 2;
  this.renderer = ctx.renderer;
  clock = new THREE.Clock();
  animalScene = new THREE.Group();
  scene.add(animalScene);
  //Fox = assets['animal_bear_model'].scene;
  //animalScene.add(Fox);

  var angel = scene.getObjectByName('object')
  angel.material = new THREE.MeshBasicMaterial({map: assets['pg_object_tex']});
  angel.visible = false;
  scene.getObjectByName('floor').material =
    new THREE.MeshBasicMaterial({map: assets['pg_floor_tex'], lightMap: assets['pg_floor_lm_tex']});
  scene.getObjectByName('bg').material =
    new THREE.MeshBasicMaterial({map: assets['pg_bg_tex']});
  scene.getObjectByName('flare').material =
    new THREE.MeshBasicMaterial({map: assets['pg_flare_tex'], blending: THREE.AdditiveBlending});
  scene.getObjectByName('panel').material =
    new THREE.MeshBasicMaterial({map: assets['pg_panel_tex']});
  scene.getObjectByName('door_frame').material =
    new THREE.MeshBasicMaterial({map: assets['pg_door_lm_tex']});

  doorMaterial = createDoorMaterial(ctx);
  door = scene.getObjectByName('door');
  door.material = doorMaterial;

  scene.getObjectByName('teleport').visible = false;

  ctx.raycontrol.addEventListener('controllerConnected', controllerData => {
    if (ctx.raycontrol.matchController(controllerData, "primary")) {
      console.log("Primary button down");
    }else{
      attachControllerMenu(ctx, controllerData);
    }
  });

  ctx.raycontrol.addState('doorAnimals', {
    colliderMesh: scene.getObjectByName('door'),
    onHover: (intersection, active) => {
      //teleport.onHover(intersection.point, active);
      const scale = intersection.object.scale;
      scale.z = Math.min(scale.z + 0.05 * (2 - door.scale.z), 1.5);
    },
    onHoverLeave: () => {
      //teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.goto = 0;
      //teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      //teleport.onSelectEnd(intersection.point);
    }
  });

  let teleport = scene.getObjectByName('teleport');
  teleport.visible = true;
  teleport.material.visible = false;
  ctx.raycontrol.addState('teleportAnimals', {
    colliderMesh: teleport,
    onHover: (intersection, active) => {
      ctx.teleport.onHover(intersection.point, active);
    },
    onHoverLeave: () => {
      ctx.teleport.onHoverLeave();
    },
    onSelectStart: (intersection, e) => {
      ctx.teleport.onSelectStart(e);
    },
    onSelectEnd: (intersection) => {
      ctx.teleport.onSelectEnd(intersection.point);
    }
  });

  var animate = function() {
      requestAnimationFrame( animate );
      
      var delta = clock.getDelta();
      if ( mixer !== undefined ) {
          mixer.update( delta );
          console.log("ANIMATING>>>>>>>");
      }
  }
  animate();
}

export function enter(ctx) {
  ctx.renderer.setClearColor(0x000000);
  ctx.scene.add(scene);
  ctx.raycontrol.activateState('doorAnimals');
  ctx.raycontrol.activateState('teleportAnimals');
}

export function exit(ctx) {
  ctx.raycontrol.deactivateState('doorAnimals');
  ctx.raycontrol.deactivateState('teleportAnimals');

  ctx.scene.remove(scene);
}

export function execute(ctx, delta, time) {
  doorMaterial.uniforms.time.value = time;

  if (door.scale.z > 0.5) {
    door.scale.z = Math.max(door.scale.z - delta * door.scale.z, 0.5);
  }
}