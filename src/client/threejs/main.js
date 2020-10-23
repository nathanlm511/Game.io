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

//controls
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let speed = 12.5;
let x, y ,z;

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

    x = camera.position.x;
    y = camera.position.y;
    z = camera.position.z;

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(0, 50, 0);
    scene.add(light);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // Add limits to zoom in and zoom out distance
    orbitControls.maxDistance = 3250;
    orbitControls.minDistance = 225;
    // orbitControls.maxAzimuthAngle = [Math.PI, Math.PI]

    container.appendChild(renderer.domElement);
    // scene.background = new THREE.Color( 0xffffff );

    let COLORMAP = new THREE.TextureLoader().load(oceanUrl);
    // let NOISEMAP = new THREE.TextureLoader().load("../images/noisy-texture-3.png");
    let NOISEMAP = new THREE.TextureLoader().load(wavesUrl);

    uniforms = {
        time: { type: "f", value: 0.2 },
        noiseTexture: { type: "t", value: NOISEMAP },
        glowTexture: { type: "t", value: COLORMAP },
    };

    uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT =
        THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT =
        THREE.RepeatWrapping;

    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById("vertexShader").textContent,
        fragmentShader: document.getElementById("fragmentShader").textContent,
        transparent: false,
    });
    let oceanGeometry = new THREE.PlaneGeometry(3000, 3000, 100, 100);
    let ocean = new THREE.Mesh(oceanGeometry, material);

    //
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

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

// Add event listener for keypresses. When keypress dectected keyboard function is called
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

function onKeyDown(event) {    
        // Switch statement to move the ship dependent on the key press.
        switch (event.key) {
            case "w":
                // Move up on 'W' press
                moveForward = true;
                break;
            case "s":
                // Move down on 'S' press
                moveBackward = true;
                break;
            case "d":
                // Move right on 'D' press
                moveRight = true;
                break;
            case "a":
                // Move left on 'A' press
                moveLeft = true; 
                break;
        }
}
function onKeyUp(event) {    
    // Switch statement to move the ship dependent on the key press.
    switch (event.key) {
        case "w":
            // Move up on 'W' press
            moveForward = false;
            break;
        case "s":
            // Move down on 'S' press
            moveBackward = false;
            break;
        case "d":
            // Move right on 'D' press
            moveRight = false;
            break;
        case "a":
            // Move left on 'A' press
            moveLeft = false; 
            break;
    }
}

// Function that will set a new camera position on the value passed to it.
function setCamera(x, y, z) {
    camera.position.set(x, y, z);
}

// Function that changes the target of the orbit controls to the position of the ship.
function setOrbit() {
    orbitControls.target = new THREE.Vector3(
        ship.position.x,
        ship.position.y,
        ship.position.z
    );
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    
    // controls
    if(ship)
    {
        if(moveForward)
        {
            console.log("W");
            ship.position.z -= speed;
            z -= speed;
            setCamera(x, y, z);
            setOrbit();
            ship.lookAt(x, 0, 1000);
        }
        if(moveBackward)
        {
            console.log("S");
            ship.position.z += speed;
            z += speed;
            setCamera(x, y, z);
            setOrbit();
            ship.lookAt(x, 0, -1000);
        }
        if(moveLeft)
        {
            console.log("A");
            ship.position.x -= speed;
            x -= speed;
            setCamera(x, y, z);
            setOrbit();
            ship.lookAt(1000, 0, z);
        }
        if(moveRight)
        {
            console.log("D");
            ship.position.x += speed;
            x += speed;
            setCamera(x, y, z);
            setOrbit();
            ship.lookAt(-1000, 0, z);
        }
    }

    // ship.rotation.z += 0.005;

    uniforms.time.value += fract;
}

function run() {
    requestAnimationFrame(function () {
        run();
    });

    // Render the scene
    renderer.render(scene, camera);

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
