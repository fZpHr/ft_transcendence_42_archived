import { CustomGame } from './class/CustomGame.js';
import * as THREE from 'three';

let game = new CustomGame();

// document.addEventListener('DOMContentLoaded', function () {
function customInit() {
	toggleCustomManager();
	
	let startBtn = document.getElementById('start');
	console.log('startBtn', startBtn);
	startBtn.addEventListener('click', async function () {
		game.init()
	}, {once: true});
}
// });

// ==================== TOGGLE UPDATE CUSTOM ELEMENTS ====================

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

async function toggleCustomBallUpdate() {
    if (game.Customball)
        game.showBall();
    else
        await game.createBall();
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'ball-size') {
					game.Customball.radius = parseFloat(event.target.value);
				} else if (event.target.id === 'ball-color') {
					let color = hexToRgb(event.target.value);
					game.Customball.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
				} else if (event.target.id === 'ball-accessory') {
					game.Customball.option = event.target.value;
				} else if (event.target.id === 'ball-Emissive-intensit') {
					game.Customball.intensity = parseFloat(event.target.value);
				} else if (event.target.id === 'ball-light-intensity') {
					game.Customball.light.intensity = parseFloat(event.target.value);
				} else if (event.target.id === 'ball-light-color') {
					let color = hexToRgb(event.target.value);
					game.Customball.light.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
				}
				game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomPlatformUpdate() {
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				// game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'platform-color') {
					console.log('platform-color => ', event.target.value);
				} else if (event.target.id === 'platform-size') {
					console.log('platform-size => ', event.target.value);
				} else if (event.target.id === 'platform-reflexion') {
					console.log('platform-reflexion => ', event.target.value);
				} else if (event.target.id === 'platform-light') {
					console.log('platform-light => ', event.target.value);
				} else if (event.target.id === 'border-color') {
					console.log('border-color => ', event.target.value);
				} else if (event.target.id === 'limiteur-color') {
					console.log('limiteur-color => ', event.target.value);
				}
				// console.log('event.target.id', event.target.id, 'event.target.value', event.target.value);
				// game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomPaddleUpdate() {
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				// game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'paddle-color') {
					console.log('paddle-color => ', event.target.value);
				} else if (event.target.id === 'paddle-size') {
					console.log('paddle-size => ', event.target.value);
				} else if (event.target.id === 'paddle-reflexion') {
					console.log('paddle-reflexion => ', event.target.value);
				} else if (event.target.id === 'paddle-light') {
					console.log('paddle-light => ', event.target.value);
				}
				// console.log('event.target.id', event.target.id, 'event.target.value', event.target.value);
				// game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomMapUpdate() {
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				// game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'map-fond') {
					console.log('map-fond => ', event.target.value);
				}
				// console.log('event.target.id', event.target.id, 'event.target.value', event.target.value);
				// game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomScoreUpdate() {
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				// game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'score-color') {
					console.log('score-color => ', event.target.value);
				} else if (event.target.id === 'score-light') {
					console.log('score-light => ', event.target.value);
				} else if (event.target.id === 'score-font') {
					console.log('score-font => ', event.target.value);
				}
				// console.log('event.target.id', event.target.id, 'event.target.value', event.target.value);
				// game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomAnimationUpdate() {
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
			input.addEventListener('input', (event) => {
				// game.Customball.group.remove(game.Customball.custom_ball);
				if (event.target.id === 'animation-type') {
					console.log('animation-type => ', event.target.value);
				}
				// console.log('event.target.id', event.target.id, 'event.target.value', event.target.value);
				// game.Customball.updateBall();
			});
		});
	} catch (e) {
		console.log(e)
	}
}

// ==================== SHOW CUSTOM ELEMENTS ====================

