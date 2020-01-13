class CameraOrbit {
    
    constructor(camera, radius) {
        this.camera = camera;
        this.radius = radius;
    }

    getOrbitHelper() {
        var geometry = new THREE.CylinderGeometry(this.radius, this.radius, 2000, 32);
        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        var mesh = new THREE.Mesh(geometry, material);
        mesh.rotateX(-Math.PI/2);
        mesh.position.z = 1250;
        return mesh;
    }

    getPath(startPoint, endPoint) {
        var curvePoints = this.getPathPoints(startPoint, endPoint);
        var geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        var material = new THREE.LineBasicMaterial({ color: 0x000000 });
        return new THREE.Line(geometry, material);
    }

    getPointsOnOrbitBetweenTwoPoints(p1, p2) {
        let orbitPoints = [];
        const startAngle = this.getAngleFromPoint(p1);
        const endAngle = this.getAngleFromPoint(p2);
        const angleSteps = this.getAngleSteps(startAngle, endAngle);

        if (this.checkIfCameraInsideOrbit()) {
            orbitPoints.push(this.getPointFromAngle(startAngle, p1.z, 0.9));

            for (let i = 1; i < angleSteps.length - 1; i++) {
                let alfa = angleSteps[i];
                let z = p1.z + (p2.z - p1.z) * i / (angleSteps.length - 1);
                let point = this.getPointFromAngle(alfa, z);
                orbitPoints.push(point)
            }
        }

        orbitPoints.push(this.getPointFromAngle(endAngle, p2.z, 0.9));
        return orbitPoints;
    }

    checkIfCameraInsideOrbit() {
        return this.camera.position.distanceTo(new THREE.Vector3(0, 0, this.camera.position.z)) <= this.radius;
    }

    getPointToMoveBack(point) {
        let v = new THREE.Vector2(point.x, point.y).normalize();
        v.multiplyScalar(this.orbit.radius);
        return new THREE.Vector3(v.x, v.y, point.z);
    }

    getAngleFromPoint(point) {
        return Math.atan2(point.y, point.x);
    }

    getAngleSteps(startAngle, endAngle) {
        let angleSteps = [];
        let approximatedStep = 30 * THREE.Math.DEG2RAD;
        let stepsNumber = 1 + Math.abs((startAngle - endAngle) / approximatedStep) >> 0;
        let step = (endAngle - startAngle) / stepsNumber;

        for (let i = 0; i < stepsNumber + 1; i++) {
            angleSteps.push(startAngle + i * step);
        }

        return angleSteps;
    }

    getPointFromAngle(angle, z = 0, radiusFactor = 1) {
        const x = this.radius * radiusFactor * Math.cos(angle);
        const y = this.radius * radiusFactor * Math.sin(angle);
        return new THREE.Vector3(x, y, z);
    }
}