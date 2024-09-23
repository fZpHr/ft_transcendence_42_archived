import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

class CustomPlateau {
	constructor(game) {
		this.custom_ball;
		this.light = {
			intensity: 150,
			color: 0x00ffff,
			THREEcolor: undefined
		};

		this.game = game;

		this.scene = game.scene;
		this.renderer = game.renderer;
		this.camera = game.camera;
		this.move_angle = 0.01;
		this.cameraAngle = 0;
        this.move_cam = true;
		this.toggle_cam = false;

		this.group = new THREE.Group();
		this.plateau_data = {
			color: 0x000000,
			THREEcolor: undefined,
			opacity: 0.5,
			intensity: 200
		}
		this.wall = {
			color: 0x00ffff,
			THREEcolor: undefined,
			emissive: 0x00ffff,
			emissiveIntensity: 200,
			opacity: 0.5,
			roughness: 0.1,
			metalness: 1
		}

		this.lights = [];
		this.radius = 41;
		this.cameraDistance = (this.radius * 2) / 1.5;
		this.cameraHeight = (this.radius * 2) / 1.5;
		this.limits_1 = {
			radius: 1, tube: 1.1, radialSegments: 32, tubularSegments: 200,
			arc: 2 * Math.PI, color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0.1, emissive: 0xffffff,
			position_up: {
				x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
				y: 11,
				z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1
			},
			position_down: {
				x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
				y: 11,
				z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1,
			},
			lights: {
				color: 0x00ffff,
				intensity: 250,
				position_up: {
					x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
					y: 11,
					z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1,
					radius: -1
				},
				position_down: {
					x: 40 * Math.cos(Math.PI / 4) + 1 / 2,
					y: 11,
					z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1,
					radius: 1
				}
			}
		}

		this.limits_2 = {
			radius: 1, tube: 1.1, radialSegments: 32, tubularSegments: 200,
			arc: 2 * Math.PI, color: 0xffffff, opacity: 0.8, roughness: 0.1, metalness: 0.1, emissive: 0xffffff,
			position_up: {
				x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
				y: 11,
				z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1
			},
			position_down: {
				x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
				y: 11,
				z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1
			},
			lights: {
				color: 0x00ffff,
				intensity: 250,
				position_up: {
					x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
					y: 11,
					z: 40 * Math.sin(Math.PI / 4) + 1 / 1.1,
					radius: 1
				},
				position_down: {
					x: -(40 * Math.cos(Math.PI / 4) + 1 / 2),
					y: 11,
					z: 40 * Math.sin(-Math.PI / 4) - 1 / 1.1,
					radius: -1
				}
			}
		}
		this.boudth = {
			THREEcolor: undefined
		}
		this.limits = [];

		this.showball = false;
		this.ballDirection = new THREE.Vector3(0.2, 0, 0.2);
	}

	async init() {
		return new Promise(async (resolve, reject) => {
			await this.createPlateau();
			resolve(true);
		});
	}

	async updateMirror() {
		return new Promise(async (resolve, reject) => {
			this.groundMirror.geometry.dispose();
			this.groundMirror.geometry = new THREE.CircleGeometry(this.radius - 1, 64);
			resolve(true);
		});
	}

	async createMirror() {
		return new Promise(async (resolve, reject) => {
			this.group.remove(this.groundMirror);
			if (this.groundMirror)
				this.groundMirror.material.dispose();
			this.geometry = new THREE.CircleGeometry(this.radius - 1, 64);
			this.groundMirror = new Reflector(this.geometry, {
				clipBias: 0.003,
				textureWidth: this.game.mirrorRatio.textureWidth,
				textureHeight: this.game.mirrorRatio.textureHeight,
				color: 0xb5b5b5
			});

			this.groundMirror.position.y = 10;
			this.groundMirror.rotateX(- Math.PI / 2);
			this.group.add(this.groundMirror);
			resolve(true);
		});
	}

