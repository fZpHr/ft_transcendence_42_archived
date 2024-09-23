import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";



class CappedTorusGeometry extends THREE.TorusGeometry {
	constructor(radius, tube, radialSegments, tubularSegments, arc) {
		super(radius, tube, radialSegments, tubularSegments, arc);
		// caps
		let capStart = new THREE.CircleGeometry(tube, radialSegments)
			.rotateX(Math.PI * 0.5)
			.translate(radius, 0, 0);
		let capEnd = new THREE.CircleGeometry(tube, radialSegments)
			.rotateX(-Math.PI * 0.5)
			.translate(radius, 0, 0)
			.rotateZ(arc);
		let mainG = mergeGeometries([this, capStart, capEnd], true);
		this.start = capStart;
		this.end = capEnd;
		this.copy(mainG);
	}
}

class CustomPaddle {
	constructor(game, plateau) {
		this.game = game;
		this.scene = game.scene;
		this.renderer = game.renderer;
		this.camera = game.camera;
		this.group = new THREE.Group();
		this.group_left = new THREE.Group();
		this.group_right = new THREE.Group();

		this.move_angle = 0.01;
		this.cameraAngle = 0;
		this.cameraDistance = 16 / 1.5;
		this.cameraHeight = 16 / 1.5;
		this.move_cam = false;
		this.toggle_cam = false;


		this.geo = { radius: 41, tube: 1.1, radialSegments: 32, tubularSegments: 200, arc: Math.PI / 6 };
		this.material = {
			color: 0xffffff, transparent: false, opacity: 0.8, wireframe: false, side: THREE.FrontSide, roughness: 0.1, metalness: 0, clearcoat: 1.0,
			clearcoatRoughness: 1.0, emissive: 0xffffff, emissiveIntensity: 100
		};
		this.pos_left = { y: 2, angleX: - Math.PI / 2, angleZ: Math.PI - (Math.PI / 12) };
		this.pos_right = { y: 2, angleX: -Math.PI / 2, angleZ: 0 - (Math.PI / 12) };

		this.paddle_left = {
			physic: undefined,
			light: {
				up: undefined,
				down: undefined
			}
		};

		this.paddle_right = {
			physic: undefined,
			light: {
				up: undefined,
				down: undefined
			}
		};

		this.light = {
			color: 0x00ffff,
			intensity: 200,
			THREEcolor: undefined
		}

		this.THREEcolor = undefined;
		this.showball = false;
		this.showplateau = false;
	}

	async init() {
		return new Promise(async (resolve, reject) => {
			await this.createPaddle();
			resolve(true);
		});
	}

	async createLeft() {
		return new Promise(async (resolve, reject) => {
			this.paddle_left.physic = new THREE.Mesh(this.paddleGeo, this.paddleMaterial);

			this.paddle_left.physic.position.y = this.pos_left.y;
			this.paddle_left.physic.rotateX(this.pos_left.angleX);
			this.paddle_left.physic.rotateZ(this.pos_left.angleZ);

			this.paddle_left.light.up = new THREE.PointLight(this.light.color, this.light.intensity);
			this.paddle_left.light.up.position.set(this.geo.radius * Math.cos(this.geo.arc / 2), 2, this.geo.radius * Math.sin(this.geo.arc / 2));

			this.paddle_left.light.down = new THREE.PointLight(this.light.color, this.light.intensity);
			this.paddle_left.light.down.position.set(this.geo.radius * Math.cos(-this.geo.arc / 2), 2, this.geo.radius * Math.sin(-this.geo.arc / 2));

			this.group_left.add(this.paddle_left.physic);
			this.group_left.add(this.paddle_left.light.up);
			this.group_left.add(this.paddle_left.light.down);
			this.group.add(this.group_left);
			resolve(true);
		})
	};

	async createRight() {
		return new Promise(async (resolve, reject) => {
			this.paddle_right.physic = new THREE.Mesh(this.paddleGeo, this.paddleMaterial);

			this.paddle_right.physic.position.y = this.pos_right.y;
			this.paddle_right.physic.rotateX(this.pos_right.angleX);
			this.paddle_right.physic.rotateZ(this.pos_right.angleZ);

			this.paddle_right.light.up = new THREE.PointLight(this.light.color, this.light.intensity);
			this.paddle_right.light.up.position.set(this.geo.radius * -Math.cos(this.geo.arc / 2), 2, this.geo.radius * -Math.sin(this.geo.arc / 2));

			this.paddle_right.light.down = new THREE.PointLight(this.light.color, this.light.intensity);
			this.paddle_right.light.down.position.set(this.geo.radius * -Math.cos(-this.geo.arc / 2), 2, this.geo.radius * -Math.sin(-this.geo.arc / 2));

			this.group_right.add(this.paddle_right.physic);
			this.group_right.add(this.paddle_right.light.up);
			this.group_right.add(this.paddle_right.light.down);
			this.group.add(this.group_right);


			// this.paddle_right.physic.geometry.computeBoundingSphere();
			// console.log(this.paddle_right.physic.geometry.boundingSphere);
			resolve(true);
		})
	};

