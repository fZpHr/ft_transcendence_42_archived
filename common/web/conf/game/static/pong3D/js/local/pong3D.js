import * as THREE from 'three';
import { Plateau } from "./class/plateau.js"
import { Ball } from "./class/ball.js"
import { Game } from './class/games.js'
import { Player } from './class/player.js'
// import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/RGBELoader.js';

async function startGame(player1, player2, nameBord)
{
    let element = [];
    let game = new Game();
    
    let ground = new Plateau(
        { radius: 40, segments: 64, },
        { color: 0xb5b5b5 },
        { color: 0x000000, emissive: 0x000000, emissiveIntensity: 200, opacity: 0.5 },
        { radius: 41, tube: 1, radialSegments: 32, tubularSegments: 200 },
        { color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 200, opacity: 0.5, roughness: 0.1, metalness: 1 }
    );
    
    let player_1 = new Player(
        { radius: 41, tube: 1.1, radialSegments: 32, tubularSegments: 200, arc: Math.PI / 6 },
        { color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 100 },
        { y: 1, angleX: - Math.PI / 2, angleZ: Math.PI - (Math.PI / 12) },
        {
            radius: 1, tube: 1.1, radialSegments: 32, tubularSegments: 200,
            arc: 2 * Math.PI, color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0.1, emissive: 0xffffff,
            position_up: {
                x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
                y: 1,
                z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1
            },
            position_down: {
                x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
                y: 1,
                z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1,
            },
            lights: {
                color: 0x00ffff,
                intensity: 250,
                position_up: {
                    x: 41 * -Math.cos(Math.PI / 12),
                    y: 1,
                    z: 41 * -Math.sin(Math.PI / 12),
                    radius: -1
                },
                position_down: {
                    x: 41 * -Math.cos(Math.PI / 12),
                    y: 1,
                    z: 41 * -Math.sin(-Math.PI / 12),
                    radius: 1
                }
            }
        },
        { up: parseInt(player1.ctrl_up), down: parseInt(player1.ctrl_down) },
        { name: player1.name, img: player1.img }
    )
    let player_2 = new Player(
        { radius: 41, tube: 1.1, radialSegments: 32, tubularSegments: 200, arc: Math.PI / 6 },
        { color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0, emissive: 0xffffff, emissiveIntensity: 100 },
        { y: 1, angleX: -Math.PI / 2, angleZ: 0 - (Math.PI / 12) },
        {
            radius: 1, tube: 1.1, radialSegments: 32, tubularSegments: 200,
            arc: 2 * Math.PI, color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0.1, emissive: 0xffffff,
            position_up: {
                x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
                y: 1,
                z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1
            },
            position_down: {
                x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
                y: 1,
                z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1
            },
            lights: {
                color: 0x00ffff,
                intensity: 250,
                position_up: {
                    x: 41 * Math.cos(Math.PI / 12),
                    y: 1,
                    z: 41 * Math.sin(Math.PI / 12),
                    radius: 1
                },
                position_down: {
                    x: 41 * Math.cos(Math.PI / 12),
                    y: 1,
                    z: 41 * Math.sin(-Math.PI / 12),
                    radius: -1
                }
            }
        },
        { up: parseInt(player2.ctrl_up), down: parseInt(player2.ctrl_down) },
        { name: player2.name, img: player2.img }
    )
    
    const sphere = new Ball(
        {
            radius: 0.5, widthSegments: 32, heightSegments: 32, color: 0x00ffff, emissive: 0x00ffff,
            emissiveIntensity: 30, roughness: 0.7, metalness: 0.7
        },
        { radius: 0.55, tube: 0.1, radialSegments: 32, tubularSegments: 200 },
        { color: 0x000000, opacity: 0.8, roughness: 0.1, metalness: 0, emissive: 0x000000, emissiveIntensity: 50 },
        { color: 0x00ffff, intensity: 150 },
        { nbrTorus: 3 },
        {
            coefficientOfRestitution: 1.05, randomnessFactor: 0.4,
            lights: { color: 0xff0000, intensity: 200, x: 0, y: -1, z: 0 }
        },
        { max: 0.5, min: -0.5, speed: 0.1 }
    );
    
    
    game.players.push(player_1);
    game.players.push(player_2);
    await game.setName(nameBord);
    
    let sphereGroup = new THREE.Group();
    let limits = new THREE.Group();
    let paddle_1_grp = new THREE.Group();
    let paddle_2_grp = new THREE.Group();
    
    game.floor.add(ground.groundMirror);
    game.floor.add(ground.plateau);
    game.floor.add(ground.circle3D);
    game.floor.add(limits);
    game.floor.add(paddle_1_grp);
    game.floor.add(paddle_2_grp);
    game.floor.add(sphere.collisionLight);
    game.floor.add(game.nameMesh);
    game.scene.add(sphereGroup);
    
    element.push(game.floor);
    element.push(sphereGroup);
    element.push(game.nameMesh);

    
    for (const data of sphere.torus)
        sphereGroup.add(data);
    sphereGroup.add(sphere.sphere3D);
    sphereGroup.add(sphere.light);
    
    limits.add(player_1.paddle.limit_up.physic);
    limits.add(player_1.paddle.limit_down.physic);
    limits.add(player_2.paddle.limit_up.physic);
    limits.add(player_2.paddle.limit_down.physic);
    
    paddle_1_grp.add(player_1.paddle.paddle3D);
    paddle_1_grp.add(player_1.paddle.limit_up.light);
    paddle_1_grp.add(player_1.paddle.limit_down.light);
    paddle_2_grp.add(player_2.paddle.paddle3D);
    paddle_2_grp.add(player_2.paddle.limit_up.light);
    paddle_2_grp.add(player_2.paddle.limit_down.light);
    
    player_1.group = paddle_1_grp;
    player_2.group = paddle_2_grp;
    sphere.group = sphereGroup;
    
    game.ball = sphere;
    
    createLights();

	let backGroundTexture = new THREE.CubeTextureLoader().load([
		'/static/pong3D/js/local/img/px_eso0932a.jpg',
		'/static/pong3D/js/local/img/nx_eso0932a.jpg',
		'/static/pong3D/js/local/img/py_eso0932a.jpg',
		'/static/pong3D/js/local/img/ny_eso0932a.jpg',
		'/static/pong3D/js/local/img/pz_eso0932a.jpg',
		'/static/pong3D/js/local/img/nz_eso0932a.jpg',
	])
	game.scene.background = backGroundTexture


    game.renderer.setAnimationLoop(animate);


    function animate() {
        sphere.moveTorus(0.05);
        game.handleCamera();
        if (game.render)
        {
            sphere.move();
            game.checkCollision(ground);
            game.movePaddles();
        }
        game.renderer.render(game.scene, game.camera.camera3D);
    }
    
    async function createLights() {
    
        const numLights = 32;
        const lightRadius = 40;
        const lightColor = 0x00ffff;
        const lightIntensity = 150;
    
        for (let i = 0; i < numLights; i++) {
            const angle = (i / numLights) * 2 * Math.PI;
            const x = lightRadius * Math.cos(angle);
            const z = lightRadius * Math.sin(angle);
            const light = new THREE.PointLight(lightColor, lightIntensity);
            light.position.set(x, 1, z);
            game.floor.add(light);
        }
        for (let i = 1; i < 16; i += 2) {
            const angle = i * Math.PI / 4;
            const x = lightRadius * Math.cos(angle);
            const z = lightRadius * Math.sin(angle);
            const light = new THREE.PointLight(lightColor, lightIntensity);
            light.position.set(x, 1, z);
            game.floor.add(light);
        }
    }
    
    
    async function onWindowResize() {
        game.camera.camera3D.aspect = window.innerWidth / window.innerHeight;
        game.camera.camera3D.updateProjectionMatrix();
    
        game.renderer.setSize(window.innerWidth, window.innerHeight);
    
        ground.groundMirror.getRenderTarget().setSize(
            window.innerWidth * window.devicePixelRatio,
            window.innerHeight * window.devicePixelRatio
        );
    }
    window.addEventListener('resize', onWindowResize());

    document.addEventListener('htmx:beforeSwap', function(event) {
        // remove all event listener
        window.removeEventListener('resize', onWindowResize);
        game.renderer.setAnimationLoop(null);
        game.render = false;
        for (const data of element)
            game.scene.remove(data);
    }, {once: true});
}

export {
    startGame
}