export default class RollIconsModification {
	static abilityMap = {
		str: ['strength check', 'strength save', 'athletics'],
		dex: ['dexterity check', 'dexterity save', 'acrobatics', 'sleight of hand', 'stealth'],
		con: ['constitution check', 'constitution save'],
		int: ['intelligence check', 'intelligence save', 'arcana', 'history', 'investigation', 'nature', 'religion'],
		wis: ['wisdom check', 'wisdom save', 'animal handling', 'insight', 'medicine', 'perception', 'survival'],
		cha: ['charisma check', 'charisma save', 'deception', 'intimidation', 'performance', 'persuasion']
	};

	static keyMap = {};

	static init() {
		for (const key in this.abilityMap) {
			for (const item of this.abilityMap[key]) {
				this.keyMap[item] = key;
			}
		}
	}

	static process(chatMessage, html, data) {
		if (!html.find('.red-full').length) {
			return;
		}

		const itemNameEl = html.find('.item-name');
		if (itemNameEl.length > 0) {
			const itemName = itemNameEl.html().trim().toLowerCase();
			const skillCheck = this.keyMap[itemName];
			if (skillCheck) {
				const image = this.getSkillCheckImage(skillCheck);
				if (image) {
                    const iconEl = html.find('header.red-header').find('img');
                    iconEl.attr('src', image);
				}
			}
		}
	}

	static getSkillCheckImage(skill) {
		switch (skill) {
			case 'str':
				return 'systems/dnd5e/icons/skills/blood_11.jpg';
			case 'dex':
				return 'systems/dnd5e/icons/skills/yellow_35.jpg';
			case 'con':
				return 'systems/dnd5e/icons/skills/green_19.jpg';
			case 'int':
				return 'systems/dnd5e/icons/skills/red_26.jpg';
			case 'wis':
				return 'systems/dnd5e/icons/skills/emerald_11.jpg';
			case 'cha':
				return 'systems/dnd5e/icons/skills/violet_18.jpg';
			default:
				return '';
		}
	}
}
