
let container, scene, camera, renderer, controls, stats, movement;
const DEFAULTS = getSavedDefaults();
let cone, axesHelper, camHelpers, posEditor;
init();
animate();

function init() {
    //init scene
    container = document.getElementById('player');
    const CONTAINER_PADDING = 25;
    const WIDTH = container.clientWidth - 2 * CONTAINER_PADDING;
    const HEIGHT = container.clientHeight - CONTAINER_PADDING;
    const VIEW_ANGLE = 45;
    const ASPECT = WIDTH / HEIGHT;
    const NEAR = 0.1, FAR = 40000;
    const CAM_POS = DEFAULTS.CAM_POS || new THREE.Vector3(3200, 1700, 2400);
    const CAM_TARGET = DEFAULTS.CAM_TARGET || new THREE.Vector3(0, 0, 1000);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.up.set(0, 0, 1);
    camera.position.copy(CAM_POS);
    scene.add(camera);

    camHelpers = new THREE.Group();
    scene.add(camHelpers)

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);
    THREEx.WindowResize(renderer, camera, () => { 
        return { 
            width: container.clientWidth - 2 * CONTAINER_PADDING, 
            height: container.clientHeight - CONTAINER_PADDING
        };
    });

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
    camera.lookAt(CAM_TARGET);
    controls.target.copy(CAM_TARGET);
    setMinMaxDistance(controls, DEFAULTS);
    setCamBounds(controls, DEFAULTS);
    
    stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.left = CONTAINER_PADDING + 'px';
    container.appendChild(stats.dom);

    //add objects to scene
    axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    let ambient = new THREE.AmbientLight(0x636363);
    let light = new THREE.PointLight(0xffffff);
    light.position.set(10000, 10000, 25000);
    scene.add(ambient, light);

    let floorTexture = new THREE.ImageUtils.loadTexture('/vendors/images/checkerboard.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(5, 5);
    let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    let floorGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.z = -5;
    scene.add(floor);

    let skyBoxGeometry = new THREE.CubeGeometry(20000, 20000, 20000);
    let skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xb4d9ed, side: THREE.BackSide });
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    let orbit = new CameraOrbit(camera, 2500);
    camHelpers.add(orbit.getOrbitHelper());

    let bookcase = new Bookcase(600, 1000, 2000, 8, 5);
    scene.add(bookcase.geometry);

    // camera cone
    // var geometry = new THREE.ConeGeometry(50, 200, 32);
    // geometry.rotateX(Math.PI / 2);
    // var material = new THREE.MeshLambertMaterial({ color: 0x00c900});
    // cone = new THREE.Mesh(geometry, material);
    // cone.rotateY(-Math.PI/2);
    // scene.add(cone);
    // var axesHelper = new THREE.AxesHelper(250);
    // cone.add(axesHelper);
    // movement = new CameraMovement(cone, controls, orbit, CAM_POS, bookcase.camPositions);
    movement = new CameraMovement(camera, controls, orbit, bookcase.camPositions);

    let editorDom = document.querySelector('#editor');
    posEditor = new PositionsEditor(editorDom);
}

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    TWEEN.update();
    stats.end();
}


function getSavedDefaults() {
    const keys = [
        "CAM_POS", 
        "CAM_TARGET", 
        "CAM_MIN_DIST", 
        "CAM_MAX_DIST", 
        "CAM_BOUNDS"
    ];
    let defaults = {};

    for (let key of keys) {
        let item;

        switch (key) {
            case "CAM_POS":
            case "CAM_TARGET":
                item = getLocalStorageJson(key);
                
                if (item)
                    defaults[key] = new THREE.Vector3(item.x, item.y, item.z);

                break;

            case "CAM_MIN_DIST":
            case "CAM_MAX_DIST":
                item = localStorage.getItem(key);

                if (item)
                    defaults[key] = item;

                break;

            case "CAM_BOUNDS":
                item = getLocalStorageJson(key);
                
                if (item)
                    defaults[key] = item;

                break;
        }
    }

    return defaults;
}

