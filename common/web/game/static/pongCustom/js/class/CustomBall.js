import * as THREE from 'three';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/objects/Reflector.js';
import { OrbitControls } from 'orbitcontrols';
import { InfiniteGridHelper } from './grid.js'
class CustomBall {
    constructor() {
        this.custom_ball;
        this.light = {
            intensity: 10
        };
        this.width;
        this.height;
        this.cameraAngle = 0;
        this.move_angle = 0.01;
        this.cameraDistance = 16 / 1.5;
        this.cameraHeight = 16 / 1.5;
        this.color = 0xffffff;
        this.accessory = [];
        this.scene;
        this.renderer;
        this.up = true;
        this.move_y = 0.05;
        this.move_cam = true;
        this.toggle_cam = false;
        this.group = new THREE.Group();
        this.floor = new THREE.Group();
        this.radius = 0.5;
        this.move_torus = false;
        this.torus_rotation = 0.05;
        this.option == undefined;
        this.spotlight = [];
        // this.init();
    }

    async init() {
        await this.createScene();
        await this.createMirror();
        await this.createBall();
        await this.createLight();
        await this.createCamera();
        await this.createSpotLight();
        this.renderer.setAnimationLoop(this.rendering);
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

            this.scene.add(this.group);
            this.scene.add(this.floor);
            this.scene.add(this.grid)
            resolve(true);
        });
    }

    async createSpotLight() {
        let nbr = 4;
        let pos = [
            {x: 10, y: 15, z: 0},
            {x: 0, y: 15, z: 10},
            {x: -10, y: 15, z: 0},
            {x: 0, y: 15, z: -10},
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

    async createBall() {
        return new Promise(async (resolve, reject) => {
            let geometrySphere = new THREE.SphereGeometry(this.radius, 32, 32);
            let materialSphere = new THREE.MeshPhysicalMaterial({
                color: this.color, emissive: this.color, emissiveIntensity: this.light.intensity, clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                roughness: 0.7,
                metalness: 0.7,
            });
            this.custom_ball = new THREE.Mesh(geometrySphere, materialSphere);
            this.custom_ball.position.set(0, (this.radius), 0);
            this.group.add(this.custom_ball);
            resolve(true);
        });
    }

    async updateBall() {
        this.group.remove(this.custom_ball);
        this.group.remove(this.light);
        await this.createBall();
        await this.createLight();
        await this.makeAccessory(this.option);
    }

    rendering = (async () => {
        if (this.group.position.y >= 5)
            this.up = false;
        if (this.group.position.y <= 0)
        {
            console.log(this.group.position.y, this.radius)
            this.up = true;
        }
        this.up == true ? this.group.position.y += this.move_y : this.group.position.y -= this.move_y;
        if (this.move_cam) {
            this.cameraAngle += this.move_angle;
            this.camera.position.x = this.cameraDistance * Math.sin(this.cameraAngle);
            this.camera.position.z = this.cameraDistance * Math.cos(this.cameraAngle);
            this.camera.position.y = this.cameraHeight;
            this.camera.lookAt(this.group.position)
        }
        if (this.move_torus)
            this.moveTorus();
        this.toggle_cam == true ? this.camera.lookAt(this.group.position) : this.camera.lookAt(0, 1, 0);
        this.renderer.render(this.scene, this.camera);
    }).bind(this);

    async createLight() {
        return new Promise(async (resolve, reject) => {
            this.light = new THREE.PointLight(this.color, this.light.intensity);
            this.light.position.set(this.custom_ball.position.x, this.custom_ball.position.y, this.custom_ball.position.z);
            this.group.add(this.light);
            resolve(true);
        });
    }

    async createCamera() {
        return new Promise(async (resolve, reject) => {
            this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
            this.camera.position.set(0, 16 / 1.5, 16 / 1.5);
            this.cameraControls = new OrbitControls(this.camera, this.renderer.domElement);
            this.cameraControls.update();
            this.camera.lookAt(this.custom_ball.position.x, this.custom_ball.position.y, this.custom_ball.position.z);
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

    async moveTorus() {
        for (const data of this.accessory) {
            data.rotateX(this.torus_rotation);
            data.rotateY(this.torus_rotation);
        }
    }

    async makeTorus() {
        return new Promise(async (resolve, reject) => {
            let nbrTorus = 3;
            this.balltorusGeometry = new THREE.TorusGeometry(this.radius, 0.1, 32, 200);
            this.balltorusMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x000000, transparent: false,
                opacity: 0.8, wireframe: false,
                side: THREE.FrontSide, roughness: 0.1, metalness: 0, clearcoat: 1.0,
                clearcoatRoughness: 1.0, emissive: 0x000000, emissiveIntensity: 50
            });
            let torusBall = new THREE.Mesh(this.balltorusGeometry, this.balltorusMaterial);
            torusBall.position.copy(this.custom_ball.position)
            this.accessory.push(torusBall);
            for (let i = 0; i < (nbrTorus - 1); i++) {
                torusBall = new THREE.Mesh(this.balltorusGeometry, this.balltorusMaterial);
                torusBall.position.copy(this.custom_ball.position);
                i % 2 == 0 ? torusBall.rotateY(Math.PI / 2) : torusBall.rotateX(Math.PI / 2);
                this.accessory.push(torusBall);
            }
            resolve(true);
        });
    }

    async makeAccessory(object) {
        for (const data of this.accessory)
            this.group.remove(data);
        this.accessory = [];
        switch (object) {
            case "option1":
                await this.makeTorus();
                this.move_torus = true;
                break;
        }
        this.option = object;
        for (const data of this.accessory)
            this.group.add(data);
    }

    get getLight() {
        return this.light;
    }

    get getColor() {
        return this.color;
    }

    get getAccessory() {
        return this.accessory;
    }

    set setLight(light) {
        this.light = light;
    }
    set setColor(color) {
        this.color = color;
    }

    set setAccessory(accessory) {
        this.accessory = accessory;
    }
}

export {
    CustomBall
};