	async updatePlat() {
		return new Promise(async (resolve, reject) => {
			this.plateau.geometry.dispose();
			this.plateau.geometry = new THREE.CircleGeometry(this.radius - 1, 64);
			if (this.plateau_data.THREEcolor != undefined) {
				this.plateau.material.color = this.plateau_data.THREEcolor;
				this.plateau.material.emissive = this.plateau_data.THREEcolor;
			}
			this.plateau.material.opacity = this.plateau_data.opacity;
			this.plateau.emissiveIntensity = this.plateau_data.intensity;
			resolve(true);
		});
	}

	async createPlat() {
		return new Promise(async (resolve, reject) => {
			this.group.remove(this.plateau);
			if (this.plateau)
				this.plateau.material.dispose();
			this.geometry = new THREE.CircleGeometry(this.radius - 1, 64);
			this.plateauMaterial = new THREE.MeshPhysicalMaterial({
				color: this.plateau_data.color, transparent: true, opacity: this.plateau_data.opacity, wireframe: false, side: THREE.FrontSide, roughness: 0.7, metalness: 0.1, clearcoat: 1.0,
				clearcoatRoughness: 1.0,
				emissive: this.plateau_data.color, emissiveIntensity: this.plateau_data.intensity
			});
			this.plateau = new THREE.Mesh(this.geometry, this.plateauMaterial);

			this.plateau.position.y = 10;
			this.plateau.rotateX(- Math.PI / 2);
			this.group.add(this.plateau);
			resolve(true);
		});
	}

	async updateBorder() {
		return new Promise(async (resolve, reject) => {
			this.circle3D.geometry.dispose();
			this.circle3D.geometry = new THREE.TorusGeometry(this.radius, 1, 32, 200);
			if (this.wall.THREEcolor != undefined) {
				this.circle3D.material.color = this.wall.THREEcolor;
				this.circle3D.material.emissive = this.wall.THREEcolor;
			}
			this.circle3D.material.emissiveIntensity = this.wall.emissiveIntensity;
			resolve(true);
		});
	}

	async createBorder() {
		return new Promise(async (resolve, reject) => {
			this.group.remove(this.circle3D);
			if (this.circle3D)
				this.circle3D.material.dispose();
			this.cirleGeo = new THREE.TorusGeometry(this.radius, 1, 32, 200);
			this.circleMaterial = new THREE.MeshPhysicalMaterial({
				color: this.wall.color, transparent: false, opacity: this.wall.opacity, wireframe: false, side: THREE.FrontSide, roughness: this.wall.roughness, metalness: this.wall.metalness, clearcoat: 1.0,
				clearcoatRoughness: 1.0, emissive: this.wall.color, emissiveIntensity: this.wall.emissiveIntensity
			});
			this.circle3D = new THREE.Mesh(this.cirleGeo, this.circleMaterial);

			this.circle3D.position.y = 11;
			this.circle3D.rotateX(- Math.PI / 2);
			this.group.add(this.circle3D);
			resolve(true);
		});
	}


	async updateLights() {
		return new Promise(async (resolve, reject) => {
			for (const data of this.lights) {
				data.light.position.set((this.radius) * data.angleX, 11, (this.radius) * data.angleZ);
				data.light.intensity = this.light.intensity;
				if (this.light.THREEcolor != undefined)
					data.light.color = this.light.THREEcolor;
			}
			for (const data of this.limits)
				data.light.intensity = this.light.intensity;
			resolve(true);
		});
	}

	async createLights() {
		return new Promise(async (resolve, reject) => {
			for (const data of this.lights) {
				this.group.remove(data.light);
				data.light.dispose();
			}
			const numLights = 32;

			for (let i = 0; i < numLights; i++) {
				const angle = (i / numLights) * 2 * Math.PI;
				const x = (this.radius) * Math.cos(angle);
				const z = (this.radius) * Math.sin(angle);
				const light = new THREE.PointLight(this.light.color, this.light.intensity);
				light.position.set(x, 11, z);
				this.group.add(light);
				this.lights.push({ light: light, angleX: Math.cos(angle), angleZ: Math.sin(angle) });
			}
			for (let i = 1; i < numLights / 2; i += 2) {
				const angle = i * Math.PI / 4;
				const x = (this.radius) * Math.cos(angle);
				const z = (this.radius) * Math.sin(angle);
				const light = new THREE.PointLight(this.light.color, this.light.intensity);
				light.position.set(x, 11, z);
				this.lights.push({ light: light, angleX: Math.cos(angle), angleZ: Math.sin(angle) });
				this.group.add(light);
			}
			resolve(true);
		});
	}

