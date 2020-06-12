export default class InCharacterMessage {
	static CLASS_NAMES = {
		MODIFIED: "modified",
		LEADING: "leading", // first message in a group of messages
		CONTINUED: "continued", // all messages following
	};

	static TEMPLATES = {
		CHAT_MESSAGE: "modules/bugvolution/templates/chat_message.hbs",
	};

	static init() {
		loadTemplates([this.TEMPLATES.CHAT_MESSAGE]);

		Handlebars.registerHelper("getWhisperList", this.getWhisperTargets);
	}

	static process(chatMessage, html, messageData) {
		// ADD CONTINUATION CLASS
		if (this.isValidGroupableType(chatMessage)) {
			// DELETE INLINE STYLES
			$(html).removeAttr("style");

			this._addClass(html, this.CLASS_NAMES.MODIFIED);

			const previousMessage = this.loadPreviousMessage(chatMessage);
			let isContinuation = false;
			if (previousMessage) {
				isContinuation = this.isContinuationFromPreviousMessage(previousMessage.data, chatMessage.data);
				if (isContinuation) {
					this._addClass(html, this.CLASS_NAMES.CONTINUED);
				} else {
					this._addClass(html, this.CLASS_NAMES.LEADING);
				}
			}

			const actor = this.loadActorForChatMessage(messageData);
			const isWhisper = chatMessage.data.type === CHAT_MESSAGE_TYPES.WHISPER;

			const renderData = {
				avatar: this.getChatTokenImage(actor),
				timestamp: messageData.message.timestamp,
				speaker: messageData.alias,
				content: messageData.message.content,
				whisperTo: messageData.whisperTo,
				isWhisper,
				isContinuation,
			};
			renderTemplate(this.TEMPLATES.CHAT_MESSAGE, renderData).then((renderedHTML) => {
				$(html).html(renderedHTML);
			});
		}
	}

	/**
	 * Returns a message is a valid groupable type
	 * @param {*} chatMessage
	 */
	static isValidGroupableType(chatMessage) {
		const groupableMessageTypes = [CHAT_MESSAGE_TYPES.OOC, CHAT_MESSAGE_TYPES.IC, CHAT_MESSAGE_TYPES.WHISPER];
		return groupableMessageTypes.includes(chatMessage.data.type);
	}

	/**
	 * Returns whether the next message is the continuation of the previous message
	 * i.e. the two messages are both from the same actor, are both the same type of groupable messges, have the same recipients
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static isContinuationFromPreviousMessage(prevMessage, nextMessage) {
		const isFromTheSameActor = prevMessage.speaker.token === nextMessage.speaker.token;
		const sameWhisperRecipients = this.sameWhisperRecipients(prevMessage, nextMessage);
		const isTheSameGroupableType = prevMessage.type === nextMessage.type; // nextMessage.type is already confirmed to be groupable
		return isFromTheSameActor && sameWhisperRecipients && isTheSameGroupableType;
	}

	/**
	 * Returns whether two messages have the same whisper recipients
	 * Note: Two public messages will return true (both have no whisper recipients)
	 * @param {*} prevMessage
	 * @param {*} nextMessage
	 */
	static sameWhisperRecipients(prevMessage, nextMessage) {
		if (!prevMessage.whisper || !nextMessage.whisper) {
			this._warn("WHISPER PROPERTY OF CHAT MESSAGE NOT FOUND");
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
		const index = game.messages.entries.indexOf(chatMessage);
		if (index > 0) {
			return game.messages.entries[index - 1];
		}
	}

	/**
	 * Load the appropriate actor for a given message, leveraging token or actor or actor search.
	 * @param {*} speaker
	 */
	static loadActorForChatMessage(messageData) {
		const speaker = messageData.message.speaker;
		let actor;
		if (speaker.token) {
			actor = game.actors.tokens[speaker.token];
		}
		if (!actor) {
			actor = game.actors.get(speaker.actor);
		}
		if (!actor) {
			game.actors.forEach((value) => {
				if (value.name === speaker.alias) {
					actor = value;
				}
			});
		}
		return actor;
	}

	/**
	 * @param {*} actor
	 */
	static getChatTokenImage(actor) {
		if (actor) return actor.token ? actor.token.data.img : actor.data.token.img;
		return "";
	}

	static getWhisperTargets(names, speaker) {
		if (typeof names === "string" && names.localeCompare(speaker) !== 0) {
			return ` (To ${names})`;
		}
		if (names && names.join) {
			const namesString = names.filter((name) => name.localeCompare(speaker) === 0).join();
			return ` (To ${namesString})`;
		}
		return "";
	}

	static _addClass = (html, className) => {
		html.addClass(className);
	};

	static _warn = (content) => {
		console.warn(`MESSAGE GROUPING | ${content}`);
	};
}
