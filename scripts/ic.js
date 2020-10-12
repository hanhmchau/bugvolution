import AbstractMessage from './message.js';
import ModulesHelper from './modules.js';
import { ModuleOptions, ModuleSettings } from './settings.js';

export default class InCharacterMessage extends AbstractMessage {
	static CLASS_NAMES = {
		MODIFIED: 'modified',
		ROLL_UI: 'roll-ui',
		LITE_UI: 'lite-ui',
		LEADING: 'leading', // first message in a group of messages
		CONTINUED: 'continued', // all messages following,
		ROLL: 'roll'
	};

	static TEMPLATES = {
		CHAT_MESSAGE: 'modules/bugvolution/templates/chat_message.hbs'
	};

	static init() {
		loadTemplates([this.TEMPLATES.CHAT_MESSAGE]);

		Handlebars.registerHelper('getWhisperList', this.getWhisperTargets);
	}

	static async process(chatMessage, html, messageData) {
		const originalHTML = html.clone(true);
		const isLiteMode = ModuleSettings.getSetting(ModuleOptions.LITE_MODE);
		if (isLiteMode) {
			this._addClass(html, this.CLASS_NAMES.LITE_UI);
		} else {
			this._addClass(html, this.CLASS_NAMES.ROLL_UI);
		}

		const actor = this.loadActorForChatMessage(messageData);
		const user = chatMessage.data.user || chatMessage.user.id;
		const isWhisper = chatMessage.data.type === CHAT_MESSAGE_TYPES.WHISPER;
		const isDiceRoll = chatMessage.data.type === CHAT_MESSAGE_TYPES.ROLL;
		const isRerenderableType = this.isRerenderableType(chatMessage);
		const isRollTemplate = this.isDiceRollTemplate(chatMessage, html);
		const isRoll = isRollTemplate || isDiceRoll;
		const isValidGroupableType = this.isValidGroupableType(chatMessage);
		const avatar = this.getChatTokenImage(actor) || this.getUserImage(user);

		let renderData = {
			avatar,
			timestamp: messageData.message.timestamp,
			speaker: messageData.alias,
			content: messageData.message.content,
			whisperTo: messageData.whisperTo,
			isWhisper,
			isRoll
		};
		if (isRerenderableType) {
			this._addClass(html, this.CLASS_NAMES.MODIFIED);
		}
		if (isRoll) {
			this._addClass(html, this.CLASS_NAMES.ROLL);
		}
		if (isValidGroupableType) {
			// DELETE INLINE STYLES
			$(html).removeAttr('style');
		}

		let isContinuation = false;
		// ADD CONTINUATION CLASS
		if (!chatMessage.data.forceLeading && isValidGroupableType) {
			const previousMessage = this.loadPreviousMessage(chatMessage);
			if (previousMessage) {
				isContinuation = this.isContinuationFromPreviousMessage(previousMessage.data, chatMessage.data);
			}
		}
		renderData.isContinuation = isContinuation;

		if (isContinuation) {
			this._addClass(html, this.CLASS_NAMES.CONTINUED);
		} else {
			this._addClass(html, this.CLASS_NAMES.LEADING);
		}

		if (!isLiteMode && isRerenderableType) {
			const renderedHTML = await renderTemplate(this.TEMPLATES.CHAT_MESSAGE, renderData);
			$(html).html(renderedHTML);

			if (isRollTemplate) {
				$(html).find('.roll-content').html(originalHTML.find('.red-full.chat-card'));
			}
			// renderTemplate(this.TEMPLATES.CHAT_MESSAGE, renderData).then((renderedHTML) => {
			// 	$(html).html(renderedHTML);
			// 	// ui.chat.scrollBottom();
			// });
		}
		if (isLiteMode && ModulesHelper.chatPortrait) {
			if (!actor && avatar) {
				// Place the image to left of the header by injecting the HTML
				const img = document.createElement('img');
				const authorColor = messageData.author ? messageData.author.data.color : "black";
				img.src = avatar;
				const size = game.settings.get('ChatPortrait', 'portraitSize');
				img.width = size;
				img.height = size;
				PortraitsOnChatMessage.setImageBorderShape(img, authorColor);
				let element = html.find('.message-header')[0];
				element.prepend(img);
			}
		}
	}

