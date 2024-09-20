import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

class CustomPlateau {
	constructor(game) {
		this.custom_ball;
		this.light = {
			intensity: 10,
			color: 0xffffff
		};
		this.intensity = 200;

		this.game = game;

		this.scene = game.scene;
		this.renderer = game.renderer;
		this.camera = game.camera;
		this.move_angle = 0.01;
		this.cameraAngle = 0;
		this.cameraDistance = 16 / 1.5;
		this.cameraHeight = 16 / 1.5;
		this.move_cam = false;
		this.toggle_cam = false;

		this.group = new THREE.Group();
		this.plateau_data = {
			color: 0x000000,
			opacity: 1,
		}
		this.wall = { 
			color: 0x00ffff,
			emissive: 0x00ffff,
			emissiveIntensity: 200,
			opacity: 0.5,
			roughness: 0.1,
			metalness: 1
		}

		this.radius = 41
		// this.init();
	}

	async init() {
		return new Promise(async (resolve, reject) => {
			await this.createPlateau();
			resolve(true);
		});
	}

	async createPlateau() {
		return new Promise(async (resolve, reject) => {
			this.mirrorGeometry = new THREE.CircleGeometry(this.radius - 1, 64);
			this.plateauGeometry = new THREE.CircleGeometry(this.radius, 64);
			// miror
			this.groundMirror = new Reflector(this.mirrorGeometry, {
				clipBias: 0.003,
				textureWidth: this.game.width * window.devicePixelRatio,
				textureHeight: this.game.height * window.devicePixelRatio,
				color: 0xb5b5b5
			});
			// flore
			this.plateauMaterial = new THREE.MeshPhysicalMaterial({
				color: this.plateau_data.color, transparent: true, opacity: this.plateau_data.opacity, wireframe: false, side: THREE.FrontSide, roughness: 0.7, metalness: 0.7, clearcoat: 1.0,
				clearcoatRoughness: 1.0,
				emissive: this.plateau_data.color, emissiveIntensity: this.intensity
			});
			this.plateau = new THREE.Mesh(this.plateauGeometry, this.plateauMaterial);
			this.cirleGeo = new THREE.TorusGeometry(this.radius, 1, 32, 200);
			this.circleMaterial = new THREE.MeshPhysicalMaterial({
				color: this.wall.color, transparent: false, opacity: this.wall.opacity, wireframe: false, side: THREE.FrontSide, roughness: this.wall.roughness, metalness: this.wall.metalness, clearcoat: 1.0,
				clearcoatRoughness: 1.0, emissive: this.wall.emissive, emissiveIntensity: this.wall.emissiveIntensity
			});
			this.circle3D = new THREE.Mesh(this.cirleGeo, this.circleMaterial);
			
			this.plateau.position.y = 10;
			this.groundMirror.position.y = 10;
			this.circle3D.position.y = 11;
			this.plateau.rotateX(- Math.PI / 2);
			this.groundMirror.rotateX(- Math.PI / 2);
			this.circle3D.rotateX(- Math.PI / 2);

			this.group.add(this.groundMirror);
			this.group.add(this.plateau);
			this.group.add(this.circle3D);
			resolve(true);
		});
	}

	async updatePlateau() {
		this.group.remove(this.groundMirror)
		this.group.remove(this.plateau);
		this.group.remove(this.circle3D);
		await this.createPlateau();
	}

	rendering = (async () => {
		if (this.move_cam) {
			this.cameraAngle += this.move_angle;
			this.camera.position.x = this.cameraDistance * Math.sin(this.cameraAngle);
			this.camera.position.z = this.cameraDistance * Math.cos(this.cameraAngle);
			this.camera.position.y = this.cameraHeight;
			this.camera.lookAt(this.group.position)
		}
		this.toggle_cam == true ? this.camera.lookAt(this.group.position) : this.camera.lookAt(0, 1, 0);
		this.renderer.render(this.scene, this.camera);
	}).bind(this);
}

export {
	CustomPlateau
};


