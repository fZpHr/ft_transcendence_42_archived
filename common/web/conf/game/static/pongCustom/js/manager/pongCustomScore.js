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
    'Score-color': updateScoreColor,
	'Score-Light': updateScoreLight,
	'score-font': updateScoreFont,
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
async function toggleScore() {
	try {
		innerCustomScoreInput();
        pongCustomManager.toggleBackCustomManager();
		pongCustomAccessory.innerAccessory(5);
		pongCustomAccessory.toggleCustonAccessory();
		toggleCustomScoreUpdate();
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
async function toggleCustomScoreUpdate() {
    await initializeScore();
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
		game.CustomScore.updateScore();
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
async function innerCustomScoreInput() {
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
async function initializeScore() {
    try {
        if (game.CustomScore) {
            game.showScore();
            await updateCustomScoreInput();
        } else {
            await game.createScore();
        }
    } catch {
        console.error('error in initializeScore');
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
async function updateCustomScoreInput () {
	try {

	} catch {
		console.error('error in updateCustomScoreInput')
	}
}


// ===========================================================================
// ==================== UPDATE DATA ==========================================
// ===========================================================================


function updateScoreColor(value) {
	if (pongCustomManager.checkColor(value)) {
		const color =  pongCustomManager.hexToRgb(value);
		// game.CustomScore. = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
	} else
		console.error('Invalid hex color:', value);
}

function updateScoreLight(value) {
    if (pongCustomManager.checkRange(value, 0.1, 1, 0.01, 'score-light')) {
        // game.CustomPaddle. = parseFloat(value);
    }
    else
        console.error('Invalide score-light');
}

function updateScoreFont(value) {
	let options = ['option1', 'option2', 'option3'];
	if (pongCustomManager.checkSelect(value, options)) {
		// game.Customball.option = value;
    }
	else
		console.error('Invalid options :', value);
}


// ===========================================================================
// ==================== CAM ==================================================
// ===========================================================================




// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
    toggleScore
}