	/**
	 * Returns a message is a dice roll template
	 * @param {*} chatMessage
	 * @param {*} html
	 */
	static isDiceRollTemplate(chatMessage, html) {
		return $(html).find('.dnd5e.red-full').length > 0;
	}

	/**
	 * Returns a message is a valid rerenderable type
	 * @param {*} chatMessage
	 */
	static isRerenderableType(chatMessage) {
		const groupableMessageTypes = [
			CHAT_MESSAGE_TYPES.OOC,
			CHAT_MESSAGE_TYPES.IC,
			CHAT_MESSAGE_TYPES.WHISPER,
			CHAT_MESSAGE_TYPES.OTHER,
			CHAT_MESSAGE_TYPES.ROLL
		];
		return groupableMessageTypes.includes(chatMessage.data.type) && chatMessage.data.speaker.alias !== '#CGMP_DESCRIPTION';
	}

	/**
	 * Returns a message is a valid groupable type
	 * @param {*} chatMessage
	 */
	static isValidGroupableType(chatMessage) {
		const groupableMessageTypes = [CHAT_MESSAGE_TYPES.OOC, CHAT_MESSAGE_TYPES.IC, CHAT_MESSAGE_TYPES.WHISPER];
		return groupableMessageTypes.includes(chatMessage.data.type) && chatMessage.data.speaker.alias !== '#CGMP_DESCRIPTION'; // to play nice with Cautious Gamemaster's Pack's /desc command
	}

	/**
	 * Returns whether the next message is the continuation of the previous message
	 * i.e. the two messages are both from the same actor, are both the same type of groupable messges, have the same recipients
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isContinuationFromPreviousMessage(prevMessage, nextMessage) {
		const isTheSameGroupableType = prevMessage.type === nextMessage.type; // nextMessage.type is already confirmed to be groupable
		const isFromTheSameActor = this.isFromTheSameActor(prevMessage, nextMessage);
		const sameWhisperRecipients = this.sameWhisperRecipients(prevMessage, nextMessage);
		return isFromTheSameActor && sameWhisperRecipients && isTheSameGroupableType;
	}

	/**
	 * Returns whether two speakers are the same.
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isFromTheSameActor(prevMessage, nextMessage) {
		const prevSpeaker = prevMessage.speaker;
		const nextSpeaker = nextMessage.speaker;
		const isWhisper = nextMessage.type === CHAT_MESSAGE_TYPES.WHISPER;
		const isOOC = nextMessage.type === CHAT_MESSAGE_TYPES.OOC;

		if (prevSpeaker.token) {
			return prevSpeaker.token === nextSpeaker.token;
		}
		if (prevSpeaker.alias) {
			return prevSpeaker.alias === nextSpeaker.alias;
		}
		if (isWhisper || isOOC) {
			return prevMessage.user === nextMessage.user;
		}
		return false;
	}

	/**
	 * Returns whether two messages have the same whisper recipients
	 * Note: Two public messages will return true (both have no whisper recipients)
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static sameWhisperRecipients(prevMessage, nextMessage) {
		if (!prevMessage.whisper || !nextMessage.whisper) {
			this._warn('WHISPER PROPERTY OF CHAT MESSAGE NOT FOUND');
			return false;
		}
		const prevWhispers = prevMessage.whisper;
		const nextWhispers = nextMessage.whisper;
		if (prevWhispers.length !== nextWhispers.length) return false;
		for (let i = 0; i < prevWhispers.length; i++) {
			if (prevWhispers[i] !== nextWhispers[i]) return false;
		}
		return true;
	}

	/**
	 * Load the previous message of a message
	 * @param {*} messageData
	 */
	static loadPreviousMessage(chatMessage) {
		const messages = game.messages.entries;
		let index = messages.indexOf(chatMessage);
		while (index - 1 >= 0) {
			if (messages[index - 1].visible) {
				return messages[index - 1];
			}
			index--;
		}
	}
}
