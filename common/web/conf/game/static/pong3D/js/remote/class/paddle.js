import * as THREE from 'three';
class Paddle {
    constructor(
        paddle = { paddleGeo, paddleMaterial },
        limits = {
            radius, tube, radialSegments, tubularSegments, arc, color, opacity, roughness, metalness, emissive,
            position_up: { x, y, z },
            position_down: { x, y, z },
            lights: {
                color, intensity,
                position_up: {
                    x, y, z, radius
                },
                position_down: {
                    x, y, z, radius
                }
            }
        }
    ) {
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

    async initPos(limit_pos = { x, y, z }, lights_pos = { x, y, z }, limit, radius, lights) {
        limit.position.x = limit_pos.x;
        limit.position.y = limit_pos.y;
        limit.position.z = limit_pos.z;
        lights.position.x = lights_pos.x;
        lights.position.y = lights_pos.y;
        lights.position.z = lights_pos.z;
        limit.rotateY(radius);
    }
}

export {
    Paddle
}