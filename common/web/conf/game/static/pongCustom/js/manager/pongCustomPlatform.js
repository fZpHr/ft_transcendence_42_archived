import * as THREE from 'three';
import * as pongCustomManager from '../pongCustom.js'
import * as pongCustomAccessory from './pongCustomAccessory.js'
import {game} from '../pongCustom.js'


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
	'platform-color': updatePlatformColor,
	'platform-size': updatePlatformSize,
	'platform-reflexion': updatePlatformReflexion,
	'platform-light': updatePlatformLight,
    'platform-emissive-light': updatePlatformEmissiveLight,
	'border-color': updatePlatformBorderColor,
	'limiteur-color': updatePlatformLimiteurColor,
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
async function togglePlatform() {
	try {
		innerCustomPlatform();
        pongCustomManager.toggleBackCustomManager();
		pongCustomAccessory.innerAccessory(2);
		pongCustomAccessory.toggleCustonAccessory();
		toggleCustomPlatformUpdate();
		// toggleUpdateCAM();
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
async function toggleCustomPlatformUpdate() {
    await initializePlatform();
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
		// game.CustomPlatform.updatePlatform();
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
async function innerCustomPlatform() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Platform</span>
                <i class="fas fa-arrow-left" id="back_custom" data-type="plateau"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element color">
                    <label for="platform-color">Fond color :</label>
                    <input type="color" id="platform-color" name="platform-color" value="#FF0000">
                </div>
                <div class="custom-option-element">
                    <label for="platform-size">Size :</label>
                    <input type="range" id="platform-size" class="size-input" min="20" max="60" step="1" value="41">
                </div>
                <div class="custom-option-element">
                    <label for="platform-reflexion">Reflexion :</label>
                    <input type="range" id="platform-reflexion" class="size-input" min="0" max="1" step="0.01" value="0">
                </div>
                <div class="custom-option-element">
                    <label for="platform-light">Light :</label>
                    <input type="range" id="platform-light" class="size-input" min="0" max="500" step="1" value="0">
                </div>
                <div class="custom-option-element">
                    <label for="platform-emissive-light">Emissive Light :</label>
                    <input type="range" id="platform-emissive-light" class="size-input" min="0" max="500" step="1" value="0">
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
	} catch (e) {
		console.log(e)
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
async function initializePlatform() {
    try {
        if (game.CustomPlateau) {
            game.showPlateau();
            await updateCustomPlatformInput();
        } else {
            await game.createPlateau();
        }
    } catch {
        console.error('error in initializePlatform');
    }
}


// ===========================================================================
// ==================== UPDATE INPUT =========================================
// ===========================================================================


/**
 * Updates the input fields related to custom Element settings.
 *
 * This function is intended to refresh the UI elements that control 
 * Element parameters. Specific implementation details should be 
 * added within the function.
 *
 * @returns {Promise<void>} - An async function that updates Element inputs.
 */
async function updateCustomPlatformInput () {
	try {

	} catch {
		console.error('error in updateCustomPlatformInput')
	}
}


// ===========================================================================
// ==================== UPDATE DATA ==========================================
// ===========================================================================


async function updatePlatformColor(value) {
    let colorPlateau = pongCustomManager.hexToRgb(event.target.value);
    game.CustomPlateau.plateau_data.color = new THREE.Color(`rgb(${colorPlateau.r},${colorPlateau.g},${colorPlateau.b})`).convertSRGBToLinear();
    game.CustomPlateau.plateau_data.THREEcolor = new THREE.Color(`rgb(${colorPlateau.r},${colorPlateau.g},${colorPlateau.b})`).convertSRGBToLinear();
    game.CustomPlateau.updatePlateau('plateau');
}

async function updatePlatformSize(value) {
    game.CustomPlateau.radius = parseFloat(event.target.value);
    game.CustomPlateau.updatePlateau("all");
}

async function updatePlatformReflexion(value) {
    game.CustomPlateau.plateau_data.opacity = parseFloat(event.target.value);
    game.CustomPlateau.updatePlateau('plateau');
}

async function updatePlatformLight(value) {
    let float = parseFloat(event.target.value);
    game.CustomPlateau.light.intensity = float;
    game.CustomPlateau.updatePlateau('lights');
}

async function updatePlatformBorderColor(value) {
    let colorBorder = pongCustomManager.hexToRgb(event.target.value);
    game.CustomPlateau.wall.color = new THREE.Color(`rgb(${colorBorder.r},${colorBorder.g},${colorBorder.b})`).convertSRGBToLinear();
    game.CustomPlateau.wall.THREEcolor = new THREE.Color(`rgb(${colorBorder.r},${colorBorder.g},${colorBorder.b})`).convertSRGBToLinear();
    game.CustomPlateau.light.THREEcolor = new THREE.Color(`rgb(${colorBorder.r},${colorBorder.g},${colorBorder.b})`).convertSRGBToLinear();
    game.CustomPlateau.updatePlateau('lights');
    game.CustomPlateau.updatePlateau('border');
}

async function updatePlatformLimiteurColor(value) {
    let colorBorder = pongCustomManager.hexToRgb(event.target.value);
    game.CustomPlateau.boudth.THREEcolor = new THREE.Color(`rgb(${colorBorder.r},${colorBorder.g},${colorBorder.b})`).convertSRGBToLinear();
    game.CustomPlateau.updatePlateau('boudth');
}


async function updatePlatformEmissiveLight(value) {
    let float = parseFloat(event.target.value);
    game.CustomPlateau.plateau_data.intensity = float;
    game.CustomPlateau.wall.emissiveIntensity = float;
    game.CustomPlateau.updatePlateau('border');
    game.CustomPlateau.updatePlateau('plateau');
}

// ===========================================================================
// ==================== CAM ==================================================
// ===========================================================================




// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
    togglePlatform
}