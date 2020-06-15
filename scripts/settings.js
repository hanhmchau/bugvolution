export const ModuleOptions = {
	LITE_MODE: 'liteMode'
};

export class ModuleSettings {
    static MODULE_NAME = 'bugvolution';

	static registerSettings() {
        game.settings.register(this.MODULE_NAME, 'liteMode', {
            name: "bugvolution.litemode-s",
            hint: "bugvolution.litemode-l",
            scope: "world",
            config: true,
            default: false,
            type: Boolean,
            onChange: x => window.location.reload()
          });
	}

	static getSetting(option) {
		return game.settings.get(this.MODULE_NAME, option);
	}
}