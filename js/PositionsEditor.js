class PositionsEditor {
    constructor(dom) {
        this.editorDom = dom;
        this.editorContentDom = dom.querySelector('.editor-content');
        this.positionsDom = dom.querySelector('.editor-positions-menu');

        this.elements = this.loadElements();
        this.group = this.initEditorGroup();
        this.materials = this.initEditorMaterials();

        this.currentElementIndex = this.elements.length > 0 ? 0 : null;
        this.update();

        this.modes = ['POSITIONS', 'EDITOR']; //['HIDDEN', 'POSITIONS', 'EDITOR'];
        this.mode = -1;
        this.changeEditorMode();

        document.addEventListener('keypress', this.handleKeypress.bind(this));
        dom.querySelector('.editor-title').addEventListener('click', this.handleMouseClick.bind(this));
    }

    saveElementsToLocalStorage() {
        let json = JSON.stringify(this.elements);
        localStorage.setItem('elements', json);
    }

    loadElements() {
        let elements = [];

        if (localStorage.getItem('elements'))
            elements = this.loadElementsFromLocalStorage();
        else if (confirm('No positions editor data. Do you want to load default configuration?'))
            elements = this.loadDefaultElements()

        return elements;
    }

    loadElementsFromLocalStorage() {
        let elements = [];
        let json = localStorage.getItem('elements');
        
        if (json) {
            try {
                elements = JSON.parse(json);
                let loader = new THREE.ObjectLoader();

                for (let i in elements) {
                    elements[i].group = loader.parse(elements[i].group);
                    
                    let p = elements[i].position;
                    elements[i].position = new THREE.Vector3(p.x, p.y, p.z);
                    
                    let t = elements[i].target;
                    elements[i].target = new THREE.Vector3(t.x, t.y, t.z);
                }
            } catch (e) {
                console.error('Error during retrieving PositionsEditor elements from localStorage.');
            }
        }

        return elements;
    }

    changeElementColor(element, color) {
        let colorToSet;
        
        switch (color) {
            case 'active':
                colorToSet = this.materials.activeMaterial.color;
                break
            
            case 'default':
                colorToSet = this.materials.defaultMaterial.color;
                break
            
            default:
                colorToSet = new THREE.Color(color);
        }

        element.material.color = colorToSet;
    }

    previousElement() {
        if (
            this.currentElementIndex === null || 
            this.currentElementIndex === 0 ||
            this.elements.length === 0
        ) return;
        
        this.currentElementIndex--;
        this.update();
    }

    nextElement() {
        if (
            this.currentElementIndex === null || 
            this.currentElementIndex === this.elements.length - 1 ||
            this.elements.length === 0
        ) return;

        this.currentElementIndex++;
        this.update();
    }

    removeCurrentElement() {
        this.removeElement(this.currentElementIndex);
    }

    removeElement(elIndex) {
        let element = this.elements[elIndex];
        this.group.remove(element.group);
        this.elements.splice(elIndex, 1);

        if (this.currentElementIndex > this.elements.length - 1)
            this.currentElementIndex = this.elements.length - 1
        
        if (this.elements.length === 0)
            this.currentElementIndex = null;

        this.update();
    }

    addElement(pos, target) {
        if (!pos) {
            if (this.elements.length > 0)
                pos = this.elements[this.elements.length - 1].position.clone();
            else
                pos = new THREE.Vector3(600, -400, 1850);
            
            pos.add(new THREE.Vector3(0, 150, 0));
        }

        if (!target) {
            if (this.elements.length > 0)
                target = this.elements[this.elements.length - 1].target.clone();
            else
                target = new THREE.Vector3(400, -400, 1850);

            target.add(new THREE.Vector3(0, 150, 0));
        }

        let helper = this.createPositionHelper(pos, target);
        this.group.add(helper.group);
        this.elements.push(helper);

        this.currentElementIndex = this.elements.length - 1;

        this.update();
    }

    updateCurrentElement(pos, target) {
        if (this.currentElementIndex !== null && this.elements.length > 0) {
            this.updateElement(this.elements[this.currentElementIndex], pos, target);
        }
    }

    updateElement(element, pos, target) {
        element.position = new THREE.Vector3(pos.x, pos.y, pos.z);
        element.target = new THREE.Vector3(target.x, target.y, target.z);

        element.group.getObjectByName('pos helper').position.copy(element.position);
        element.group.getObjectByName('target helper').position.copy(element.target);
        element.group.getObjectByName('dir helper').geometry.vertices[0] = element.position;
        element.group.getObjectByName('dir helper').geometry.vertices[1] = element.target;
        element.group.getObjectByName('dir helper').geometry.verticesNeedUpdate = true;
    }

    createPositionHelper(pos, target) {
        let helperGroup = new THREE.Group();
        helperGroup.name = `Helper Group ${this.elements.length + 1}`;
        let mainMaterial = this.materials.defaultMaterial.clone();

        let sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
        let sphereMesh = new THREE.Mesh(sphereGeometry, mainMaterial);
        sphereMesh.position.copy(pos);
        sphereMesh.name = 'pos helper';
        helperGroup.add(sphereMesh);

        let cubeGeometry = new THREE.CubeGeometry(32, 32, 32);
        let cubeMesh = new THREE.Mesh(cubeGeometry, mainMaterial);
        cubeMesh.position.copy(target);
        cubeMesh.name = 'target helper';
        helperGroup.add(cubeMesh);

        let lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(sphereMesh.position, cubeMesh.position);
        let lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        let line = new THREE.Line(lineGeometry, lineMaterial);
        line.name = 'dir helper';
        helperGroup.add(line);

        return {
            group: helperGroup,
            position: sphereMesh.position,
            target: cubeMesh.position
        };
    }

    handleKeypress(e) {
        if (e.key === 'e')
            this.changeEditorMode();
    }

    handleMouseClick(e) {
        this.changeEditorMode();
    }

    changeEditorMode() {
        this.mode = (this.mode + 1) % this.modes.length;
        let currentMode = this.modes[this.mode];
        
        switch (currentMode) {
            case 'HIDDEN': 
                this.editorDom.style.display = 'none';
                break;

            case 'POSITIONS': 
                this.editorDom.style.display = 'block';
                this.editorContentDom.style.display = 'none';
                this.positionsDom.style.display = 'block';
                break;

            case 'EDITOR': 
                this.editorDom.style.display = 'block';
                this.editorContentDom.style.display = 'block';
                this.positionsDom.style.display = 'none';
                break;
        }
    }

    initEditorGroup() {
        let group = new THREE.Group();
        group.name = "Positions Editor Group";
        scene.add(group);

        //add elements loaded from localStorage
        for (let element of this.elements) {
            group.add(element.group);
        }

        return group;
    }

    initEditorMaterials() {
        let defaultMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        let activeMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        
        return {
            defaultMaterial: defaultMaterial,
            activeMaterial: activeMaterial
        };
    }

    setDefaultColorForAllElements() {
        for (let i in this.elements) {
            let group = this.elements[i].group;
            let posHelper = group.getObjectByName('pos helper');
            let targetHelper = group.getObjectByName('target helper');
            this.changeElementColor(posHelper, 'default');
            this.changeElementColor(targetHelper, 'default');
        }
    }

    setCurrentElementColor() {
        if (this.currentElementIndex !== null && this.elements.length > 0) {
            let currentElement = this.elements[this.currentElementIndex];
            let posHelper = currentElement.group.getObjectByName('pos helper');
            let targetHelper = currentElement.group.getObjectByName('target helper');
            let color = 'active';

            this.changeElementColor(posHelper, color);
            this.changeElementColor(targetHelper, color);
        }
    }

    update() {
        this.setDefaultColorForAllElements();
        this.setCurrentElementColor();
        this.uiUpdate();
    }
    
    uiUpdate() {
        this.uiElement();
        this.uiPosition();
        this.uiTarget();
        this.uiPositions();
    }

    uiElement() {
        let elementGoDom = document.querySelector('.editor-element-go');
        let elementNumberDom = document.querySelector('.editor-element-number');
        let elementLeftDom = document.querySelector('.editor-element-l');
        let elementRightDom = document.querySelector('.editor-element-r');
        let elementRemoveDom = document.querySelector('.editor-element-remove');

        if (elementGoDom) {
            if (this.currentElementIndex !== null)
                elementGoDom.style.display = 'block';
            else
                elementGoDom.style.display = 'none';
        }

        if (elementNumberDom) {
            if (this.currentElementIndex !== null)
                elementNumberDom.innerText = this.currentElementIndex + 1;
            else
                elementNumberDom.innerText = '-';
        }
        
        if (elementLeftDom) {
            if (this.currentElementIndex > 0)
                elementLeftDom.style.display = 'block';
            else
                elementLeftDom.style.display = 'none';
        }

        if (elementRightDom) {
            if (this.elements.length - 1 - this.currentElementIndex > 0)
                elementRightDom.style.display = 'block';
            else
                elementRightDom.style.display = 'none';
        }

        if (elementRemoveDom) {
            if (this.elements.length > 0)
                elementRemoveDom.style.display = 'block';
            else
                elementRemoveDom.style.display = 'none';
        }
    }

    uiPosition() {
        let xDom = document.querySelector('.editor-position-x');
        let yDom = document.querySelector('.editor-position-y');
        let zDom = document.querySelector('.editor-position-z');

        if (xDom && yDom && zDom && this.currentElementIndex !== null && this.elements.length > 0) {
            xDom.value = this.elements[this.currentElementIndex].position.x;
            yDom.value = this.elements[this.currentElementIndex].position.y;
            zDom.value = this.elements[this.currentElementIndex].position.z;
        }
    }

    uiPositions() {
        this.positionsDom.innerHTML = '';

        for (let i in this.elements) {
            let el = this.elements[i];

            let btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-primary btn-sm m-1';
            btn.innerText = +i + 1;
            btn.onclick = () => {
                goToEditorElement(i);
            }

            this.positionsDom.appendChild(btn);
        }
    }

    uiTarget() {
        let xDom = document.querySelector('.editor-target-x');
        let yDom = document.querySelector('.editor-target-y');
        let zDom = document.querySelector('.editor-target-z');

        if (xDom && yDom && zDom && this.currentElementIndex !== null && this.elements.length > 0) {
            xDom.value = this.elements[this.currentElementIndex].target.x;
            yDom.value = this.elements[this.currentElementIndex].target.y;
            zDom.value = this.elements[this.currentElementIndex].target.z;
        }
    }

    loadDefaultElements() {
        let json = '[{"group":{"metadata":{"version":4.5,"type":"Object","generator":"Object3D.toJSO' +
        'N"},"geometries":[{"uuid":"3A0621AA-2536-419E-A536-3C468056B498","type":"SphereG' +
        'eometry","radius":50,"widthSegments":32,"heightSegments":32},{"uuid":"E90CB967-1' +
        '629-42E4-A9E4-D8D63E0908B0","type":"BoxGeometry","width":32,"height":32,"depth":' +
        '32},{"uuid":"AB750B3E-DEDB-4172-A752-1C3F228AAA5C","type":"Geometry","data":{"ve' +
        'rtices":[600,-250,1850,400,-250,1850],"normals":[],"faces":[]}}],"materials":[{"' +
        'uuid":"92DEF808-EAD0-4763-B601-1E90A87FB927","type":"MeshLambertMaterial","color' +
        '":16776960,"emissive":0,"depthFunc":3,"depthTest":true,"depthWrite":true},{"uuid' +
        '":"1B45B6ED-3534-4BAB-ACB4-C970C6EF3838","type":"LineBasicMaterial","color":0,"d' +
        'epthFunc":3,"depthTest":true,"depthWrite":true}],"object":{"uuid":"10E2B3F8-CA1E' +
        '-4CFA-BA8C-625F7715F81E","type":"Group","name":"Helper Group 2","layers":1,"matr' +
        'ix":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],"children":[{"uuid":"EF587DDD-5A54-44F0-AF' +
        '12-AF1AC5AB3208","type":"Mesh","name":"pos helper","layers":1,"matrix":[1,0,0,0,' +
        '0,1,0,0,0,0,1,0,600,-250,1850,1],"geometry":"3A0621AA-2536-419E-A536-3C468056B49' +
        '8","material":"92DEF808-EAD0-4763-B601-1E90A87FB927"},{"uuid":"51A36464-FDE0-481' +
        '4-B700-B34BF7E1B6A3","type":"Mesh","name":"target helper","layers":1,"matrix":[1' +
        ',0,0,0,0,1,0,0,0,0,1,0,400,-250,1850,1],"geometry":"E90CB967-1629-42E4-A9E4-D8D6' +
        '3E0908B0","material":"92DEF808-EAD0-4763-B601-1E90A87FB927"},{"uuid":"1CB176C6-4' +
        'F08-45D6-A665-EEA342DE9954","type":"Line","name":"dir helper","layers":1,"matrix' +
        '":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],"geometry":"AB750B3E-DEDB-4172-A752-1C3F228A' +
        'AA5C","material":"1B45B6ED-3534-4BAB-ACB4-C970C6EF3838"}]}},"position":{"x":600,' +
        '"y":-250,"z":1850},"target":{"x":400,"y":-250,"z":1850}},{"group":{"metadata":{"' +
        'version":4.5,"type":"Object","generator":"Object3D.toJSON"},"geometries":[{"uuid' +
        '":"DA9FDC42-A19E-4994-98C3-365AB641EE15","type":"SphereGeometry","radius":50,"wi' +
        'dthSegments":32,"heightSegments":32},{"uuid":"676CB4C7-6F4C-4354-BE62-9ECC0DCDBD' +
        '1E","type":"BoxGeometry","width":32,"height":32,"depth":32},{"uuid":"60C5B17A-A5' +
        '7C-4D55-94BE-F245054DDB92","type":"Geometry","data":{"vertices":[600,400,1350,40' +
        '0,400,1350],"normals":[],"faces":[]}}],"materials":[{"uuid":"31B5ED7C-3A52-4C26-' +
        'A7AC-082912D5AF86","type":"MeshLambertMaterial","color":16711680,"emissive":0,"d' +
        'epthFunc":3,"depthTest":true,"depthWrite":true},{"uuid":"2ABE83C2-5201-47F9-B587' +
        '-61C043846218","type":"LineBasicMaterial","color":0,"depthFunc":3,"depthTest":tr' +
        'ue,"depthWrite":true}],"object":{"uuid":"0A44A5F2-2036-4DB6-8B0D-36A2A630C247","' +
        'type":"Group","name":"Helper Group 3","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1' +
        ',0,0,0,0,1],"children":[{"uuid":"199FFAFE-4FE6-4FD0-B246-56574640E8A4","type":"M' +
        'esh","name":"pos helper","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,600,400,13' +
        '50,1],"geometry":"DA9FDC42-A19E-4994-98C3-365AB641EE15","material":"31B5ED7C-3A5' +
        '2-4C26-A7AC-082912D5AF86"},{"uuid":"E8424CE0-14C6-4829-BD3C-60B7C527A37D","type"' +
        ':"Mesh","name":"target helper","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,400,' +
        '400,1350,1],"geometry":"676CB4C7-6F4C-4354-BE62-9ECC0DCDBD1E","material":"31B5ED' +
        '7C-3A52-4C26-A7AC-082912D5AF86"},{"uuid":"B6687883-73E3-4422-B2CE-22F89FA12BB3",' +
        '"type":"Line","name":"dir helper","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,0' +
        ',0,0,1],"geometry":"60C5B17A-A57C-4D55-94BE-F245054DDB92","material":"2ABE83C2-5' +
        '201-47F9-B587-61C043846218"}]}},"position":{"x":600,"y":400,"z":1350},"target":{' +
        '"x":400,"y":400,"z":1350}},{"group":{"metadata":{"version":4.5,"type":"Object","' +
        'generator":"Object3D.toJSON"},"geometries":[{"uuid":"D3AD672E-9DF2-4264-A626-113' +
        '92938EC49","type":"SphereGeometry","radius":50,"widthSegments":32,"heightSegment' +
        's":32},{"uuid":"BAE9372F-1EDD-40CD-87F0-E886CFA126A3","type":"BoxGeometry","widt' +
        'h":32,"height":32,"depth":32},{"uuid":"E0EBDDF9-8811-425B-8547-DD61956A0870","ty' +
        'pe":"Geometry","data":{"vertices":[-600,-200,1350,-400,-150,1350],"normals":[],"' +
        'faces":[]}}],"materials":[{"uuid":"C4F80205-2F90-4D0A-9899-2BC39AC98504","type":' +
        '"MeshLambertMaterial","color":16711680,"emissive":0,"depthFunc":3,"depthTest":tr' +
        'ue,"depthWrite":true},{"uuid":"825C5850-9CBF-4EEE-B85E-5EC2F34E4C55","type":"Lin' +
        'eBasicMaterial","color":0,"depthFunc":3,"depthTest":true,"depthWrite":true}],"ob' +
        'ject":{"uuid":"D09DE131-81F5-4F42-9920-237F4A505718","type":"Group","name":"Help' +
        'er Group 4","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],"children":[{"' +
        'uuid":"F4802DDF-C420-4B22-8314-2B9FA08B7B6D","type":"Mesh","name":"pos helper","' +
        'layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,-600,-200,1350,1],"geometry":"D3AD67' +
        '2E-9DF2-4264-A626-11392938EC49","material":"C4F80205-2F90-4D0A-9899-2BC39AC98504' +
        '"},{"uuid":"88FDF563-81DC-4D1D-A232-1F6F274C4266","type":"Mesh","name":"target h' +
        'elper","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,-400,-150,1350,1],"geometry"' +
        ':"BAE9372F-1EDD-40CD-87F0-E886CFA126A3","material":"C4F80205-2F90-4D0A-9899-2BC3' +
        '9AC98504"},{"uuid":"A52CEEC5-F42C-40EA-BBC0-F671CC87467D","type":"Line","name":"' +
        'dir helper","layers":1,"matrix":[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],"geometry":"E0' +
        'EBDDF9-8811-425B-8547-DD61956A0870","material":"825C5850-9CBF-4EEE-B85E-5EC2F34E' +
        '4C55"}]}},"position":{"x":-600,"y":-200,"z":1350},"target":{"x":-400,"y":-150,"z' +
        '":1350}}]';

        let elements = JSON.parse(json);
        let loader = new THREE.ObjectLoader();

        for (let i in elements) {
            elements[i].group = loader.parse(elements[i].group);
            
            let p = elements[i].position;
            elements[i].position = new THREE.Vector3(p.x, p.y, p.z);
            
            let t = elements[i].target;
            elements[i].target = new THREE.Vector3(t.x, t.y, t.z);
        }

        return elements;
    }
}