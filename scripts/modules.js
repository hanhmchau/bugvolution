class ModulesHelper {
    constructor() {
        this._chatPortrait = undefined;
    }

	get chatPortrait() {
        if (this._chatPortrait === undefined) {
            this._chatPortrait = game.modules.get('ChatPortrait') && game.modules.get('ChatPortrait').active;
        }
        return this._chatPortrait;
	}
}

export default new ModulesHelper();
