export const ModuleOptions = {
    LITE_MODE: 'litemode',
    MARKDOWN: 'markdown',
    BLUE_ME: 'blueme',
};

export class ModuleSettings {
    static MODULE_NAME = 'bugvolution';

	static registerSettings() {
        game.settings.register(this.MODULE_NAME, ModuleOptions.LITE_MODE, this._buildConfig(ModuleOptions.LITE_MODE));
        game.settings.register(this.MODULE_NAME, ModuleOptions.MARKDOWN, this._buildConfig(ModuleOptions.MARKDOWN, {
            default: true
        }));
        game.settings.register(this.MODULE_NAME, ModuleOptions.BLUE_ME, this._buildConfig(ModuleOptions.BLUE_ME));
	}

	static getSetting(option) {
		return game.settings.get(this.MODULE_NAME, option);
    }

    /** @private */
    static _getNameConfig(optionName) {
        return {
            name: `${this.MODULE_NAME}.${optionName}-s`,
            hint: `${this.MODULE_NAME}.${optionName}-l`
        };
    }
    
    /** @private */
    static _buildConfig(optionName, config = {}) {
        const defaultConfig = {
            scope: "client",
            config: true,
            default: false,
            type: Boolean,
            onChange: x => window.location.reload()
        };
        return {
            ...defaultConfig,
            ...this._getNameConfig(optionName),
            ...config
        };
    }
}