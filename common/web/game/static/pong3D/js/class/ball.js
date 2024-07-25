import * as THREE from 'three';

class Ball {
    constructor(
        ball = { radius, widthSegments, heightSegments, color, emissive, emissiveIntensity, roughness, metalness },
        ballTorusGeo = { radius, tube, radialSegments, tubularSegments },
        balltorusMaterial = { color, opacity, roughness, metalness, emissive, emissiveIntensity },
        light = { color, intensity },
        nbr = { nbrTorus },
        data = {
            coefficientOfRestitution, randomnessFactor,
            lights: { color, intensity, x, y, z }
        },
        bouncing = {
            max,
            min,
            speed
        }
    ) {
        this.radius = ball.radius;
        this.geometrySphere = new THREE.SphereGeometry(ball.radius, ball.widthSegments, ball.heightSegments);
        this.materialSphere = new THREE.MeshPhysicalMaterial({
            color: ball.color, emissive: ball.emissive, emissiveIntensity: ball.emissiveIntensity, clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            roughness: ball.roughness,
            metalness: ball.metalness,
        });
        this.sphere3D = new THREE.Mesh(this.geometrySphere, this.materialSphere);
        this.sphere3D.position.set(0, 1, 0);
        this.ballDirection = new THREE.Vector3(0.5, 0, 0);

        this.balltorusGeometry = new THREE.TorusGeometry(ballTorusGeo.radius, ballTorusGeo.tube, ballTorusGeo.radialSegments, ballTorusGeo.tubularSegments);
        this.balltorusMaterial = new THREE.MeshPhysicalMaterial({
            color: balltorusMaterial.color, transparent: false,
            opacity: balltorusMaterial.opacity, wireframe: false,
            side: THREE.FrontSide, roughness: balltorusMaterial.roughness, metalness: balltorusMaterial.metalness, clearcoat: 1.0,
            clearcoatRoughness: 1.0, emissive: balltorusMaterial.emissive, emissiveIntensity: balltorusMaterial.emissiveIntensity
        });
        this.torus = [];
        this.light = new THREE.PointLight(light.color, light.intensity);
        this.light.position.set(this.sphere3D.position.x, this.sphere3D.position.y, this.sphere3D.position.z);

        this.coefficientOfRestitution = data.coefficientOfRestitution;
        this.randomnessFactor = data.randomnessFactor;
        this.collisionLight = new THREE.PointLight(data.lights.color, data.lights.intensity);
        this.collisionLight.position.set(data.lights.x, data.lights.y, data.lights.z);

        this.bouncing = {
            angle: Math.random() * (bouncing.max - (bouncing.min)) + (bouncing.min),
            speed: bouncing.speed,
            min: bouncing.min,
            max: bouncing.max
        }

        this.group;
        this.initTorus(nbr.nbrTorus);
    }


    async initTorus(nbrTorus) {
        let torusBall = new THREE.Mesh(this.balltorusGeometry, this.balltorusMaterial);
        torusBall.position.copy(this.sphere3D.position);
        this.torus.push(torusBall);
        for (let i = 0; i < (nbrTorus - 1); i++) {
            torusBall = new THREE.Mesh(this.balltorusGeometry, this.balltorusMaterial);
            torusBall.position.copy(this.sphere3D.position);
            i % 2 == 0 ? torusBall.rotateY(Math.PI / 2) : torusBall.rotateX(Math.PI / 2);
            this.torus.push(torusBall);
        }

    }

    async genRandomsAngle() {
        return new Promise((resolve, reject) => {
            this.bouncing.angle = Math.random() * (this.bouncing.max - (this.bouncing.min)) + (this.bouncing.min);
            resolve(true);
        });
    }

    async moveTorus(rotation) {
        for (const t of this.torus) {
            t.rotateX(rotation);
            t.rotateY(rotation);
        }
    }

    async move() {
        this.group.position.add(this.ballDirection);
    }

    async bounce(ground) {
        return new Promise(async (resolve, reject) => {
            const normal = this.group.position.clone().normalize();
            const dotProduct = this.ballDirection.dot(normal);
            const newVelocity = this.ballDirection.clone().sub(normal.clone().multiplyScalar(dotProduct * (1 + this.coefficientOfRestitution)));
            newVelocity.x += Math.random() * this.randomnessFactor - this.randomnessFactor / 2;
            newVelocity.z += Math.random() * this.randomnessFactor - this.randomnessFactor / 2;
            this.ballDirection.copy(newVelocity);
            this.group.position.copy(normal.multiplyScalar(ground.groundRadius - this.radius));
            this.collisionLight.position.set(this.group.position.x, 1, this.group.position.z);
            resolve(true);
        });
    }

    async resetCenter(speed) {
        await this.genRandomsAngle();
        this.ballDirection.x = Math.cos(this.bouncing.angle) * speed;
        this.ballDirection.z = Math.sin(this.bouncing.angle) * speed;
        this.group.position.set(0, 0, 0);
    }
}


export {
    Ball
}