	async updateBoudth() {
		return new Promise(async (resolve, reject) => {
			let position = [{
				x: (this.radius - 1) * Math.cos(Math.PI / 4) + 1 / 2,
				y: 11,
				z: (this.radius - 1) * Math.sin(Math.PI / 4) + 1 / 1.1
			},
			{
				x: (this.radius - 1) * Math.cos(Math.PI / 4) + 1 / 2,
				y: 11,
				z: (this.radius - 1) * Math.sin(-Math.PI / 4) - 1 / 1.1
			},
			{
				x: -((this.radius - 1) * Math.cos(Math.PI / 4) + 1 / 2),
				y: 11,
				z: (this.radius - 1) * Math.sin(Math.PI / 4) + 1 / 1.1
			},
			{
				x: -((this.radius - 1) * Math.cos(Math.PI / 4) + 1 / 2),
				y: 11,
				z: (this.radius - 1) * Math.sin(-Math.PI / 4) - 1 / 1.1
			}]
			let i = 0;
			for (const data of this.limits) {
				data.light.position.set(position[i].x, position[i].y, position[i].z);
				data.physic.position.set(position[i].x, position[i].y, position[i].z);
				if (this.boudth.THREEcolor != undefined) {
					data.light.color = this.boudth.THREEcolor;
					data.physic.material.color = this.boudth.THREEcolor;
					data.physic.material.emissive = this.boudth.THREEcolor;
				}
				i++;
			}
			resolve(true);
		});
	}

	async createBoudth(limits) {
		return new Promise(async (resolve, reject) => {
			this.limitGeometry = new THREE.TorusGeometry(limits.radius, limits.tube, limits.radialSegments, limits.tubularSegments, limits.arc);
			this.limitMaterial = new THREE.MeshPhysicalMaterial({
				color: limits.color, transparent: false, opacity: 0.8, wireframe: false, side: THREE.FrontSide,
				roughness: limits.roughness, metalness: limits.metalness, clearcoat: 1.0,
				clearcoatRoughness: 1.0, emissive: limits.emissive
			});

			this.limit_up = {
				physic: new THREE.Mesh(this.limitGeometry, this.limitMaterial),
				light: new THREE.PointLight(limits.lights.color, limits.lights.intensity)
			}
			this.limit_down = {
				physic: new THREE.Mesh(this.limitGeometry, this.limitMaterial),
				light: new THREE.PointLight(limits.lights.color, limits.lights.intensity)
			}
			this.limits.push(this.limit_up);
			this.limits.push(this.limit_down);
			this.initPos(limits.position_up, limits.lights.position_up, this.limit_up.physic, limits.lights.position_up.radius, this.limit_up.light);
			this.initPos(limits.position_down, limits.lights.position_down, this.limit_down.physic, limits.lights.position_down.radius, this.limit_down.light);
			resolve(true);
		});
	}

	async initPos(limit_pos = { x, y, z }, lights_pos = { x, y, z }, limit, radius, lights) {
		return new Promise(async (resolve, reject) => {
			limit.position.x = limit_pos.x;
			limit.position.y = limit_pos.y;
			limit.position.z = limit_pos.z;
			lights.position.x = lights_pos.x;
			lights.position.y = lights_pos.y;
			lights.position.z = lights_pos.z;
			limit.rotateY(radius);
			this.group.add(limit);
			this.group.add(lights);
			resolve(true);
		});
	}

	async updatePlateau(element) {
		return new Promise(async (resolve, reject) => {
			switch (element) {
				case 'plateau':
					await this.updatePlat();
					break;
				case 'mirror':
					await this.updateMirror();
					break;
				case 'border':
					await this.updateBorder();
					break;
				case 'lights':
					await this.updateLights();
					break;
				case 'boudth':
					await this.updateBoudth();
					break;
				default:
					await this.createPlateau();
			}
			resolve(true);
		});
	};

