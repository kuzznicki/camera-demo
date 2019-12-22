class Bookcase {
    
    constructor(x, y, z, rows, cols) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.rows = rows;
        this.cols = cols;
        this.geometry = this.createGeometry();
    }

    createGeometry() {
        let {x, y, z, rows, cols} = this;
        let t = 18;
        let geometry;

        let group = new THREE.Group();
        let material = new THREE.MeshLambertMaterial({ color: 0xff0000 });

        //bottom
        geometry = new THREE.CubeGeometry(x, y, t);
        let bottom = new THREE.Mesh(geometry, material);
        bottom.position.z = t/2;
        group.add(bottom);

        //top
        let top = bottom.clone();
        top.position.z = z - t/2;
        group.add(top);

        //left
        geometry = new THREE.CubeGeometry(x, t, z - 2 * t);
        let left = new THREE.Mesh(geometry, material);
        left.position.set(0, -y / 2 + t / 2, z / 2);
        group.add(left);

        //right
        let right = left.clone();
        right.position.y = -left.position.y;
        group.add(right);


        //cols and rows
        let colMesh = left.clone();
        colMesh.material = new THREE.MeshLambertMaterial({color: 0xffff00});

        let rowGeoY = (y - (2 * t) - (cols - 1) * t) / cols; 
        geometry = new THREE.CubeGeometry(x, rowGeoY, 18);
        let rowMaterial = new THREE.MeshLambertMaterial({color: 0xffff00});
        let rowMesh = new THREE.Mesh(geometry, rowMaterial);

        for (let i = 0; i < cols; i++) {
            let col = colMesh.clone();
            col.position.y += (i + 1) * ((y - t) / cols);

            if (i + 1 !== cols)
                group.add(col);

            rowMesh.position.copy(col.position);
            rowMesh.position.y -= rowGeoY / 2 + t / 2;
            
            for (let j = 0; j < rows - 1; j++) {
                let row = rowMesh.clone();
                row.position.z = (j + 1) * (z / rows) - t / 2;
                group.add(row); 
            }
        }

        return group;
    }
}