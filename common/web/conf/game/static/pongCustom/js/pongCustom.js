import * as THREE from 'three';
import { CustomGame } from './class/CustomGame.js';

import * as pongCustomBall from './manager/pongCustomBall.js'
import * as pongCustomPlatform from './manager/pongCustomPlatform.js'
import * as pongCustomPaddle from './manager/pongCustomPaddle.js'
import * as pongCustomScore from './manager/pongCustomScore.js'
import * as pongCustomMap from './manager/pongCustomMap.js'
import * as pongCustomAnimation from './manager/pongCustomAnimation.js'
import * as pongCustomAccessory from './manager/pongCustomAccessory.js'


let game = new CustomGame();


// ===========================================================================
// ==================== Init =================================================
// ===========================================================================


function customInit() {
	game.init();
	toggleCustomManager();
	toggleSaveCustomGame();
}


// ===========================================================================
// ==================== Show =================================================
// ===========================================================================

async function showCustomManager() {
	try {
		let customOptionBtns = document.getElementById('all_custom');
		customOptionBtns.style.display = 'flex';
	} catch (e) {
		console.log(e)
	}
}


// ===========================================================================
// ==================== Hide =================================================
// ===========================================================================


async function hideCustomBox() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = '';
	} catch (e) {
		console.error(e)
	}
}

async function hideCustomManager() {
	try {
		let customOptionBtns = document.getElementById('all_custom');
		customOptionBtns.style.display = 'none';
	} catch (e) {
		console.error(e)
	}
}


// ===========================================================================
// ==================== Toggle ===============================================
// ===========================================================================


/**
 * Handles the functionality of the "Back" button in the custom manager interface.
 *
 * This function attaches a click event listener to the "Back" button (identified by ID `back_custom`).
 * When clicked, it checks the `data-type` attribute of the button to determine whether to remove 
 * the custom ball or plateau from the scene and reset their creation states. It also hides the 
 * custom box, custom accessories, and shows the custom manager interface again.
 *
 * @returns {Promise<void>} - An async function that handles the back navigation logic.
 */
async function toggleBackCustomManager() {
	try {
		let backBtn = document.getElementById('back_custom');
		backBtn.addEventListener('click', async function () {
			let dataBtn = backBtn.getAttribute('data-type');
			if (dataBtn == "ball") {
				game.scene.remove(game.Customball.group);
				game.creationBall = false;
			}
			if (dataBtn == "plateau")
			{
				game.scene.remove(game.CustomPlateau.group);
				game.creationPlateau = false;
			} else {
				console.log(dataBtn);	
			}
			hideCustomBox();
			pongCustomAccessory.hideCustomAccessory();
			showCustomManager();
		});
	} catch (e) {
		console.log(e)
	}
}

/**
 * Initializes event listeners for custom game elements.
 *
 * This function attaches click event listeners to elements with the class `custom-element`.
 * When an element is clicked, the associated custom management function from the `tab` array 
 * (such as `toggleBall`, `togglePlatform`, etc.) is invoked based on the element index.
 *
 * @returns {Promise<void>} - An async function that handles the custom element toggling process.
 */
