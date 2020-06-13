import * as markdownIt from "../libs/markdown-it.js";
const md = window.MarkdownIt({
	html: true
});

export default class MarkdownMessage {
	static process(chatMessage, html, messageData) {
		if (this.isMarkdownkable(chatMessage)) {
			const markdown = md.renderInline(chatMessage.data.content);
			messageData.message.content = markdown;
			chatMessage.data.content = markdown;
		}
	}

	/**
	 * Returns a message is a valid markdownable type
	 * @param {*} chatMessage
	 */
	static isMarkdownkable(chatMessage) {
		const groupableMessageTypes = [CHAT_MESSAGE_TYPES.OOC, CHAT_MESSAGE_TYPES.IC, CHAT_MESSAGE_TYPES.WHISPER];
		return groupableMessageTypes.includes(chatMessage.data.type);
	}
}
