import * as THREE from 'three';
import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/objects/Reflector.js';
import { OrbitControls } from 'orbitcontrols';
import { InfiniteGridHelper } from './grid.js'
class CustomBall {
    constructor() {
        this.custom_ball;
        this.light = {
            intensity: 30
        };
        this.width;
        this.height;
        this.cameraAngle = 0;
        this.move_angle = 0.01;
        this.cameraDistance = 16 / 1.5;
        this.cameraHeight = 16 / 1.5;
        this.color = 0xffffff;
        this.accessory = null;
        this.scene;
        this.renderer;
        this.up = true;
        this.move_y = 0.05;
        this.move_cam = true;
        this.toggle_cam = false;
        this.group = new THREE.Group();
        this.floor = new THREE.Group();
        this.radius = 0.5;
        // this.init();
    }

    async init() {
        await this.createScene();
        await this.createMirror();
        await this.createBall();
        await this.createLight();
        await this.createCamera();
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
            this.custom_ball.position.set(0, 1 + (this.radius / 2), 0);
            this.group.add(this.custom_ball);
            resolve(true);
        });
    }

    async updateBall() {
        await this.createBall();
    }

    rendering = (async () => {
        console.log(this.color, "render")
        if (this.group.position.y >= 3)
            this.up = false;
        if (this.group.position.y <= -(this.radius / 2))
            this.up = true;
        this.up == true ? this.group.position.y += this.move_y : this.group.position.y -= this.move_y;
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

    async createLight() {
        return new Promise(async (resolve, reject) => {
            this.light = new THREE.PointLight(0xffffff, 200);
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

    async makeAccessory() {
        if (this.accessory) {
            this.group.add(this.accessory);
        }
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


