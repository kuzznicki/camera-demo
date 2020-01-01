class CameraMovement {
    constructor(camera, controls, camPositions) {
        this.camera = camera;
        this.controls = controls;
        this.CAMERA_POSITIONS = camPositions;
    }
    
    moveTo(x, y, z) {
        console.log(x, y, z);
    }

    moveToPos(x, y) {
        console.log(x, y, this.CAMERA_POSITIONS[x][y]);
    }
}