function getLocalStorageJson(key) {
    let item = localStorage.getItem(key);

    if (item) {
        try {
            item = JSON.parse(item);
        } catch (e) {
            console.error("error during retrieving default value: " + key + " from localStorage. item is not a JSON");
        }
    }

    return item;
}

function setCurrentCamAsDefault() {
    const position = camera.position;
    const target = controls.target;
    setDefaultCam(position, target);
}

function setDefaultCam(position, target) {
    localStorage.setItem("CAM_POS", JSON.stringify(position));
    localStorage.setItem("CAM_TARGET", JSON.stringify(target));
}

function deleteDefaultCam() {
    localStorage.removeItem("CAM_POS");
    localStorage.removeItem("CAM_TARGET");
}

function saveMinMaxCamDist() {
    const minDistDom = document.querySelector("#dist-min");
    const maxDistDom = document.querySelector("#dist-max");
    let min = null;
    let max = null;

    if (minDistDom && maxDistDom) {
        if (
            !isNaN(minDistDom.value) && 
            !isNaN(maxDistDom.value) &&
            minDistDom.value.length > 0 &&
            maxDistDom.value.length > 0
        ) {
            min = +minDistDom.value;
            max = +maxDistDom.value;
            localStorage.setItem("CAM_MIN_DIST", min);
            localStorage.setItem("CAM_MAX_DIST", max);
        } else {
            alert('wrong distance values');
        }
    }

    if (min !== null && max !== null) {
        const values = {
            CAM_MIN_DIST: min, 
            CAM_MAX_DIST: max
        }; 
        setMinMaxDistance(controls, values);
    }
}

function setMinMaxDistance(controls, values) {
    if (
        values.hasOwnProperty("CAM_MIN_DIST") && 
        values.hasOwnProperty("CAM_MAX_DIST")
    ) {
        controls.minDistance = values.CAM_MIN_DIST;
        controls.maxDistance = values.CAM_MAX_DIST;
    }

    const minDistDom = document.querySelector("#dist-min");
    const maxDistDom = document.querySelector("#dist-max");
    
    if (minDistDom && maxDistDom) { 
        minDistDom.value = values.CAM_MIN_DIST;
        maxDistDom.value = values.CAM_MAX_DIST;
    }
}

function saveCamBounds() {
    const minDomX = document.querySelector("#camtar-x-min");
    const maxDomX = document.querySelector("#camtar-x-max");
    const minDomY = document.querySelector("#camtar-y-min");
    const maxDomY = document.querySelector("#camtar-y-max");
    const minDomZ = document.querySelector("#camtar-z-min");
    const maxDomZ = document.querySelector("#camtar-z-max");
    let boundsObject = null;

    if (
        minDomX && maxDomX && 
        minDomY && maxDomY && 
        minDomZ && maxDomZ &&
        minDomX.value.length > 0 &&
        maxDomX.value.length > 0 &&
        minDomY.value.length > 0 &&
        maxDomY.value.length > 0 &&
        minDomZ.value.length > 0 &&
        maxDomZ.value.length > 0
    ) {
        if (
            !isNaN(minDomX.value) && 
            !isNaN(maxDomX.value) &&
            !isNaN(minDomY.value) && 
            !isNaN(maxDomY.value) &&
            !isNaN(minDomZ.value) && 
            !isNaN(maxDomZ.value)
        ) {
            boundsObject = {
                x: {min: +minDomX.value, max: +maxDomX.value},
                y: {min: +minDomY.value, max: +maxDomY.value},
                z: {min: +minDomZ.value, max: +maxDomZ.value}
            }
            localStorage.setItem("CAM_BOUNDS", JSON.stringify(boundsObject));
        } else {
            alert('wrong bounds values');
        }
    }

    if (boundsObject !== null) {
        let values = {};
        values.CAM_BOUNDS = boundsObject; 
        setCamBounds(controls, values);
    }
}

