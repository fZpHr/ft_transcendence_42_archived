import * as THREE from 'three';
import * as pongCustomManager from '../pongCustom.js'
import { game } from '../pongCustom.js'
import { CustomBall } from '../class/CustomBall.js';

// ===========================================================================
// ==================== Toggle ===============================================
// ===========================================================================


/**
 * Initializes toggle event listeners for accessory buttons.
 *
 * Attaches change listeners to all elements with the class `accessory-btn`. 
 * When toggled, it retrieves the associated accessory function via 
 * `getAccessoryChangeFunc` and calls it with the button's checked state.
 *
 * @returns {Promise<void>} - Handles the toggle functionality for accessories.
 */
async function toggleCustonAccessory() {
	try {
		let allInput = document.getElementsByClassName('accessory-btn');

		Array.from(allInput).forEach(input => {
			let accessoryName = input.getAttribute('data-accessory');
			input.addEventListener('change', function () {
				let type = input.getAttribute('data-accessory')
				let func = getAccessoryChangeFunc(type);
				if (func) func(input.checked);
			});
		});
	} catch (error) {
		console.error('error in toggleCustonAccessory', error);
	}
}

// ===========================================================================
// ==================== INNER ================================================
// ===========================================================================


/**
 * Displays accessory options based on the specified levels.
 *
 * This function populates the accessory box with checkboxes for each accessory 
 * defined in the array. It shows only the number of accessories specified by `levels`. 
 * Each checkbox reflects the initial checked state defined in the accessories array.
 *
 * @param {number} levels - The number of accessories to display.
 * @returns {Promise<void>} - An async function that updates the accessory UI.
 */
async function innerAccessory(levels) {
	try {
		let boxCustome = document.getElementById('pongCustom-accessory');
		boxCustome.style.display = "";
		const accessories = [
			{ name: 'Grid', checked: true },
			{ name: 'Ball', checked: false },
			{ name: 'Platform', checked: false },
			{ name: 'Paddle', checked: false },
			{ name: 'Map', checked: false },
			{ name: 'Score', checked: false },
		];
		let accessoriesToShow = accessories.slice(0, levels);
		let innerHTML = `
			<div class="title-custom-lst">
				<h1>Accessory</h1>
			</div>
			<div class="customs_box_accessory">
		`;
		accessoriesToShow.forEach(accessory => {
			innerHTML += `
				<div class="element_accessory">
					<span>${accessory.name}</span>
					<input class="accessory-btn" type="checkbox" ${accessory.checked ? 'checked' : ''} style="--s:20px" data-accessory="${accessory.name}">
				</div>
			`;
		});
		innerHTML += '</div>';
		boxCustome.innerHTML = innerHTML;
	} catch (error) {
		console.error('error in innerAccessory', error);
	}
}


// ===========================================================================
// ==================== Hide =================================================
// ===========================================================================


async function hideCustomAccessory() {
	try {
		let customAccessory = document.getElementById('pongCustom-accessory');
		customAccessory.innerHTML = '';
		customAccessory.style.display = "none";
		game.scene.add(game.grid);
	} catch (e) {
		console.error(e)
	}
}


// ===========================================================================
// ==================== Update ===============================================
// ===========================================================================


/**
 * Updates the grid accessory in the game scene.
 *
 * @param {boolean} isCheck - Indicates whether the grid should be added or removed.
 */
function accessoryUpdateGrid(isCheck) {
	if (isCheck)
		game.scene.add(game.grid);
	else
		game.scene.remove(game.grid);

	console.log("Grid accessoryUpdated! =>", isCheck);
}

async function accessoryUpdateBall(isCheck) {
	console.log("Ball accessoryUpdated! =>", isCheck);
	if (isCheck) {
		if (game.creationPlateau) {
			if (game.Customball == undefined) {
				game.Customball = new CustomBall(game);
				await game.Customball.init();
			}
			game.scene.add(game.Customball.group);
			game.CustomPlateau.showball = true;
			game.CustomPlateau.ballDirection = new THREE.Vector3(0.2, 0, 0.2);
			game.Customball.group.position.y = 10 + (game.Customball.radius / 2);
		}
	}
	else {
		game.CustomPlateau.showball = false;
		game.scene.remove(game.Customball.group);
		game.Customball.group.position.set(0, (game.Customball.radius), 0);
	}
}

function accessoryUpdatePlatform(isCheck) {
	console.log("Platform accessoryUpdated! =>", isCheck);
}

function accessoryUpdatePaddle(isCheck) {
	console.log("Net accessoryUpdated! =>", isCheck);
}

function accessoryUpdateMap(isCheck) {
	console.log("Net accessoryUpdated! =>", isCheck);
}

function accessoryUpdateScore(isCheck) {
	console.log("Net accessoryUpdated! =>", isCheck);
}


// ===========================================================================
// ==================== Utils ================================================
// ===========================================================================


/**
 * Returns the corresponding accessory update function based on the accessory name.
 *
 * @param {string} accessoryName - The name of the accessory.
 * @returns {Function|null} - The function to update the accessory or null if not found.
 */
function getAccessoryChangeFunc(accessoryName) {
	const functionsAccessory = {
		'grid': accessoryUpdateGrid,
		'ball': accessoryUpdateBall,
		'platform': accessoryUpdatePlatform,
		'paddle': accessoryUpdatePaddle,
		'Map': accessoryUpdateMap,
		'Score': accessoryUpdateScore
	};
	return functionsAccessory[accessoryName.toLowerCase()];
}


// ===========================================================================
// ==================== Export ===============================================
// ===========================================================================


export {
	innerAccessory,
	toggleCustonAccessory,
	hideCustomAccessory,
}