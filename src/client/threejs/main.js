import global from './global.js';

//Variables for setup
let container;
let camera;
let renderer;
let scene;
let ships = {};
let gold = {};
let cannonBalls = {};
let playerShip;
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
let speed = 6;
let x, y, z;

let duration = 5000; // ms
let currentTime = Date.now();

//socket stuff
var socket;
var reason;

var foods = [];
var viruses = [];
var fireFood = [];
var users = [];
var leaderboard = [];

let loader;

var player = {
    id: -1,
    name: "Unidentified Ship",
    x: 0,
    y: 0,
    z: 0,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,
    direction: 0,
    speed: 0,
    health: 100
};

// socket stuff.
function setupSocket(socket) {
    // Handle ping.
    socket.on('pongcheck', function () {
        var latency = Date.now() - global.startPingTime;
        debug('Latency: ' + latency + 'ms');
        window.chat.addSystemLine('Ping: ' + latency + 'ms');
    });

    // Handle error.
    socket.on('connect_failed', function () {
        socket.close();
        global.disconnected = true;
    });

    socket.on('disconnect', function () {
        socket.close();
        global.disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {
        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.screenHeight = global.screenHeight;
        global.player = player;
        socket.emit('gotit', player);
    });

    var didPlace = false;
    // Handle movement.
    socket.on('serverTellPlayerMove', function (visibleShips, visibleGold, visibleBalls) {
        var populatedDict = false;
        for (var key in ships) {
            populatedDict = true;
            break;
        }

        if (populatedDict) {
            for (var i = 0; i < visibleShips.length; i++) {
                let ship = visibleShips[i];
                ships[ship.id].model.position.x = ship.x;
                ships[ship.id].model.position.z = ship.z;
                ships[ship.id].model.lookAt(ship.x - Math.cos(ship.direction * Math.PI / 180), 0, ship.z - Math.sin(ship.direction * Math.PI / 180));
                /*
                if (!didPlace) {
                    let x1 = playerShip.position.x + 25;
                    let x2 = playerShip.position.x - 25;
                    let y1 = playerShip.position.z + 12;
                    let y2 = playerShip.position.z - 12;
                    let xm1 = x1*Math.cos(visibleShips[i].direction * Math.PI / 180) - y1 * Math.sin(visibleShips[i].direction * Math.PI / 180);
                    let ym1 = x1*Math.sin(visibleShips[i].direction * Math.PI / 180) + y1 * Math.cos(visibleShips[i].direction * Math.PI / 180);
                    let xm2 = x2*Math.cos(visibleShips[i].direction * Math.PI / 180) - y1 * Math.sin(visibleShips[i].direction * Math.PI / 180);
                    let ym2 = x2*Math.sin(visibleShips[i].direction * Math.PI / 180) + y1 * Math.cos(visibleShips[i].direction * Math.PI / 180);
                    let xm3 = x1*Math.cos(visibleShips[i].direction * Math.PI / 180) - y2 * Math.sin(visibleShips[i].direction * Math.PI / 180);
                    let ym3 = x1*Math.sin(visibleShips[i].direction * Math.PI / 180) + y2 * Math.cos(visibleShips[i].direction * Math.PI / 180);
                    let xm4 = x2*Math.cos(visibleShips[i].direction * Math.PI / 180) - y2 * Math.sin(visibleShips[i].direction * Math.PI / 180);
                    let ym4 = x2*Math.sin(visibleShips[i].direction * Math.PI / 180) + y2 * Math.cos(visibleShips[i].direction * Math.PI / 180);
    
                    console.log(xm1);
                    console.log(ym1);
                    console.log(xm2);
                    console.log(ym2);
                    console.log(xm3);
                    console.log(ym3);
                    console.log(xm4);
                    console.log(ym4);
                    loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                        scene.add(gltf.scene);
                        var ship = gltf.scene.children[0];
                        ship.scale.setScalar(1);
                        ship.position.x = xm1;
                        ship.position.y = 0;
                        ship.position.z = ym1;
                    });
                    loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                        scene.add(gltf.scene);
                        var ship = gltf.scene.children[0];
                        ship.scale.setScalar(1);
                        ship.position.x = xm2;
                        ship.position.y = 0;
                        ship.position.z = ym2;
                    });
                    loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                        scene.add(gltf.scene);
                        var ship = gltf.scene.children[0];
                        ship.scale.setScalar(1);
                        ship.position.x = xm3;
                        ship.position.y = 0;
                        ship.position.z = ym3;
                    });
                    loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                        scene.add(gltf.scene);
                        var ship = gltf.scene.children[0];
                        ship.scale.setScalar(1);
                        ship.position.x = xm4;
                        ship.position.y = 0;
                        ship.position.z = ym4;
                    });
                    didPlace = true;
                }
                */
            }

            // gold rendering
            var newGold = [];
            var deleteGold = Object.assign({}, gold);;
            for (var i = 0; i < visibleGold.length; i++) {
                if (!(visibleGold[i].id in gold)) {
                    newGold.push(visibleGold[i]);
                }
                else {
                    delete deleteGold[visibleGold[i].id]; 
                }
            }
            loader = new THREE.GLTFLoader();
            // populate dict first so load can be async
            for (var i = 0; i < newGold.length; i++) {
                gold[newGold[i].id] = {
                    model: null,
                    data: newGold[i]
                };
            }
            newGold.forEach(function(item, i) {
                loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                    scene.add(gltf.scene);
                    var ship = gltf.scene.children[0];
                    ship.scale.setScalar(1);
                    ship.position.x = newGold[i].x;
                    ship.position.y = 0;
                    ship.position.z = newGold[i].z;
                    gold[newGold[i].id] = {
                        model: ship,
                        data: newGold[i],
                        scene: gltf.scene
                    };
                });
            });
            for (var id in deleteGold) {
                console.log(gold[id].scene);
                scene.remove(gold[id].scene);
                delete gold[id];
            }
            // cannonBall rendering
            var newBalls = [];
            var deleteBalls = Object.assign({}, cannonBalls);;
            for (var i = 0; i < visibleBalls.length; i++) {
                if (!(visibleBalls[i].id in cannonBalls)) {
                    newBalls.push(visibleBalls[i]);
                }
                else {
                    if (cannonBalls[visibleBalls[i].id].model) {
                        cannonBalls[visibleBalls[i].id].model.position.x = visibleBalls[i].x;
                        cannonBalls[visibleBalls[i].id].model.position.z = visibleBalls[i].z;
                    }
                    delete deleteBalls[visibleBalls[i].id]; 
                }
            }
            loader = new THREE.GLTFLoader();
            // populate dict first so load can be async
            for (var i = 0; i < newBalls.length; i++) {
                cannonBalls[newBalls[i].id] = {
                    model: null,
                    data: newBalls[i]
                };
            }
            newBalls.forEach(function(item, i) {
                loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                    scene.add(gltf.scene);
                    var ship = gltf.scene.children[0];
                    ship.scale.setScalar(1);
                    ship.position.x = newBalls[i].x;
                    ship.position.y = 0;
                    ship.position.z = newBalls[i].z;
                    cannonBalls[newBalls[i].id] = {
                        model: ship,
                        data: newBalls[i],
                        scene: gltf.scene
                    };
                });
            });
            for (var id in deleteBalls) {
                console.log(cannonBalls[id].scene);
                scene.remove(cannonBalls[id].scene);
                delete cannonBalls[id];
            }

        }
        if (playerShip) {
            setCamera(playerShip.position.x, 1000, playerShip.position.z);
            setOrbit();
        }
        /*
        var playerData;
        for(var i =0; i< userData.length; i++) {
            if(typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        if(global.playerType == 'player') {
            var xoffset = player.x - playerData.x;
            var yoffset = player.y - playerData.y;

            player.x = playerData.x;
            player.y = playerData.y;
            player.hue = playerData.hue;
            player.massTotal = playerData.massTotal;
            player.cells = playerData.cells;
            player.xoffset = isNaN(xoffset) ? 0 : xoffset;
            player.yoffset = isNaN(yoffset) ? 0 : yoffset;
        }
        users = userData;
        foods = foodsList;
        viruses = virusList;
        fireFood = massList;
        */
        
    });
    
    socket.on('gameSetup', function(data, shipsData) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        //Load Model
        loader = new THREE.GLTFLoader();
        shipsData.forEach(function(item, i) {
            loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                scene.add(gltf.scene);
                var ship = gltf.scene.children[0];
                ship.scale.setScalar(10);
                ship.position.x = 0;
                ship.position.y = 0;
                ship.position.z = 0;
                if (shipsData[i].id == socket.id) {
                    playerShip = ship;
                }
                ships[shipsData[i].id] = {
                    model: ship,
                    data: shipsData[i],
                    scene: gltf.scene
                };
            });
        });
    });


    socket.on('playerJoin', function (newShip) {
        if (loader) {
            loader.load("./Models/glTF/ship_light.gltf", function (gltf) {
                scene.add(gltf.scene);
                var ship = gltf.scene.children[0];
                ship.scale.setScalar(10);
                ship.position.x = 0;
                ship.position.y = 0;
                ship.position.z = 0;
                ships[newShip.id] = {
                    model: ship,
                    data: newShip,
                    scene: gltf.scene
                };
            });
        }
    });

    /*
    socket.on('playerDied', function (data) {
        //window.chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'An unnamed cell' : data.name) + '</b> was eaten.');
    });

    socket.on('playerDisconnect', function (data) {
        //window.chat.addSystemLine('{GAME} - <b>' + (data.name.length < 1 ? 'An unnamed cell' : data.name) + '</b> disconnected.');
    });

    socket.on('leaderboard', function (data) {
        leaderboard = data.leaderboard;
        var status = '<span class="title">Leaderboard</span>';
        for (var i = 0; i < leaderboard.length; i++) {
            status += '<br />';
            if (leaderboard[i].id == player.id){
                if(leaderboard[i].name.length !== 0)
                    status += '<span class="me">' + (i + 1) + '. ' + leaderboard[i].name + "</span>";
                else
                    status += '<span class="me">' + (i + 1) + ". An unnamed cell</span>";
            } else {
                if(leaderboard[i].name.length !== 0)
                    status += (i + 1) + '. ' + leaderboard[i].name;
                else
                    status += (i + 1) + '. An unnamed cell';
            }
        }
        //status += '<br />Players: ' + data.players;
        document.getElementById('status').innerHTML = status;
    });

    socket.on('serverMSG', function (data) {
        window.chat.addSystemLine(data);
    });

    // Chat.
    socket.on('serverSendPlayerChat', function (data) {
        window.chat.addChatLine(data.sender, data.message, false);
    });

    

    // Death.
    socket.on('RIP', function () {
        global.gameStart = false;
        global.died = true;
        window.setTimeout(function() {
            document.getElementById('gameAreaWrapper').style.opacity = 0;
            document.getElementById('startMenuWrapper').style.maxHeight = '1000px';
            global.died = false;
            if (global.animLoopHandle) {
                window.cancelAnimationFrame(global.animLoopHandle);
                global.animLoopHandle = undefined;
            }
        }, 2500);
    });

    socket.on('kick', function (data) {
        global.gameStart = false;
        reason = data;
        global.kicked = true;
        socket.close();
    });

    socket.on('virusSplit', function (virusCell) {
        socket.emit('2', virusCell);
        reenviar = false;
    });
    */
}