async function toggleCustomManager() {
	try {
		let customElements = document.querySelectorAll('.custom-element');
		let tab = [pongCustomBall.toggleBall, pongCustomPlatform.togglePlatform, pongCustomPaddle.togglePaddle, pongCustomMap.toggleMap, pongCustomScore.toggleScore, pongCustomAnimation.toggleAnimation];
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

async function toggleSaveCustomGame() {
	try {
		let saveBtn = document.getElementById('save-custom-game');
		if (!saveBtn)
			return;
		saveBtn.addEventListener('click', async function () {
			let urls = saveBtn.getAttribute('data-url');

			let data = await serializeCustomGame(game);
			console.log('data Serialized =>', data);
			let reps = await APIsaveCustomGame(data, -1);
			console.log('reps =>', reps);
			console.log('urls' , urls)
			window.location = urls + reps.customGame.idCustom;
		});
	} catch {
		console.error('error in toggleSaveCustomGame');
	}
}


// ===========================================================================
// ==================== Utils ================================================
// ===========================================================================


/**
 * Converts a hex color code to an RGB object.
 *
 * This function takes a hex color code in the format `#RRGGBB` or `RRGGBB` and converts it 
 * to an object with red (r), green (g), and blue (b) values.
 *
 * @param {string} hex - The hex color code to convert.
 * @returns {Object|null} - An object with properties `r`, `g`, and `b` (0-255) if valid, or null if invalid.
 */
function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function rgbToHex(r, g, b) {
	r = Math.max(0, Math.min(255, r));
	g = Math.max(0, Math.min(255, g));
	b = Math.max(0, Math.min(255, b));

	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b)
		.toString(16)
		.slice(1)
		.toUpperCase();
}


// ===========================================================================
// ==================== Checker ==============================================
// ===========================================================================


/**
 * Validates if a string is a valid hex color code.
 *
 * Checks if the input string matches the format `#RRGGBB`, where `RR`, `GG`, 
 * and `BB` are hexadecimal digits (0-9, A-F).
 *
 * @param {string} hex - The string to validate as a hex color code.
 * @returns {boolean} - Returns true if the string is a valid hex color code, otherwise false.
 */
function checkColor(hex) {
	return /^#[0-9A-F]{6}$/i.test(hex);
}

/**
 * Validates and adjusts a value based on the specified range and step.
 *
 * This function checks if the given value is within the specified range (min, max).
 * If the value is outside the range, it updates the HTML input element's min, max, step,
 * and resets the value to half of the max.
 *
 * @param {number} value - The current value of the input.
 * @param {number} min - The minimum allowed value.
 * @param {number} max - The maximum allowed value.
 * @param {number} step - The step interval for the input.
 * @param {string} elementId - The ID of the input element to update.
 * @returns {boolean} - Returns true if the value is within range, otherwise false.
 */
function checkRange(value, min, max, step, elementId) {
	if (value < min || value > max) {
		let element = document.getElementById(elementId);
		if (!element)
			return false;
		element.min = min;
		element.max = max;
		element.step = step;
		element.value = (max * 0.5);
		return false;
	}
	return true;
}

/**
 * Checks if a value exists within a list of options.
 *
 * This function verifies if the provided value is included in the array of possible options.
 *
 * @param {string} value - The value to check.
 * @param {Array<string>} options - The list of valid options.
 * @returns {boolean} - Returns true if the value exists in the options, otherwise false.
 */
function checkSelect(value, options) {
	return (options.includes(value));
}


// ===========================================================================
// ==================== SERIALIZE ============================================
// ===========================================================================


async function serializeCustomGame(game) {
	try {
		if (!game)
			return null;
		return {
			custom_ball: await serializeCustomBall(),
			custom_plateau: await serializeCustomPlateau(),
			custom_paddle: await serializeCustomPaddle(),
			custom_map: await serializeCustomMap(),
			custom_score: await serializeCustomScore(),
			custom_animation: await serializeCustomAnimation(),
		};
	} catch {
		console.error('error in serializeCustomGame');
	}
}

async function serializeCustomBall() {
	try {
		if (!game.Customball) {
			return {
				color: '#FFFFFF',
				size: '0.5',
				emissiveIntensity: '30',
				lightIntensity: '150',
				colorLight: '#FFFFFF',
				accessory: null,
			};
		}
		return {
			color: game.Customball.color || '#FFFFFF',
			size: game.Customball.radius || '0.5',
			emissiveIntensity: game.Customball.intensity || '30',
			lightIntensity: game.Customball.light.intensity || '150',
			colorLight: game.Customball.light.color || '#FFFFFF',
			accessory: game.Customball.option || null,
		};
	} catch {
		console.error('error in serializeCustomBall')
	}
}

async function serializeCustomPlateau() {
	try {
		if (!game.CustomPlateau)
			return null;
		return {
			fontColor: null,
			size: null,
			reflexion: null,
			light: null,
			lightEmissive: null,
			borderColor: null,
			Bounth: null,
		}
	} catch {
		console.error('error in serializeCustomPlateau')
	}
}

async function serializeCustomPaddle() {
	try {
		if (!game.CustomPaddle)
			return null;
		return {
			color: null,
			light: null,
			reflexion: null,
			size: null,
		}
	} catch {
		console.error('error in serializeCustomBall')
	}
}

async function serializeCustomMap() {
	try {
		if (!game.CustomMap)
			return null;
		return {
			background: null,
		}
	} catch {
		console.error('error in serializeCustomBall')
	}
}

async function serializeCustomScore() {
	try {
		if (!game.CustomScore)
			return null;
		return {
			color: null,
			light: null,
			font: null,
		}
	} catch {
		console.error('error in serializeCustomBall')
	}
}

async function serializeCustomAnimation() {
	try {
		if (!game.CustomAnimation)
			return null;
		return {
			animation: null,
		}
	} catch {
		console.error('error in serializeCustomBall')
	}
}

// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
	game,
	hexToRgb,
	rgbToHex,
	toggleBackCustomManager,
	checkColor,
	checkRange,
	checkSelect,
}

customInit();