	async createPaddle() {
		return new Promise(async (resolve, reject) => {
			this.paddleGeo = new THREE.TorusGeometry(this.geo.radius, this.geo.tube, this.geo.radialSegments, this.geo.tubularSegments, this.geo.arc);
			this.paddleMaterial = new THREE.MeshPhysicalMaterial({
				color: this.material.color, transparent: this.material.transparent, opacity: this.material.opacity, wireframe: this.material.wireframe,
				side: this.material.side, roughness: this.material.roughness, metalness: this.material.metalness, clearcoat: this.material.clearcoat,
				clearcoatRoughness: this.material.clearcoatRoughness, emissive: this.material.emissive, emissiveIntensity: this.material.emissiveIntensity
			});
			await this.createLeft();
			await this.createRight();

			resolve(true);
		});
	}

	async updateLeft(geo) {
		return new Promise(async (resolve, reject) => {
			this.paddle_left.physic.geometry.dispose();
			this.paddle_left.physic.geometry = geo;
			if (this.THREEcolor != undefined) {
				this.paddle_left.physic.material.color = this.THREEcolor;
				this.paddle_left.physic.material.emissive = this.THREEcolor;
			}
			this.paddle_left.physic.material.emissiveIntensity = this.material.emissiveIntensity;
			if (this.light.THREEcolor != undefined) {
				this.paddle_left.light.up.color = this.light.THREEcolor;
				this.paddle_left.light.down.color = this.light.THREEcolor;
			}
			this.paddle_left.light.up.intensity = this.light.intensity;
			this.paddle_left.light.down.intensity = this.light.intensity;
			// this.paddle_left.light.down.position.set(this.geo.radius * Math.cos(-Math.PI / 12 + this.geo.arc), 2, this.geo.radius * Math.sin(-Math.PI / 12 + this.geo.arc));
			resolve(true);
		});
	}

	async updateRight(geo) {
		return new Promise(async (resolve, reject) => {
			this.paddle_right.physic.geometry.dispose();
			this.paddle_right.physic.geometry = geo;
			if (this.THREEcolor != undefined) {
				this.paddle_right.physic.material.color = this.THREEcolor;
				this.paddle_right.physic.material.emissive = this.THREEcolor;
			}
			this.paddle_right.physic.material.emissiveIntensity = this.material.emissiveIntensity;
			if (this.light.THREEcolor != undefined) {
				this.paddle_right.light.up.color = this.light.THREEcolor;
				this.paddle_right.light.down.color = this.light.THREEcolor;
			}
			this.paddle_right.light.up.intensity = this.light.intensity;
			this.paddle_right.light.down.intensity = this.light.intensity;

			this.paddle_right.physic.geometry.computeBoundingSphere();
			console.log(this.paddle_right.physic.geometry.boundingSphere);
			
			this.paddle_right.light.down.position.set(this.geo.radius * -Math.cos(-Math.PI / (1/this.paddle_right.physic.geometry.boundingSphere.radius)), 2, this.geo.radius * -Math.sin(-Math.PI / (1/this.paddle_right.physic.geometry.boundingSphere.radius)));
			resolve(true);
		});
	}

	async updatePaddle() {
		return new Promise(async (resolve, reject) => {
			let geo = new THREE.TorusGeometry(this.geo.radius, this.geo.tube, this.geo.radialSegments, this.geo.tubularSegments, this.geo.arc);
			await this.updateLeft(geo);
			await this.updateRight(geo);
			resolve(true);
		});
	}

	rendering = (async () => {
		if (this.move_cam) {
			this.cameraAngle += this.move_angle;
			this.camera.position.x = this.cameraDistance * Math.sin(this.cameraAngle);
			this.camera.position.z = this.cameraDistance * Math.cos(this.cameraAngle);
			this.camera.position.y = this.cameraHeight;
			this.camera.lookAt(this.group.position)
		}

		this.rotatePaddle();

		this.toggle_cam == true ? this.camera.lookAt(this.group.position) : this.camera.lookAt(0, 1, 0);
		this.renderer.render(this.scene, this.camera);
	}).bind(this);

	async rotatePaddle() {
		// this.group_left.rotateY(0.01);
		// this.group_right.rotateY(0.01);
	}
}

export {
	CustomPaddle
};