function init() {
    var type = "player";
    if (!socket) {
        socket = io('http://localhost:3000', {query:"type=" + type});
        setupSocket(socket);
    }
    socket.emit('respawn');

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
    const far = 20000;

    //Camera setup
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 500, 0);

    x = camera.position.x;
    y = camera.position.y;
    z = camera.position.z;

    const ambient = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(0, 50, 0);
    scene.add(light);

    // skybox
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Front.bmp"
    );
    let texture_bk = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Back.bmp"
    );
    let texture_up = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Top.bmp"
    );
    let texture_dn = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Bottom.bmp"
    );
    let texture_rt = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Right.bmp"
    );
    let texture_lf = new THREE.TextureLoader().load(
        "./skybox/Daylight_Box_Left.bmp"
    );

    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));

    for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

    let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // Add limits to zoom in and zoom out distance
    orbitControls.maxDistance = 1050;
    orbitControls.minDistance = 505;
    orbitControls.maxPolarAngle = Math.PI/2 - Math.PI/16;

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
        transparent: true,
    });
    let oceanGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
    let ocean = new THREE.Mesh(oceanGeometry, material);

    //
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);
}

// Changes volume of background noise when user interacts with slider
function changeVolume(amount) {
    var audioobject = document.getElementsByTagName("audio")[0];
    audioobject.volume = amount;
}

// Add event listener for keypresses. When keypress dectected keyboard function is called
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
    // Switch statement to move the ship dependent on the key press.
    switch (event.key) {
        case "w":
            socket.emit("1");
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
    if (event.keyCode == 32) {
        socket.emit("fire");
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
        playerShip.position.x,
        playerShip.position.y,
        playerShip.position.z
    );
}

function animate() {
    socket.emit("0", moveForward, moveBackward, moveLeft, moveRight);
    console.log("emitting 0");
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;

    x = camera.position.x;
    y = camera.position.y;
    z = camera.position.z;

    // use keyboard inputs to update player state
    if (playerShip) {
        if (moveForward) {
            console.log("W");
            z -= speed;
            setOrbit();
        }
        if (moveBackward) {
            console.log("S");
            z += speed;
            setOrbit();
        }
        if (moveLeft) {
            console.log("A");
            x -= speed;
            setOrbit();
        }
        if (moveRight) {
            console.log("D");
            x += speed;
            setOrbit();
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
