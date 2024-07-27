import * as THREE from 'three';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/objects/Reflector.js';

class CustomPlateau {
	constructor(game) {
		this.custom_ball;
		this.light = {
			intensity: 10,
			color: 0xffffff
		};
		this.intensity = 10;

        this.game = game;

		this.scene = game.scene;
		this.renderer = game.renderer;
        this.camera = game.camera;
		this.move_angle = 0.01;
		this.cameraAngle = 0;
		this.cameraDistance = 16 / 1.5;
		this.cameraHeight = 16 / 1.5;
        this.move_cam = true;
		this.toggle_cam = false;

		this.floor = new THREE.Group();
		this.plateau = {
			color: 0xffffff
		}
        this.radius = 0.5
		// this.init();
	}

	async init() {
        return new Promise(async(resolve, reject)=>{
        
            resolve(true);
        });
	}

	async createPlateau() {
		return new Promise(async (resolve, reject) => {
			this.geometry = new THREE.CircleGeometry(this.radius, mirorGeometry.segments);
            this.groundMirror = new Reflector(this.geometry, {
                clipBias: 0.003,
                textureWidth: this.game.width * window.devicePixelRatio,
                textureHeight: this.game.height * window.devicePixelRatio,
                color: mirrorMaterial.color
            });

            this.plateauMaterial = new THREE.MeshPhysicalMaterial({
                color: plateauMaterial.color, transparent: true, opacity: plateauMaterial.opacity, wireframe: false, side: THREE.FrontSide, roughness: 0.7, metalness: 0.7, clearcoat: 1.0,
                clearcoatRoughness: 1.0,
                emissive: plateauMaterial.emissive, emissiveIntensity: plateauMaterial.emissiveIntensity
            });
            this.plateau = new THREE.Mesh(this.geometry, this.plateauMaterial);

            this.cirleGeo = new THREE.TorusGeometry(circleGeometry.radius, circleGeometry.tube, circleGeometry.radialSegments, circleGeometry.tubularSegments);
            this.circleMaterial = new THREE.MeshPhysicalMaterial({
                color: circleMaterial.color, transparent: false, opacity: circleMaterial.opacity, wireframe: false, side: THREE.FrontSide, roughness: circleMaterial.roughness, metalness: circleMaterial.metalness, clearcoat: 1.0,
                clearcoatRoughness: 1.0, emissive: circleMaterial.emissive, emissiveIntensity: circleMaterial.emissiveIntensity
            });
            this.circle3D = new THREE.Mesh(this.cirleGeo, this.circleMaterial);
			resolve(true);
		});
	}

	async updatePlateau() {
		// this.floor.remove(this.custom_ball);
		// this.floor.remove(this.light);

	}

	rendering = (async () => {
		if (this.move_cam) {
			this.cameraAngle += this.move_angle;
			this.camera.position.x = this.cameraDistance * Math.sin(this.cameraAngle);
			this.camera.position.z = this.cameraDistance * Math.cos(this.cameraAngle);
			this.camera.position.y = this.cameraHeight;
			this.camera.lookAt(this.floor.position)
		}
		this.toggle_cam == true ? this.camera.lookAt(this.floor.position) : this.camera.lookAt(0, 1, 0);
		this.renderer.render(this.scene, this.camera);
	}).bind(this);
}

export {
	CustomPlateau
};


