import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';
import { Paddle } from './paddle.js'
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/geometries/TextGeometry.js'

class Player {
    constructor(
        paddleGeometry = { radius, tube, radialSegments, tubularSegments, arc },
        paddleMaterial = { color, opacity, roughness, metalness, emissive, emissiveIntensity },
        paddleInit = { y, angleX, angleZ },
        limits = {
            radius,
            tube,
            radialSegments,
            tubularSegments,
            color,
            opacity,
            roughness,
            metalness,
            emissive,
            position_up: {
                x,
                y,
                z,
            },
            position_down: {
                x,
                y,
                z,
            },
            lights: {
                color,
                intensity,
                position_up: {
                    x, y, z, radius
                },
                position_down: {
                    x, y, z, radius
                }
            }
        },
        control = {up, down},
        user = {
            name,
            img
        }
    ) {
        this.score = 0;
        this.paddleGeo = new THREE.TorusGeometry(paddleGeometry.radius, paddleGeometry.tube, paddleGeometry.radialSegments, paddleGeometry.tubularSegments, paddleGeometry.arc);
        this.paddleMaterial = new THREE.MeshPhysicalMaterial({
            color: paddleMaterial.color, transparent: false, opacity: paddleMaterial.opacity, wireframe: false, side: THREE.FrontSide, roughness: paddleMaterial.roughness, metalness: paddleMaterial.metalness, clearcoat: 1.0,
            clearcoatRoughness: 1.0, emissive: paddleMaterial.emissive, emissiveIntensity: paddleMaterial.emissiveIntensity
        });
        this.paddle = new Paddle(
            { paddleGeo: this.paddleGeo, paddleMaterial: this.paddleMaterial },
            limits
        );

        this.loader = new FontLoader();
        this.font;

        this.group;
        this.controls = {
            up: control.up,
            down: control.down
        }
        this.name = user.name;
        this.img = user.img;
        this.init(paddleInit)
    }

    async init({ y, angleX, angleZ }) {
        this.paddle.paddle3D.position.y = y;
        this.paddle.paddle3D.rotateX(angleX);
        this.paddle.paddle3D.rotateZ(angleZ);
    }
}

export {
    Player
}