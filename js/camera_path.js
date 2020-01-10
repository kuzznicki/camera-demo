class CameraPath {
    constructor(points, precision = 50) {
        this.points = points;
        this.precision = precision;
        this.curve = this.createCurve(points);
        this.curvePoints = this.getCurvePoints();
        this.pathHelper = this.createPathHelper(points, this.curvePoints);
    }

    createCurve(points) {
        let curve = new THREE.CatmullRomCurve3(points);
        curve.curveType = "catmullrom";
        return curve;
    }

    getCurvePoints() {
        let resolution = this.precision * (this.points.length - 1);
        return this.curve.getPoints(resolution);
    }

    createPathHelper(points, curvePoints) {
        let pathHelper = new THREE.Group();
        let material = new THREE.LineBasicMaterial({ color: 0x000000 });
        
        let lineGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
        let pathLine = new THREE.Line(lineGeometry, material);
        pathHelper.add(pathLine);

        let cubeGeometry = new THREE.CubeGeometry(25, 25, 25);
        let cubeMesh = new THREE.Mesh(cubeGeometry, material);

        for (let p of points) {
            let pathPoint = cubeMesh.clone();
            pathPoint.position.copy(p);
            pathHelper.add(pathPoint);
        }

        return pathHelper;
    }

    getPathHelper() {
        return this.pathHelper;
    }
}