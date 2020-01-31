class PositionsEditor {
    constructor(dom) {
        this.editorDom = dom;
        this.editorContentDom = dom.querySelector('.editor-content');
        this.positionsDom = dom.querySelector('.editor-positions-menu');

        this.elements = this.loadElementsFromLocalStorage();
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
                console.error("Error during retrieving PositionsEditor elements from localStorage.");
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
            pos = this.elements[this.elements.length - 1].position.clone();
            pos.add(new THREE.Vector3(0, 150, 0));
        }

        if (!target) {
            target = this.elements[this.elements.length - 1].target.clone();
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
}