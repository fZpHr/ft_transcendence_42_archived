import * as THREE from 'three';
import * as pongCustomManager from '../pongCustom.js'
import * as pongCustomAccessory from './pongCustomAccessory.js'
import {game} from '../pongCustom.js'
import {defaultCustomValue} from '../serializeCustomGame.js'
import {serializeCustomGame} from '../serializeCustomGame.js'
import {addCustomInputsToContainer} from '../pongCustomUtils.js'
import {updateCustomInput} from '../pongCustomUtils.js'
import {hexToHexString} from '../pongCustomUtils.js'

/**
 * Object mapping input types to their respective update functions.
 *
 * This object holds references to functions that handle changes in specific input fields.
 * Each key corresponds to an input field's ID or type, and the value is the function 
 * that should be called when that input is modified.
 *
 * @type {Object<string, Function>}
 */
const inputHandlers = {
	'color': updateBallColor,
	'size': updateBallSize,
	'emissiveIntensity': updateBallEmissiveIntensity,
	'lightIntensity': updateBallLightIntensity,
	'colorLight': updateBallLightColor,
	'accessory': updateBallAccessory,
};


// ===========================================================================
// ==================== Toggle ===============================================
// ===========================================================================


/**
 * Toggles the custom element settings in the game.
 *
 * This function initializes the custom element inputs, sets up the back button 
 * functionality, displays accessory options, and updates the element settings.
 * It calls several related functions to ensure the element system is properly configured.
 *
 * @returns {Promise<void>} - An async function that manages element settings.
 */
async function toggleBall() {
	try {
		innerCustomBallInput();
        pongCustomManager.toggleBackCustomManager();
		pongCustomAccessory.innerAccessory(1);
		pongCustomAccessory.toggleCustonAccessory();
		toggleCustomBallUpdate();
		toggleUpdateCAM_ball();
	} catch (e) {
		console.error(e)
	}
}

/**
 * Initializes custom element settings and sets up input event listeners.
 *
 * This function awaits the completion of the `initializeelement` function,
 * then selects all input and select elements within the `#custom-box` 
 * and adds an event listener to handle input changes.
 *
 * @returns {Promise<void>} - An async function that configures element inputs.
 */
async function toggleCustomBallUpdate() {
    await initializeBall();
	try {
		const inputs = document.querySelectorAll('#custom-box input, #custom-box select');
		inputs.forEach(input => {
            input.addEventListener('input', toggleChangeInput);
		});
	} catch (e) {
		console.error(e)
	}
}

/**
 * Handles changes to input elements and updates the animation settings.
 *
 * This function is triggered on input events. It checks if the input's ID 
 * corresponds to a defined handler in `inputHandlers`. If so, it calls the 
 * associated function with the input's value and then updates the animation. 
 * If the ID is unrecognized, a warning is logged to the console.
 *
 * @param {Event} event - The input event triggered by the user.
 */
function toggleChangeInput(event) {
	const { id, value } = event.target;

	if (inputHandlers[id]) {
		inputHandlers[id](value);
		game.Customball.updateBall();
	} else {
		console.warn(`Unrecognized input id: ${id}`);
	}
}


// ===========================================================================
// ==================== INNER ================================================
// ===========================================================================


/**
 * Initializes the custom element input interface.
 *
 * This function populates the `#custom-box` element with the HTML structure 
 * for element settings, including a title, a back button, and options 
 * for selecting an element type. It also includes buttons for changing 
 * the camera mode.
 *
 * @returns {Promise<void>} - An async function that sets up the Element UI.
 */
async function innerCustomBallInput() {
	try {
		const customBall = defaultCustomValue.custom_ball;
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
			<div class="title-custom">
				<span>Ball</span>
				<i class="fas fa-arrow-left" id="back_custom" data-type="ball"></i>
			</div>
		`;
		addCustomInputsToContainer(customBox, customBall);
		customBox.innerHTML += `
			<div class="change-cam">
				<button id="left-arrow"><i class="fas fa-arrow-left"></i></button>
				<span id="camera-mode">rotate</span>
				<button id="right-arrow"><i class="fas fa-arrow-right"></i></button>
			</div>
		`;

	} catch (e) {
		console.error('Error in innerCustomBallInput:', e);
	}
}

// ===========================================================================
// ==================== Init =================================================
// ===========================================================================


/**
 * Initializes the Element settings for the game.
 *
 * This function checks if the `CustomElement` object exists. If it does, 
 * it displays the Element and updates the input fields related to it. 
 * If not, it creates a new Element instance.
 *
 * @returns {Promise<void>} - An async function that initializes Element settings.
 */
async function initializeBall() {
    try {
        if (game.Customball) {
            game.showBall();
			let data = await serializeCustomGame(game);
            await updateCustomInput(defaultCustomValue.custom_ball, data.custom_ball);
        } else {
            await game.createBall();
        }
    } catch {
        console.error('error in initializeBall');
    }
}


// ===========================================================================
// ==================== UPDATE DATA ==========================================
// ===========================================================================

function updateBallColor(value) {
	if (pongCustomManager.checkColor(value)) {
		const color = pongCustomManager.hexToRgb(value);
		game.Customball.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
		game.Customball.colorValue = hexToHexString(value);
	} else
		console.error('Invalid hex color:', value);
}

function updateBallSize(value) {
	if (pongCustomManager.checkRange(value, 0.5, 2, 0.01, 'ball-size'))
		game.Customball.radius = parseFloat(value);
	else
		console.error('Invalide Ball Size');
}

function updateBallEmissiveIntensity(value) {
	if (pongCustomManager.checkRange(value, 10, 300, 1, 'ball-Emissive-intensit'))
		game.Customball.intensity = parseFloat(value);
	else
		console.error('Invalide ball-Emissive-intensit');
}

function updateBallLightIntensity(value) {
	if (pongCustomManager.checkRange(value, 10, 400, 1, 'ball-light-intensity'))
		game.Customball.light.intensity = parseFloat(value);
	else
		console.error('Invalide Ball ball-light-intensity');
}

function updateBallLightColor(value) {
	if (pongCustomManager.checkColor(value)) {
		const color =  pongCustomManager.hexToRgb(value);
		game.Customball.light.color = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
		game.Customball.colorLightValue = hexToHexString(value);
	} else
		console.error('Invalid hex color:', value);
}

function updateBallAccessory(value) {
	let options = ['option1', 'option2', 'option3'];
	if (pongCustomManager.checkSelect(value, options))
		game.Customball.option = value;
	else
		console.error('Invalid options :', value);
}


// ===========================================================================
// ==================== CAM ==================================================
// ===========================================================================


async function toggleUpdateCAM_ball() {
	try {
		const cameraModes = ['rotate', 'focus ball', 'libre'];
		let currentModeIndex = 0;

		let updateCameraModeDisplay = () => {
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
		console.error(e)
	}
}


// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
    toggleBall
}