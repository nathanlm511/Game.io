//Variables for setup
let container;
let camera;
let renderer;
let scene;
let ship;
let orbitControls,
    geometry,
    water,
    root,
    uniforms,
    color = null;

let oceanUrl = "../img/water.jpg";
let wavesUrl = "../img/waves.png";

let duration = 5000; // ms
let currentTime = Date.now();

function init() {
    container = document.querySelector(".scene");

    //Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    //Create scene
    scene = new THREE.Scene();

    const fov = 45;
    const aspect = container.clientWidth / container.clientHeight;
    const near = 0.1;
    const far = 5000;

    //Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 500, 400);

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(0, 50, 0);
    scene.add(light);


    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    container.appendChild(renderer.domElement);
    // scene.background = new THREE.Color( 0xffffff );

    let COLORMAP = new THREE.TextureLoader().load(oceanUrl);
    // let NOISEMAP = new THREE.TextureLoader().load("../images/noisy-texture-3.png");
    let NOISEMAP = new THREE.TextureLoader().load(wavesUrl);
    
    uniforms = 
    {
        time: { type: "f", value: 0.2 },
        noiseTexture: { type: "t", value: NOISEMAP },
        glowTexture: { type: "t", value: COLORMAP }
    };

    uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        transparent: true,
    } );
    let oceanGeometry = new THREE.PlaneGeometry( 3000, 3000, 100, 100 );
    let ocean = new THREE.Mesh(oceanGeometry, material);

    // 
    ocean.rotation.x = -Math.PI / 2;
    scene.add( ocean );

    //Load Model
    let loader = new THREE.GLTFLoader();
    loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
        scene.add(gltf.scene);
        ship = gltf.scene.children[0];
        ship.scale.setScalar(10);
        ship.position.x = 0;
        ship.position.y = 0;
        ship.position.z = 0;
    });
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;

        // ship.rotation.z += 0.005;

    uniforms.time.value += fract;
}
function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();            
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);


init();
run();