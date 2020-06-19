export default class AutoscrollCombatTracker extends CombatTracker {
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

		const active = popout.element.find(".active")[0];

		if (active) {
			const container = active.parentElement;
			const nViewable = Math.floor(container.offsetHeight / active.offsetHeight);
			container.scrollTop = (this.combat.turn * active.offsetHeight) - ((nViewable/2) * active.offsetHeight);
		}
	}
}
