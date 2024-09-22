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
    'map-background': updateMapBackground,
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
async function toggleMap() {
	try {
		innerCustomMapInput();
        pongCustomManager.toggleBackCustomManager();
		pongCustomAccessory.innerAccessory(4);
		pongCustomAccessory.toggleCustonAccessory();
		toggleCustomMapUpdate();
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
async function toggleCustomMapUpdate() {
    await initializeMap();
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
		game.CustomMap.updateMap();
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
async function innerCustomMapInput() {
	try {
		let customBox = document.getElementById('custom-box');
		customBox.innerHTML = `
            <div class="title-custom">
                <span>Map</span>
                <i class="fas fa-arrow-left" id="back_custom"></i>
            </div>
            <div class="custom-option">
                <div class="custom-option-element">
                    <label for="map-background">Background :</label>
                    <select id="map-background">
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
async function initializeMap() {
    try {
        if (game.CustomMap) {
            game.showMap();
            await updateCustomMapInput();
        } else {
            await game.createMap();
        }
    } catch {
        console.error('error in initializeMap');
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
async function updateCustomMapInput () {
	try {

	} catch {
		console.error('error in updateCustomMapInput')
	}
}


// ===========================================================================
// ==================== UPDATE DATA ==========================================
// ===========================================================================


function updateMapBackground(value) {
	let options = ['option1', 'option2', 'option3'];
	if (pongCustomManager.checkSelect(value, options)) {
		// game.CustomMap.option = value;
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
    toggleMap
}