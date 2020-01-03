class CameraMovement {
    constructor(camera, controls, orbitRadius, position0, camPositions) {
        this.camera = camera;
        this.controls = controls;
        this.position0 = position0;
        this.CAMERA_POSITIONS = camPositions;
        this.orbitRadius = orbitRadius;
    }
    
    moveBackToOrbit() {
        let camPos = this.camera.position;

        let v = new THREE.Vector2(camPos.x, camPos.y).normalize();
        v.multiplyScalar(this.orbitRadius);
        let v3 = new THREE.Vector3(v.x, v.y, camPos.z);

        new TWEEN.Tween(camPos)
            .to({
                x: v3.x,
                y: v3.y,
                z: v3.z,
            }, 1000)
            .onUpdate(() => {
                // camPos.set(temp.posx, temp.posy, temp.posz);
                // camRot.set(temp.rotx, temp.roty, temp.rotz);
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    rotateAroundOrbit() {
        let orbitRadius = this.orbitRadius;
        let cam = this.camera;
        let camPos = this.camera.position;
        
        //get current phi and z
        let currentPhi = Math.atan2(this.camera.position.y, this.camera.position.x);
        let object = { phi: currentPhi };

        //get desired phi
        let desiredPhi = -currentPhi;

        new TWEEN.Tween(object)
            .to({
                phi: desiredPhi, 
            }, 1000)
            .onUpdate(() => {
                camPos.x = orbitRadius * Math.cos(object.phi);
                camPos.y = orbitRadius * Math.sin(object.phi);
                cam.lookAt(0, 0, camPos.z);
            })
            .onComplete(() => {
                //todo - controls target reset
                // that.moveTo(pp);
            })
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    moveBackToPosition0(callback) {
        let camPos = this.camera.position;
        let pos = this.position0;

        new TWEEN.Tween(camPos)
            .to(pos, 1000) 
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(function () {
                //todo - controls target reset
                if (callback) callback();
            })
            .start();
    }

    moveTo(pos, moveBack) {
        let controls = this.controls;
        let camPos = this.camera.position;

        let movement = function() {
            new TWEEN.Tween(camPos)
                .to(pos, 1000) 
                .easing(TWEEN.Easing.Quadratic.Out)
                .onStart(function() {
                    console.log("tween started");
                })
                .onComplete(function () {
                    // controls.target = pos;
                    console.log("tween finished");
                    //todo - set controls target
                })
                .start();
        }

        if (camPos.distanceTo(this.position0) > 200 && moveBack)
            this.moveBackToPosition0(movement); //todo promise
        else
            movement();

    }

    moveToPos(x, y) {
        console.log(x, y, this.CAMERA_POSITIONS[y - 1][x - 1]);
        let pos = new THREE.Vector3(500, 0, 0).add(this.CAMERA_POSITIONS[y - 1][x - 1]);
        this.moveTo(pos)
    }
}