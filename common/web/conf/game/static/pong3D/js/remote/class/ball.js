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
		this.acceleration = {
			x: 0,
			y: 0,
			z: 0
		};
		this.group;
		this.isMoving = false;
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

	async move(acceleration, isWS) {
		if (isWS) this.collisionLight.position.set(this.group.position.x, 1, this.group.position.z);
		this.ballDirection.x = acceleration.x;
		this.ballDirection.z = acceleration.z;
		this.ballDirection.y = 0;
		this.group.position.add(this.ballDirection);
	}

	async bounce() {
		return new Promise(async (resolve, reject) => {
			const normal = this.group.position.clone().setY(0).normalize();
			const dotProduct = this.ballDirection.dot(normal);
			const newVelocity = this.ballDirection.clone().setY(0).sub(normal.clone().multiplyScalar(Math.abs(dotProduct * (1 + this.coefficientOfRestitution))));

			newVelocity.x += Math.abs(Math.random() * this.randomnessFactor - this.randomnessFactor / 2);
			newVelocity.z += Math.abs(Math.random() * this.randomnessFactor - this.randomnessFactor / 2);

			const originalMagnitude = Math.sqrt(this.ballDirection.x * this.ballDirection.x + this.ballDirection.z * this.ballDirection.z);
			const newMagnitude = Math.sqrt(newVelocity.x * newVelocity.x + newVelocity.z * newVelocity.z);
			const scaleFactor = originalMagnitude / newMagnitude;

			newVelocity.x *= scaleFactor;
			newVelocity.z *= scaleFactor;
			newVelocity.y = 0;

			resolve(newVelocity);
		});
	}


	async resetCenter() {
		this.ballDirection = new THREE.Vector3(0.5, 0, 0);
		this.group.position.set(0, 1, 0);
	}
}


export {
	Ball
}