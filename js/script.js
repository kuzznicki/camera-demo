
let container, scene, camera, renderer, controls, stats;

let mesh;

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
    const CAM_POS = new THREE.Vector3(3200, 1700, 2400);
    const CAM_TARGET = new THREE.Vector3(0, 0, 1000);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.up.set(0, 0, 1);
    camera.position.copy(CAM_POS);
    scene.add(camera);

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
    camera.lookAt(CAM_TARGET);
    controls.target.copy(CAM_TARGET);
    
    stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.left = CONTAINER_PADDING + 'px';
    container.appendChild(stats.dom);

    //add objects to scene
    var axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    let light = new THREE.PointLight(0xffffff);
    light.position.set(10000, 10000, 25000);
    scene.add(light);

    let floorTexture = new THREE.ImageUtils.loadTexture('/vendors/images/checkerboard.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);
    let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    let floorGeometry = new THREE.PlaneGeometry(4000, 4000, 10, 10);
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.z = -2;
    // floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    let skyBoxGeometry = new THREE.CubeGeometry(20000, 20000, 20000);
    let skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xb4d9ed, side: THREE.BackSide });
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    let bookcase = new Bookcase(600, 1000, 2000, 8, 5);
    scene.add(bookcase.geometry);
}

function animate() {
    stats.begin();
    requestAnimationFrame(animate);
    render();
    stats.end();
}

function render() {
    renderer.render(scene, camera);
}
