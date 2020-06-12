"use strict";

import InCharacterMessage from "./scripts/ic.js";
import MarkdownMessage from "./scripts/markdown.js";

/**
 * Valid Foundry.js chat message type
 *
 * const CHAT_MESSAGE_TYPES = {
 *  OTHER: 0,
 *  OOC: 1,
 *  IC: 2,
 *  EMOTE: 3,
 *  WHISPER: 4,
 *  ROLL: 5
 *};
 */

/**
 * Main class wrapper for all of our features.
 */
class MessageGrouping {
	static onRenderChatMessage(chatMessage, html, messageData) {
		MarkdownMessage.process(chatMessage, html, messageData);
		InCharacterMessage.process(chatMessage, html, messageData);
	}
}

/**
 * These hooks register the following settings in the module settings.
 */
Hooks.once("init", () => {
	console.log("Hello initiating Message Grouping");
	InCharacterMessage.init();
});

/**
 * This line connects our method above with the chat rendering.
 * Note that this happens after the core code has already generated HTML.
 */
Hooks.on("renderChatMessage", MessageGrouping.onRenderChatMessage.bind(MessageGrouping));

class ChatMessageContextMenu {
	static onGetEntryContext(html, entryOptions) {
		console.log(entryOptions);
	}
}

Hooks.on("getChatLogEntryContext", ChatMessageContextMenu.onGetEntryContext.bind(ChatMessageContextMenu));