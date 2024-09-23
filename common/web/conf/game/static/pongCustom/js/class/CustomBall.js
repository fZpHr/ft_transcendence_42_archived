import * as THREE from 'three';
class CustomBall {
	constructor(game) {
		this.custom_ball;
		this.light = {
			intensity: 10,
			color: 0xffffff,
		};

		this.colorLightValue;

		this.intensity = 10;

		this.scene = game.scene;
		this.renderer = game.renderer;
        this.camera = game.camera;
		this.move_angle = 0.01;
		this.cameraAngle = 0;
		this.cameraDistance = 16 / 1.5;
		this.cameraHeight = 16 / 1.5;
        this.move_cam = true;
		this.toggle_cam = false;

		this.color = 0xffffff;
		this.accessory = [];
		this.up = true;
		this.move_y = 0.05;
		this.group = new THREE.Group();
		this.radius = 0.5;
		this.move_torus = false;
		this.torus_rotation = 0.05;
		this.option == undefined;
	}

	async init() {
        return new Promise(async(resolve, reject)=>{
            await this.createBall();
            await this.createLight();
            resolve(true);
        });
	}

	async createBall() {
		return new Promise(async (resolve, reject) => {
			let geometrySphere = new THREE.SphereGeometry(this.radius, 32, 32);
			let materialSphere = new THREE.MeshPhysicalMaterial({
				color: this.color, emissive: this.color, emissiveIntensity: this.intensity, clearcoat: 1.0,
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
		this.custom_ball.material.dispose();
		this.light.dispose();
		await this.createBall();
		await this.createLight();
		await this.makeAccessory(this.option);
	}

	rendering = (async () => {
		if (this.group.position.y >= 5)
			this.up = false;
		if (this.group.position.y <= 0) 
			this.up = true;
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
			this.light = new THREE.PointLight(this.light.color, this.light.intensity);
			this.light.position.set(this.custom_ball.position.x, this.custom_ball.position.y, this.custom_ball.position.z);
			this.group.add(this.light);
			resolve(true);
		});
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
}

export {
	CustomBall
};


