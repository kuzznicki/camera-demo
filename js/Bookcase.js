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
        let t = 18, camPositions = [], mainColor = 0x007bff, accentColor = 0xffc107;
        let geometry;

        let group = new THREE.Group();
        let material = new THREE.MeshLambertMaterial({ color: mainColor });

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
        colMesh.material = new THREE.MeshLambertMaterial({color: accentColor});

        let rowGeoY = (y - (2 * t) - (cols - 1) * t) / cols; 
        geometry = new THREE.CubeGeometry(x, rowGeoY, 18);
        let rowMaterial = new THREE.MeshLambertMaterial({color: mainColor});
        let rowMesh = new THREE.Mesh(geometry, rowMaterial);

        for (let i = 0; i < cols; i++) {
            let col = colMesh.clone();
            col.position.y += (i + 1) * ((y - t) / cols);
            camPositions[i] = [];

            if (i + 1 !== cols)
                group.add(col);

            rowMesh.position.copy(col.position);
            rowMesh.position.y -= rowGeoY / 2 + t / 2;
            
            for (let j = 0; j < rows; j++) {
                let row = rowMesh.clone();
                row.position.z = (j + 1) * (z / rows) - t / 2;

                if (j + 1 !== rows)
                    group.add(row);
            }
        }

        return group;
    }
}