async function toggleUpdateCAM() {
	try {
		const cameraModes = ['rotate', 'focus ball', 'libre'];
		let currentModeIndex = 0;

		function updateCameraModeDisplay() {
			document.getElementById('camera-mode').textContent = cameraModes[currentModeIndex];
			switch (currentModeIndex) {
				case 1:
					game.Customball.toggle_cam = true;
					break;
				case 2:
					game.Customball.toggle_cam = false;
					game.Customball.move_cam = false;
					break;
				case 0:
					game.Customball.toggle_cam = false;
					game.Customball.move_cam = true;
					break;
			}
		}

		document.getElementById('left-arrow').addEventListener('click', () => {
			currentModeIndex = (currentModeIndex - 1 + cameraModes.length) % cameraModes.length;
			updateCameraModeDisplay();
		});

		document.getElementById('right-arrow').addEventListener('click', () => {
			currentModeIndex = (currentModeIndex + 1) % cameraModes.length;
			updateCameraModeDisplay();
		});

		updateCameraModeDisplay();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomBall() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Ball</span>
                <i class="fas fa-arrow-left" id="back_custom" data-type="ball"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element color">
                    <label for="ball-color">Color :</label>
                    <input type="color" id="ball-color" name="ball-color" value="#FFFFFF">
                </div>  
                <div class="custom-option-element">
                    <label for="ball-size">Size :</label>
                    <input type="range" class="size-input" id="ball-size" min="0.5" max="2" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="ball-Emissive-intensity">Emissive intensity :</label>
                    <input type="range" class="size-input" id="ball-Emissive-intensit" min="10" max="300" step="1" value="10">
                </div>
                    <div class="custom-option-element">
                    <label for="ball-light-intensity">Light intensity :</label>
                    <input type="range" class="size-input" id="ball-light-intensity" min="10" max="400" step="1" value="10">
                </div>
                <div class="custom-option-element color">
                    <label for="ball-light-color">Color Light :</label>
                    <input type="color" id="ball-light-color" name="ball-light-color" value="#FFFFFF">
                </div>  
                <div class="custom-option-element">
                    <label for="ball-accessory">Accessory :</label>
                    <select id="ball-accessory">
                        <option value="none" selected>None</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomBallUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomPlatform() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Platform</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element color">
                    <label for="platform-color">Fond color :</label>
                    <input type="color" id="platform-color" name="platform-color" value="#FF0000">
                </div>
                <div class="custom-option-element">
                    <label for="platform-size">Size :</label>
                    <input type="range" id="platform-size" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="platform-reflexion">Reflexion :</label>
                    <input type="range" id="platform-reflexion" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="platform-light">Light :</label>
                    <input type="range" id="platform-light" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element color">
                    <label for="border-color">Border :</label>
                    <input type="color" id="border-color" name="border-color" value="#FF0000">
                </div>
                <div class="custom-option-element color">
                    <label for="limiteur-color">Boudth :</label>
                    <input type="color" id="limiteur-color" name="limiteur-color" value="#FF0000">
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomPlatformUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomPaddle() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Paddle</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element color">
                    <label for="paddle-color">Color :</label>
                    <input type="color" id="paddle-color" name="paddle-color" value="#FF0000">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-light">Light :</label>
                    <input type="range" id="paddle-light" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-reflexion">Reflexion :</label>
                    <input type="range" id="paddle-reflexion" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-size">Size :</label>
                    <input type="range" id="paddle-size" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomPaddleUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomMap() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Map</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element">
                    <label for="map-fond">Accessory :</label>
                    <select id="map-fond">
                        <option value="none" selected>None</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomMapUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomScore() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Score</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element color">
                    <label for="score-color">Color :</label>
                    <input type="color" id="score-color" name="score-color" value="#FF0000">
                </div>
                <div class="custom-option-element">
                    <label for="score-light">Light :</label>
                    <input type="range" id="score-light" class="size-input" min="0.1" max="1" step="0.01" value="0.5">
                </div>
                <div class="custom-option-element">
                    <label for="score-font">Fonts :</label>
                    <select id="score-font">
                        <option value="none" selected>None</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomScoreUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomAnimation() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Animation</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element">
                    <label for="animation-type">Animation :</label>
                    <select id="animation-type">
                        <option value="none" selected>None</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                </div>
                <div class="change-cam">
                    <button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
                    <span id="camera-mode">rotate</span>
                    <button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        `;
		toggleBackCustomManager();
		toggleCustomAnimationUpdate();
		toggleUpdateCAM();
	} catch (e) {
		console.log(e)
	}
}

async function showCustomManager() {
	try {
		let customOptionBtns = document.getElementById('all_custom');
		customOptionBtns.style.display = 'flex';
	} catch (e) {
		console.log(e)
	}
}

// ==================== Hide ELEMENTS ====================

async function hideCustomBox() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = '';
	} catch (e) {
		console.log(e)
	}
}

async function hideCustomManager() {
	try {
		let customOptionBtns = document.getElementById('all_custom');
		customOptionBtns.style.display = 'none';
	} catch (e) {
		console.log(e)
	}
}

// ==================== TOGGLE CUSTOM ELEMENTS ====================


async function toggleBall() {
	try {
		showCustomBall();
		console.log('toggleBall');
	} catch (e) {
		console.log(e)
	}
}

async function togglePlatform() {
	try {
		showCustomPlatform();
		console.log('togglePlatform');
	} catch (e) {
		ole.log(e)
	}
}

async function togglePaddle() {
	try {
		showCustomPaddle();
		console.log('togglePaddle');
	} catch (e) {
		ole.log(e)
	}
}

async function toggleMap() {
	try {
		showCustomMap();
		console.log('toggleMap');
	} catch (e) {
		ole.log(e)
	}
}

async function toggleScore() {
	try {
		showCustomScore();
		console.log('toggleScore');
	} catch (e) {
		ole.log(e)
	}
}

async function toggleAnimation() {
	try {
		showCustomAnimation();
		console.log('toggleAnimation');
	} catch (e) {
		ole.log(e)
	}
}

async function toggleBackCustomManager() {
	try {
		let backBtn = document.getElementById('back_custom');
		backBtn.addEventListener('click', async function () {
			let dataBtn = backBtn.getAttribute('data-type');
			if (dataBtn == "ball")
            {
                game.scene.remove(game.Customball.group);
                game.creationBall = false;   
            }
            hideCustomBox();
			showCustomManager();
		});
	} catch (e) {
		console.log(e)
	}
}

async function toggleCustomManager() {
	try {
		let customElements = document.querySelectorAll('.custom-element');
		let tab = [toggleBall, togglePlatform, togglePaddle, toggleMap, toggleScore, toggleAnimation];
		for (let i = 0; i < customElements.length; i++) {
			customElements[i].addEventListener('click', async function () {
				hideCustomManager();
				let customElement = customElements[i];
				let customElementId = customElement.getAttribute('data-type');
				tab[i]();
			});
		}

	} catch (e) {
		console.log(e)
	}
}

customInit();