function setCamBounds(controls, values) {
    let old = scene.getObjectByName("CAM_BOUNDS");
    if (old) scene.remove(old);
    
    if (values.hasOwnProperty("CAM_BOUNDS")) {
        controls._checkBoundaries = true;
        controls._panBoundaries = values.CAM_BOUNDS;

        const minDomX = document.querySelector("#camtar-x-min");
        const maxDomX = document.querySelector("#camtar-x-max");
        const minDomY = document.querySelector("#camtar-y-min");
        const maxDomY = document.querySelector("#camtar-y-max");
        const minDomZ = document.querySelector("#camtar-z-min");
        const maxDomZ = document.querySelector("#camtar-z-max");

        if (minDomX && maxDomX && minDomY && maxDomY && minDomZ && maxDomZ) {
            minDomX.value = values.CAM_BOUNDS.x.min;
            maxDomX.value = values.CAM_BOUNDS.x.max;
            minDomY.value = values.CAM_BOUNDS.y.min;
            maxDomY.value = values.CAM_BOUNDS.y.max;
            minDomZ.value = values.CAM_BOUNDS.z.min;
            maxDomZ.value = values.CAM_BOUNDS.z.max;
        }

        let mat = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        let geo = new THREE.CubeGeometry(
            values.CAM_BOUNDS.x.max - values.CAM_BOUNDS.x.min,
            values.CAM_BOUNDS.y.max - values.CAM_BOUNDS.y.min,
            values.CAM_BOUNDS.z.max - values.CAM_BOUNDS.z.min
        );
    
        let mesh = new THREE.Mesh(geo, mat);
        mesh.name = "CAM_BOUNDS";
        mesh.position.x = (+values.CAM_BOUNDS.x.max + +values.CAM_BOUNDS.x.min) / 2;
        mesh.position.y = (+values.CAM_BOUNDS.y.max + +values.CAM_BOUNDS.y.min) / 2;
        mesh.position.z = (+values.CAM_BOUNDS.z.max + +values.CAM_BOUNDS.z.min) / 2;
        scene.add(mesh);
    }
}

function deleteCamBounds() {
    localStorage.removeItem("CAM_BOUNDS");
    setCamBounds(controls, {});
}

function toggleCamBoundsVisibility() {
    let cube = scene.getObjectByName("CAM_BOUNDS");
    if (cube) cube.visible = !cube.visible;
}

function toggleHelpersVisibility() {
    toggleCamBoundsVisibility();
    camHelpers.visible = !camHelpers.visible;
    axesHelper.visible = !axesHelper.visible;
}

function enablePan() {
    controls.enablePan = true;
}

function disablePan() {
    controls.enablePan = false;
}

function setMinPolarAngle(angle) {
    controls.minPolarAngle = angle * THREE.Math.DEG2RAD;
}

function setMaxPolarAngle(angle) {
    controls.maxPolarAngle = angle * THREE.Math.DEG2RAD;
}

function setAzimuthAngles(angle) {
    controls.minAzimuthAngle = Math.PI / 2 - ((angle / 2) * THREE.Math.DEG2RAD);
    controls.maxAzimuthAngle = Math.PI / 2 + ((angle / 2) * THREE.Math.DEG2RAD);
}

function moveToPos(x, y) {
    movement.moveToPos(x, y);
}

function goToEditorElement(index = null) {
    if (index === null)
        index = posEditor.currentElementIndex;
        
    let element = posEditor.elements[index];
    movement.moveToElement(element);
}

function prevEditorElement() {
    posEditor.previousElement();
}

function nextEditorElement() {
    posEditor.nextElement();
}

function addEditorElement() {
    posEditor.addElement();
}

function removeEditorElement() {
    posEditor.removeCurrentElement();
}

function updateEditorElement() {
    let px = +document.querySelector('.editor-position-x').value;
    let py = +document.querySelector('.editor-position-y').value;
    let pz = +document.querySelector('.editor-position-z').value;
    let tx = +document.querySelector('.editor-target-x').value;
    let ty = +document.querySelector('.editor-target-y').value;
    let tz = +document.querySelector('.editor-target-z').value;
    
    let pos = new THREE.Vector3(px, py, pz);
    let target = new THREE.Vector3(tx, ty, tz);
    posEditor.updateCurrentElement(pos, target);
}

function saveEditorElements() {
    posEditor.saveElementsToLocalStorage();
}