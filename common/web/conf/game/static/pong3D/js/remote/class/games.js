import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Cam } from "./cam.js"
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

class Game {
	constructor() {

		this.renderer;
		this.scene;
		this.floor = new THREE.Group();
		this.render = true;

		this.camera = new Cam({ x: 0, y: 50, z: 100 });
		this.cameraControls;

		this.loader = new FontLoader();
		this.font;

		this.scoreGeometry;
		this.scoreMaterial;
		this.scoreMesh;

		this.distanceFromCenter = 0;
		this.players = [];
		this.ball;

		this.init();
	}

	async init() {
		this.handleEvent();
		this.setScore(0, 0);
	}

	async setRender() {
		const container = document.getElementById('container-pong3D');
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(this.renderer.domElement);
		this.setScene();
		this.renderer.setAnimationLoop(this.animate);
	}

	async setScene() {
		this.scene = new THREE.Scene();
		this.scene.add(this.floor);
		this.scene.add(this.ball.group);

		this.cameraControls = new OrbitControls(this.camera.camera3D, this.renderer.domElement);
		this.cameraControls.update();
	}

	async handleEvent() {
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);
	}

	async setName(str) {
		return new Promise(async (resolve, reject) => {
			let load = (async function (font) {
				return new Promise(async (resolve, reject) => {
					this.nameGeo = new TextGeometry(`${str}`, {
						font: font,
						size: 5,
						depth: 0.4,
						curveSegments: 24,
						bevelEnabled: true,
						bevelThickness: 0.05,
						bevelSize: 0.05,
						bevelSegments: 3
					});
					this.nameMaterial = new THREE.MeshPhysicalMaterial({
						color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 200, clearcoat: 1.0,
						clearcoatRoughness: 0.0,
						roughness: 0.7,
						metalness: 0.7
					});
					this.nameMesh = new THREE.Mesh(this.nameGeo, this.nameMaterial);
					this.nameGeo.computeBoundingBox();
					if (this.nameGeo.boundingBox) {
						this.nameGeo.translate(-this.nameGeo.boundingBox.max.x / 2, this.camera.camera3D.position.y / 4, -40);
					}
					this.font = font;
					resolve(true);
				});
			}).bind(this);
			let font = await this.loader.loadAsync('/static/pong3D/font/font.json')
			await load(font);
			resolve(true);
		});
	}

	async setScore() {
		return new Promise(async (resolve, reject) => {
			let load = (async function (font) {
				this.scoreGeometry = new TextGeometry(`${this.players[0].score.toString()} - ${this.players[1].score.toString()}`, {
					font: font,
					size: 5,
					depth: 0.4,
					curveSegments: 24,
					bevelEnabled: true,
					bevelThickness: 0.05,
					bevelSize: 0.05,
					bevelSegments: 3
				});
				this.scoreMaterial = new THREE.MeshPhysicalMaterial({
					color: 0x00ffff, emissive: 0x00ffff, emissiveIntensity: 200, clearcoat: 1.0,
					clearcoatRoughness: 0.0,
					roughness: 0.7,
					metalness: 0.7
				});
				this.scoreMesh = new THREE.Mesh(this.scoreGeometry, this.scoreMaterial);
				this.scoreGeometry.computeBoundingBox();
				if (this.scoreGeometry.boundingBox) {
					this.scoreGeometry.translate(-this.scoreGeometry.boundingBox.max.x / 2, this.camera.camera3D.position.y / 4, -40);
				}
				this.font = font;
				this.floor.add(this.scoreMesh);
			}).bind(this);
			this.loader.load('/static/pong3D/font/font.json', (font) => load(font));
			resolve(true);
		});
	}

	handleKeyUp = (async (event) => {
		console.log(this.players[0].id)
		switch (event.keyCode) {
			// case this.players[1].controls.up:
			//     this.players[1].paddle.move_right = false;
			//     break;
			// case this.players[1].controls.down:
			//     this.players[1].paddle.move_left = false;
			//     break;
			// case this.players[0].controls.up:
			//     this.players[0].paddle.move_right = false;
			//     break;
			// case this.players[0].controls.down:
			//     this.players[0].paddle.move_left = false;
			//     break;
			case 9:
				this.updateScore();
				break;
			case 32:
				break;
		}
	}).bind(this);

	handleKeyDown = (async (event) => {
		switch (event.keyCode) {
			// case this.players[1].controls.up:
			//     this.players[1].paddle.move_right = true;
			//     break;
			// case this.players[1].controls.down:
			//     this.players[1].paddle.move_left = true;
			//     break;
			// case this.players[0].controls.up:
			//     this.players[0].paddle.move_right = true;
			//     break;
			// case this.players[0].controls.down:
			//     this.players[0].paddle.move_left = true;
			//     break;
			case 9:
				this.camera.focus_ball = this.camera.focus_ball == false ? true : false;
				if (this.camera.focus_ball == false) {
					this.camera.camera3D.position.set(this.camera.start_pos.x, this.camera.start_pos.y, this.camera.start_pos.z);
					this.camera.camera3D.rotation.set(0, 0, 0);
					this.camera.camera3D.lookAt(this.scene.position);
				}
				break;
			case 32:
				break;
		}
	}).bind(this);

	async updateScore() {
		this.floor.remove(this.scoreMesh)
		this.scoreGeometry = new TextGeometry(`${this.players[0].score.toString()} - ${this.players[1].score.toString()}`, {
			font: this.font,
			size: 5,
			depth: 0.4,
			curveSegments: 24,
			bevelEnabled: true,
			bevelThickness: 0.05,
			bevelSize: 0.05,
			bevelSegments: 3
		});
		this.scoreMesh = new THREE.Mesh(this.scoreGeometry, this.scoreMaterial);
		this.scoreGeometry.computeBoundingBox();
		if (this.scoreGeometry.boundingBox) {
			this.scoreGeometry.translate(-this.scoreGeometry.boundingBox.max.x / 2, this.camera.camera3D.position.y / 4, -40);
		}
		this.floor.add(this.scoreMesh);
	}

	async handleCamera() {
		if (this.camera.focus_ball)
			this.camera.camera3D.lookAt(this.ball.group.position);
	}

	async checkCollision(ground) {
		let distanceFromCenter = Math.sqrt(this.ball.group.position.x * this.ball.group.position.x + this.ball.group.position.z * this.ball.group.position.z);;
		this.distanceFromCenter = distanceFromCenter;
		// if ((distanceFromCenter + this.ball.radius >= ground.groundRadius)) {
		//     await this.ball.bounce(ground);
		//     if (this.ball.group.position.x >= this.players[1].paddle.limit_up.physic.position.x && (this.players[1].paddle.limit_up.physic.position.z >= this.ball.group.position.z && this.players[1].paddle.limit_down.physic.position.z <= this.ball.group.position.z)) {
		//         let limitY1 = 41 * Math.sin(Math.PI / 12 - this.players[1].group.rotation.y);
		//         let limitY2 = 41 * Math.sin(-Math.PI / 12 - this.players[1].group.rotation.y);
		//         let minY = Math.min(limitY1, limitY2);
		//         let maxY = Math.max(limitY1, limitY2);
		//         if (!(this.ball.group.position.z >= minY && this.ball.group.position.z <= maxY)) {
		//             this.ball.resetCenter(this.ball.bouncing.angle, this.ball.bouncing.speed);
		//             this.players[0].score++;
		//             this.updateScore(this.players[0].score, this.players[1].score);
		//         }
		//     }

		//     if ((this.ball.group.position.x <= this.players[0].paddle.limit_up.physic.position.x && this.ball.group.position.x <= 0) && (this.players[0].paddle.limit_up.physic.position.z >= this.ball.group.position.z && this.players[0].paddle.limit_down.physic.position.z <= this.ball.group.position.z)) {
		//         let limitY1 = 41 * -Math.sin(Math.PI / 12 - this.players[0].group.rotation.y);
		//         let limitY2 = 41 * -Math.sin(-Math.PI / 12 - this.players[0].group.rotation.y);
		//         let minY = Math.min(limitY1, limitY2);
		//         let maxY = Math.max(limitY1, limitY2);
		//         if (!(this.ball.group.position.z >= minY && this.ball.group.position.z <= maxY)) {
		//             this.ball.resetCenter(this.ball.bouncing.angle, -this.ball.bouncing.speed);
		//             this.players[1].score++;
		//             this.updateScore(this.players[0].score, this.players[1].score);
		//         }
		//     }
		// }
	}

	// async movePaddles() {
	//     // if (this.players[0].paddle.move_right && (this.players[0].group.rotation.y - Math.PI / 12 > -Math.PI / 4))
	//     //     this.players[0].group.rotateY(-0.01);
	//     // if (this.players[0].paddle.move_left && (this.players[0].group.rotation.y + (Math.PI / 12)) < Math.PI / 4)
	//     //     this.players[0].group.rotateY(0.01);

	//     // if (this.players[1].paddle.move_right && (this.players[1].group.rotation.y + (Math.PI / 12)) < Math.PI / 4)
	//     //     this.players[1].group.rotateY(0.01);
	//     // if (this.players[1].paddle.move_left && this.players[1].group.rotation.y - Math.PI / 12 > -Math.PI / 4)
	//     //     this.players[1].group.rotateY(-0.01);
	// }
}

export {
	Game
}