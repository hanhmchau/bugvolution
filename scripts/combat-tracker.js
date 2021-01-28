export default class AutoscrollCombatTracker extends CombatTracker {
	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			originalClass: CombatTracker,
			baseApplication: 'CombatTracker'
		});
	}
	/** @override */
	/**
	 * Scroll the combat log container to ensure the current Combatant turn is centered vertically
	 */
	scrollToTurn() {
		// Scroll the combat tracker in the sidebar
		super.scrollToTurn();
		this.scrollPopoutToTurn();
	}

	scrollPopoutToTurn() {
		if (!this.combat) return;
		const popout = this._popout;
		if (!popout) return;

		const active = popout.element.find('.active')[0];

		if (active) {
			const container = active.parentElement;
			const nViewable = Math.floor(container.offsetHeight / active.offsetHeight);
			container.scrollTop = this.combat.turn * active.offsetHeight - (nViewable / 2) * active.offsetHeight;
		}
	}
}

class CombatTrackerPopper {
	constructor() {
		this.popout = null;
	}

	popIn() {
		this.popout = ui.combat.createPopout();
		this.popout.render(true);
	}

	popAway() {
		if (this.popout || ui.combat._popout) {
			setTimeout(() => {
				if (ui.combat._popout) {
					ui.combat._popout.close();
				}
				if (this.popout) {
					this.popout.close();
				}
			}, 100);
		}
	}
}
export class CombatTrackerHooks {
	static attach() {
		const popper = new CombatTrackerPopper();
		Hooks.on('createCombat', popper.popIn.bind(popper));
		Hooks.on('deleteCombat', popper.popAway.bind(popper));
	}
}
