import * as THREE from 'three';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/objects/Reflector.js';
import { CustomBall } from './CustomBall.js';
import { CustomPlateau } from './CustomPlateau.js';
import { InfiniteGridHelper } from './grid.js';
import { OrbitControls } from 'orbitcontrols';


class CustomGame {
    constructor() {
        this.Customball = undefined;
        this.Customplateau;
        this.Custompaddle;
        this.Custommap;
        this.Customscore;
        this.Customanimation;


        this.width;
		this.height;
		this.move_angle = 0.01;
		this.cameraAngle = 0;
		this.cameraDistance = 16 / 1.5;
		this.cameraHeight = 16 / 1.5;

        this.floor = new THREE.Group();

        this.spotlight = [];
        this.camera;


        this.creationBall = false;
        this.creationPlateau = false;
        // this.init();
    }

    async init() {
        await this.createScene();
        await this.createMirror();
        await this.createCamera();
        await this.createSpotLight();
        // this.Customplateau = new CustomPlateau();
        // this.Custompaddle = new CustomPaddle();
        // this.Custommap = new CustomMap();
        // this.Customscore = new CustomScore();
        // this.Customanimation = new CustomAnimation();
        this.renderer.setAnimationLoop(this.rendering);
    }

    async createBall(){
        return new Promise(async(resolve, reject)=>{
            this.Customball = new CustomBall(this);
            await this.Customball.init();
            this.showBall();
            resolve(true);
        });
    }

    async showBall(){
        this.creationBall = true;
        this.scene.add(this.Customball.group);
    }

    async createPlateau(){
        return new Promise(async(resolve, reject)=>{
            this.Customplateau = new CustomPlateau(this);
            await this.Customplateau.init();
            this.showPlateau();
            resolve(true);
        });
    }

    async showPlateau(){
        this.creationPlateau = true;
        this.scene.add(this.Customplateau.floor);
    }

    async createScene() {
		return new Promise(async (resolve, reject) => {
			const container = document.getElementById('render');
			this.width = container.clientWidth;
			this.height = container.clientHeight;

			this.renderer = new THREE.WebGLRenderer({ antialias: true });
			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.grid = new InfiniteGridHelper(5, 10);
			this.scene = new THREE.Scene();

			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize(this.width, this.height);
			container.appendChild(this.renderer.domElement);

			this.scene.add(this.floor);
			this.scene.add(this.grid);
			resolve(true);
		});
	}

    async createSpotLight() {
		let nbr = 4;
		let pos = [
			{ x: 10, y: 15, z: 0 },
			{ x: 0, y: 15, z: 10 },
			{ x: -10, y: 15, z: 0 },
			{ x: 0, y: 15, z: -10 },
		]
		for (const data of this.spotlight)
			this.scene.remove(data);
		this.spotlight = [];
		for (let i = 0; i != nbr; i++) {
			let spotlight = new THREE.SpotLight(0xffffff, 250);
			spotlight.position.set(pos[i].x, pos[i].y, pos[i].z);

			spotlight.castShadow = true;
			spotlight.shadow.mapSize.width = this.width;
			spotlight.shadow.mapSize.height = this.height;
			spotlight.shadow.camera.near = 500;
			spotlight.shadow.camera.far = 4000;
			spotlight.shadow.camera.fov = 70;
			spotlight.target = this.scene;

			this.scene.add(spotlight);
		}
	}

    async createCamera() {
		return new Promise(async (resolve, reject) => {
			this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
			this.camera.position.set(0, 16 / 1.5, 16 / 1.5);
			this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
			this.cameraControls.update();
			this.camera.lookAt(this.scene.position.x, this.scene.position.y, this.scene.position.z);
			resolve(true);
		});
	}

	async createMirror() {
		return new Promise(async (resolve, reject) => {
			this.geometry = new THREE.CircleGeometry(40, 64);
			this.groundMirror = new Reflector(this.geometry, {
				clipBias: 0.003,
				textureWidth: this.width * window.devicePixelRatio,
				textureHeight: this.height * window.devicePixelRatio,
				color: 0xb5b5b5
			});

			this.plateauMaterial = new THREE.MeshPhysicalMaterial({
				color: 0x000000, transparent: true, opacity: 0.5, wireframe: false, side: THREE.FrontSide, roughness: 0.7, metalness: 0.1, clearcoat: 1.0,
				clearcoatRoughness: 1.0,
				emissive: 0x000000, emissiveIntensity: 200
			});
			this.plateau = new THREE.Mesh(this.geometry, this.plateauMaterial);

			this.plateau.position.y = 0;
			this.groundMirror.position.y = 0;
			this.plateau.rotateX(- Math.PI / 2);
			this.groundMirror.rotateX(- Math.PI / 2);
			this.floor.add(this.groundMirror);
			this.floor.add(this.plateau);
			resolve(true);
		})
	}

    rendering = (async () => {
        if (this.creationBall)
            return (this.Customball.rendering());
        if (this.creationPlateau)
            return (this.Customplateau.rendering());
        this.cameraAngle += this.move_angle;
        this.camera.position.x = this.cameraDistance * Math.sin(this.cameraAngle);
        this.camera.position.z = this.cameraDistance * Math.cos(this.cameraAngle);
        this.camera.position.y = this.cameraHeight;
		this.camera.lookAt(0, 1, 0);
		this.renderer.render(this.scene, this.camera);
	}).bind(this);
}

export {
    CustomGame
};