	async createPlateau() {
		return new Promise(async (resolve, reject) => {
			this.circle3D == undefined ? await this.createBorder() : await this.updateBorder();
			this.groundMirror == undefined ? await this.createMirror() : await this.updateMirror();
			this.plateau == undefined ? await this.createPlat() : await this.updatePlat();
			this.lights.length == 0 ? await this.createLights() : await this.updateLights();
			this.limits.length == 0 ? (await this.createBoudth(this.limits_1), await this.createBoudth(this.limits_2)) : await this.updateBoudth();
			this.cameraDistance = (this.radius * 2) / 1.5;
			this.cameraHeight = (this.radius * 2) / 1.5;
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

		this.moveSpotLight();

		if (this.showball) 
			await this.moveBall();
		(this.toggle_cam == true && this.showball == true) ? this.camera.lookAt(this.game.Customball.group.position) : this.camera.lookAt(0, 10, 0);
		this.renderer.render(this.scene, this.camera);
	}).bind(this);

	async moveSpotLight(){
		return new Promise(async(resolve, reject)=>{
			for (const data of this.game.spotlight) {
				let x = data.target.position.x;
				let z = data.target.position.z;
				data.target.position.x = x * Math.cos(0.05) + z * Math.sin(0.05);
				data.target.position.z = z * Math.cos(0.05) - x * Math.sin(0.05);
				this.game.scene.remove(data.target);
				data.light.target = data.target;
				this.game.scene.add(data.target);
			}
			resolve(true);
		});
	}

	async moveBall(){
		return new Promise(async(resolve, reject)=>{
			if (this.game.Customball.move_torus)
				this.game.Customball.moveTorus();
			this.move();
			const distanceFromCenter = Math.sqrt(this.game.Customball.group.position.x * this.game.Customball.group.position.x + this.game.Customball.group.position.z * this.game.Customball.group.position.z);;
			if ((distanceFromCenter + this.game.Customball.radius >= (this.radius - 1))) {
				await this.bounce(distanceFromCenter);
				if (distanceFromCenter + this.game.Customball.radius > this.radius + 1)
					this.resetCenter();
			}
			resolve(true);
		});
	}

	async move() {
		this.game.Customball.group.position.x += this.ballDirection.x;
		this.game.Customball.group.position.y += this.ballDirection.y;
		this.game.Customball.group.position.z += this.ballDirection.z;
		if (this.game.Customball.group.position.y >= 20)
			this.ballDirection.y = -0.05;
		if (this.game.Customball.group.position.y - (this.game.Customball.radius / 2) == 10)
			this.ballDirection.y = 0;
	}

	async bounce(distanceFromCenter) {
		return new Promise(async (resolve, reject) => {
			const normal = this.game.Customball.group.position.clone().setY(0).normalize();
			const dotProduct = this.ballDirection.dot(normal);
			const newVelocity = this.ballDirection.clone().setY(0).sub(normal.clone().multiplyScalar(Math.abs(dotProduct * (1 + 1))));
			
			newVelocity.x += Math.abs(Math.random() * 0.2 - 0.2 / 2);
			newVelocity.z += Math.abs(Math.random() * 0.2 - 0.2 / 2);
			
			const originalMagnitude = Math.sqrt(this.ballDirection.x * this.ballDirection.x + this.ballDirection.z * this.ballDirection.z);
			const newMagnitude = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z);
			const scaleFactor = originalMagnitude / newMagnitude;
			
			newVelocity.x *= scaleFactor;
			newVelocity.z *= scaleFactor;
			if (this.ballDirection.y == 0)
				newVelocity.y = 0.05;
			else
				newVelocity.y = this.ballDirection.y;
			this.ballDirection.copy(newVelocity);

			resolve(true);
		});
	}

	async resetCenter() {
		this.game.Customball.group.position.set(0, 10 + (this.game.Customball.radius / 2), 0);
		this.ballDirection.y = 0;
	}
}

export {
	CustomPlateau
};


