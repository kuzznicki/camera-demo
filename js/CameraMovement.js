class CameraMovement {
    constructor(camera, controls, orbit, camPositions) {
        this.camera = camera;
        this.controls = controls;
        this.orbit = orbit;
        this.CAMERA_POSITIONS = camPositions;
    }
    
    moveOnCurve(curve, target) {
        let controls = this.controls;
        let cam = this.camera;
        let endTarget = target;

        let current = { 
            pos: 0, 
            x: controls.target.x,
            y: controls.target.y,
            z: controls.target.z
        };

        let end = { 
            pos: 1,
            x: endTarget.x,
            y: endTarget.y,
            z: endTarget.z
        };

        new TWEEN.Tween(current)
            .to(end, 2000)
            .onUpdate(() => {
                cam.position.copy(curve.getPointAt(current.pos / end.pos));
                cam.lookAt(
                    current.x,
                    current.y,
                    current.z
                );
            })
            .onComplete(() => {
                controls.target.copy(endTarget);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    moveToElement(editorElement) {
        let currentPoint = this.camera.position.clone();
        let endPoint = editorElement.position;
        let orbitPoints = this.orbit.getPointsOnOrbitBetweenTwoPoints(currentPoint, endPoint);

        let path = new CameraPath([
            currentPoint,
            ...orbitPoints,
            endPoint
        ]);

        let target = editorElement.target;
        this.moveOnCurve(path.curve, target);
    }
}