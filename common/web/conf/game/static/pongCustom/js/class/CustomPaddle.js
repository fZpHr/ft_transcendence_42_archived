import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';

class CustomPaddle {
	constructor(game, plateau) {
		this.paddle3D = new THREE.Mesh(paddle.paddleGeo, paddle.paddleMaterial);

        this.move_right = false;
        this.move_left = false;

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
        this.initPos(limits.position_up, limits.lights.position_up, this.limit_up.physic, limits.lights.position_up.radius, this.limit_up.light);
        this.initPos(limits.position_down, limits.lights.position_down, this.limit_down.physic, limits.lights.position_down.radius, this.limit_down.light);
	}

	async init() {
		return new Promise(async (resolve, reject) => {
			await this.createPaddle();
			resolve(true);
		});
	}

	async createPaddle() {
		return new Promise(async (resolve, reject) => {
			
		});
	}

	async updatePlateau() {
		
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


