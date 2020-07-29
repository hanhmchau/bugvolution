import AbstractMessage from './message.js';
import { ModuleOptions, ModuleSettings } from './settings.js';

export default class EmoteMessage extends AbstractMessage {
	static CLASS_NAMES = {
		MODIFIED: 'modified'
	};

	static TEMPLATES = {
		EMOTE_MESSAGE: 'modules/bugvolution/templates/emote_message.hbs'
	};

	static init() {
		loadTemplates([this.TEMPLATES.EMOTE_MESSAGE]);
	}

	static process(chatMessage, html, messageData) {
		const isLiteMode = ModuleSettings.getSetting(ModuleOptions.LITE_MODE);
		if (!isLiteMode) {
			if (chatMessage.data.type === CHAT_MESSAGE_TYPES.EMOTE) {
				html.addClass(this.CLASS_NAMES.MODIFIED);
				const actor = this.loadActorForChatMessage(messageData);

				const renderData = {
					avatar: this.getChatTokenImage(actor),
					speaker: messageData.alias,
					content: messageData.message.content
				};
				renderTemplate(this.TEMPLATES.EMOTE_MESSAGE, renderData).then((renderedHTML) => {
					$(html).html(renderedHTML);
					// ui.chat.scrollBottom();
				});
			}
		}
	}

	static resolveMeCommand(messageData) {
		const any = '([^]*)'; // Any character, including new lines
		const mePattern = new RegExp('^(/me )' + any, 'i');

		const isIC = messageData.type === CHAT_MESSAGE_TYPES.IC;
		const isOOC = messageData.type === CHAT_MESSAGE_TYPES.OOC;

		if (isIC || isOOC) {
			const meMatch = messageData.content.match(mePattern);
			if (meMatch) {
				messageData.type = CONST.CHAT_MESSAGE_TYPES.EMOTE;
				let alias = '';

				if (isIC) {
					alias = messageData.speaker.alias;
				}

				if (isOOC) {
					const actor = this.loadPlayerForToken(messageData.user);
					if (actor) {
						alias = actor.name;
					}
				}
				messageData.content = messageData.content.replace('/me', alias);
			}
		}

		return true;
	}
}
