import * as THREE from 'three';
import * as pongCustomManager from '../pongCustom.js'
import * as pongCustomAccessory from './pongCustomAccessory.js'
import { game } from '../pongCustom.js'


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
    'paddle-color': updatePaddleColor,
    'paddle-size': updatePaddleSize,
    'paddle-reflexion': updatePaddleReflexion,
    'paddle-light': updatePaddleLight,
    'paddle-light-color': updatePaddleLightColor
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
async function togglePaddle() {
    try {
        innerCustomPaddle();
        pongCustomManager.toggleBackCustomManager();
        pongCustomAccessory.innerAccessory(3);
        pongCustomAccessory.toggleCustonAccessory();
        toggleCustomPaddleUpdate();
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
async function toggleCustomPaddleUpdate() {
    await initializePaddle();
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
        game.CustomPaddle.updatePaddle();
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
async function innerCustomPaddle() {
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
                 <div class="custom-option-element color">
                    <label for="paddle-light-color">Light Color :</label>
                    <input type="color" id="paddle-light-color" name="paddle-light-color" value="#FF0000">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-light">Light :</label>
                    <input type="range" id="paddle-light" class="size-input" min="0" max="500" step="1" value="0">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-reflexion">Emissive :</label>
                    <input type="range" id="paddle-reflexion" class="size-input" min="0" max="500" step="1" value="0">
                </div>
                <div class="custom-option-element">
                    <label for="paddle-size">Size :</label>
                    <input type="range" id="paddle-size" class="size-input" min="0.26179938779" max="0.78539816339" step="0.01" value="0.52359877559">
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
async function initializePaddle() {
    try {
        if (game.CustomPaddle) {
            game.showPaddle();
            await updateCustomPaddleInput();
        } else {
            await game.createPaddle();
        }
    } catch {
        console.error('error in initializePaddle');
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
async function updateCustomPaddleInput() {
    try {

    } catch {
        console.error('error in updateCustomPaddleInput')
    }
}


// ===========================================================================
// ==================== UPDATE DATA ==========================================
// ===========================================================================


async function updatePaddleColor(value) {
    if (pongCustomManager.checkColor(value)) {
        const color = pongCustomManager.hexToRgb(value);
        game.CustomPaddle.THREEcolor = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
        await game.CustomPaddle.updatePaddle();
    } else
        console.error('Invalid hex color:', value);
}

async function updatePaddleLight(value) {
    if (pongCustomManager.checkRange(value, 0, 500, 1, 'paddle-light')) {
        game.CustomPaddle.light.intensity = parseFloat(value);
        await game.CustomPaddle.updatePaddle();
    }
    else
        console.error('Invalide paddle-light');
}

async function updatePaddleReflexion(value) {
    if (pongCustomManager.checkRange(value, 0, 500, 1, 'paddle-reflexion')) {
        game.CustomPaddle.material.emissiveIntensity = parseFloat(value);
        await game.CustomPaddle.updatePaddle();
    }
    else
        console.error('Invalide paddle-reflexion');
}

async function updatePaddleSize(value) {
    if (pongCustomManager.checkRange(value, 0.26179938779, 0.78539816339, 0.01, 'paddle-size')) {
        game.CustomPaddle.geo.arc = parseFloat(value);
        await game.CustomPaddle.updatePaddle();
    }
    else
        console.error('Invalide ');
}

async function updatePaddleLightColor(value) {
    if (pongCustomManager.checkColor(value)) {
        const color = pongCustomManager.hexToRgb(value);
        game.CustomPaddle.light.THREEcolor = new THREE.Color(`rgb(${color.r},${color.g},${color.b})`).convertSRGBToLinear();
        await game.CustomPaddle.updatePaddle();
    } else
        console.error('Invalid hex color:', value);
}

// ===========================================================================
// ==================== CAM ==================================================
// ===========================================================================



// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
    togglePaddle
}