import { Reflector } from 'https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/objects/Reflector.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js';

class Plateau {
    constructor(
        mirorGeometry = { radius, segments },
        mirrorMaterial = { color, },
        plateauMaterial = { color, opacity, emissive, emissiveIntensity },
        circleGeometry = { radius, tube, radialSegments, tubularSegments },
        circleMaterial = { color, opacity, roughness, metalness, emissive, emissiveIntensity }
    ) {
        this.groundRadius = mirorGeometry.radius;
        this.geometry = new THREE.CircleGeometry(mirorGeometry.radius, mirorGeometry.segments);
        this.groundMirror = new Reflector(this.geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
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

        this.init();
    }

    async init() {
        this.plateau.position.y = 0;
        this.groundMirror.position.y = 0;
        this.circle3D.position.y = 1;
        this.plateau.rotateX(- Math.PI / 2);
        this.groundMirror.rotateX(- Math.PI / 2);
        this.circle3D.rotateX(- Math.PI / 2);
    }
}


export {
    Plateau
}