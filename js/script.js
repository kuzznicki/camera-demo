
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
    const NEAR = 0.1, FAR = 20000;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(0, 150, 400);
    camera.lookAt(scene.position);

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

    stats = new Stats();
    stats.dom.style.position = 'absolute';
    stats.dom.style.left = CONTAINER_PADDING + 'px';
    container.appendChild(stats.dom);

    //add objects to scene
    let light = new THREE.PointLight(0xffffff);
    light.position.set(100, 250, 100);
    scene.add(light);

    let floorTexture = new THREE.ImageUtils.loadTexture('/vendors/images/checkerboard.png');
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(10, 10);
    let floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    let floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    let skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
    let skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xb4d9ed, side: THREE.BackSide });
    let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
    scene.add(skyBox);

    let geometry = new THREE.SphereGeometry(30, 32, 16);
    let material = new THREE.MeshLambertMaterial({ color: 0x000088 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 40, 0);
    scene.add(mesh);
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
