import * as THREE from 'three';

export default class ControllerMenu {
  constructor(ctx, menuInfo, menuBtns, controller, onSelectionMade) {
    this.ctx = ctx;
    this.radius = 0.1;
    this.hsv = { h: 0.0, s: 0.0, v: 1.0 };
    this.rgb = {r: 0, g: 0, b: 0};
    this.onSelectionMade = onSelectionMade;

    const assets = ctx.assets;

//CREATE UI HOLDER
    this.ui = new THREE.Group();

    if(menuBtns.length > 0){
      const btnGeo = new THREE.PlaneBufferGeometry( menuInfo.btnWidth, menuInfo.btnHeight, 32 );
      let btnMat = new THREE.MeshBasicMaterial( {color: menuInfo.btnColor, side: THREE.DoubleSide} );
      this.btnPrefab = new THREE.Mesh( btnGeo, btnMat );
      this.btnPrefab.rotation.z = 3.14;

      let rowCount = 0;
      let colCount = 0;
      var matTextureLoader = new THREE.TextureLoader();
      
      for (var i = 0; i < menuBtns.length; i++) {
        //console.log("ABOUT TO CREATE: " + menuBtns[i].name);
        var rowPos = rowCount*menuInfo.btnSpacing;
        var colPos = colCount*menuInfo.btnSpacing;
        var newBtn = this.btnPrefab.clone();
        newBtn.name = menuBtns[i].name;
        console.log("BTN TEX: " + menuBtns[i].btnTexture);
        newBtn.material = new THREE.MeshBasicMaterial({map: assets[menuBtns[i].btnTexture]});
        newBtn.position.set(colPos,rowPos,0);
        //console.log("CREATING BTN: " + menuBtns[i].name + ", x:" +colPos+ ", y:" + rowPos);
        this.ui.add(newBtn);

        if(colCount < menuInfo.btnColumns){
          colCount++;
        }else{
          colCount = 0;
          rowCount++
        }
      }
    }

    var geometryRing = new THREE.RingGeometry( 0.005, 0.01, 32 );
    var materialRing = new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } );
    this.colorSelector = new THREE.Mesh( geometryRing, materialRing );
    this.colorSelector.position.z = 0.01;
    this.colorSelector.name = 'colorSelector';
    this.ui.add(this.colorSelector);

    this.ui.name = 'controllermenu';
    //this.ui.visible = false;
    //this.ui.rotation.x = -Math.PI / 3;
    this.ui.position.y = 0.1;

    controller.add(this.ui);

    ctx.raycontrol.addState('controllermenu', {
      colliderMesh: this.ui,
      order: -1,
      onHover: (intersection, active, controller) => {
        if (active) {
          var point = intersection.point.clone();
          this.ui.worldToLocal(point);
  
          this.colorSelector.position.x = point.x;
          this.colorSelector.position.y = point.y;
        }
      },
      onHoverLeave: (intersection) => {
      },
      onSelectStart: (intersection, controller) => {
        if(intersection.object.name != null){
          //console.log("intersection.object.name: " + intersection.object.name);
          var btnname = intersection.object.name;
          this.onSelectionMade(btnname);
        }
      },
      onSelectEnd: (intersection) => {
      }
    });
  }

  updateColor () {
    this.rgb = hsv2rgb(this.hsv);
    this.colorSelector.material.color.setRGB(this.rgb.r / 255, this.rgb.g / 255, this.rgb.b / 255);
    this.onSelectionMade(this.rgb);
  }

  enter() {
    this.ctx.raycontrol.activateState('controllermenu');
  }

  exit() {
    this.ctx.raycontrol.deactivateState('controllermenu');
  }
}
