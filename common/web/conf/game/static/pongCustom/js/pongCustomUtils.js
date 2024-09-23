function addCustomInputsToContainer(container, customBall) {
	for (let key in customBall) {
		let setting = customBall[key];
		addCustomInput(container, key, setting);
	}
}

function addCustomInput(container, key, setting) {
	let inputHtml = '';
	if (setting.type === 'color') {
		inputHtml = `
			<div class="custom-option-element color">
				<label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1)} :</label>
				<input type="color" id="${key}" name="${key}" value="${convertHexColor(setting.value)}">
			</div>
		`;
	} else if (setting.type === 'range') {
		inputHtml = `
			<div class="custom-option-element">
				<label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1)} :</label>
				<input type="range" class="size-input" id="${key}" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${setting.value}">
			</div>
		`;
	} else if (setting.type === 'select') {
		inputHtml = `
			<div class="custom-option-element">
				<label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1)} :</label>
				<select id="${key}">
					${setting.options.map(option => `<option value="${option}">${option}</option>`).join('')}
				</select>
			</div>
		`;
	}
	container.innerHTML += inputHtml;
}

function convertHexColor(hexColor) {
    if (hexColor.startsWith('0x')) {
        return '#' + hexColor.slice(2);
    }
    return hexColor;
}

function hexToHexString(hex) {
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }
    return '0x' + hex.toUpperCase();
}

// ===========================================================================
// ==================== UPDATE INPUT =========================================
// ===========================================================================


async function updateCustomInput(defaultElementData, customElement) {
	try {
		for (let key in defaultElementData) {
			const setting = defaultElementData[key];
			if (setting.type === 'none') continue;
			const inputElement = document.getElementById(`${key}`);
			if (inputElement) {
				if (setting.type === 'color')
					inputElement.value = convertHexColor(customElement[setting.target]);
				else if (setting.type === 'range')
					inputElement.value = customElement[setting.target];
				else if (setting.type === 'select')
					inputElement.value = customElement[setting.target];
			}
		}
	} catch (e) {
		console.error(`Error in updateCustomInput for ${prefix}:`, e);
	}
}

export {
    addCustomInputsToContainer,
	updateCustomInput,
	hexToHexString,
}