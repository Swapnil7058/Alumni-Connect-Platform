import { apiRequest } from "./api";

export function getConversations() {
  return apiRequest("/chat/conversations");
}

export function getConversationMessages(conversationId) {
  return apiRequest(`/chat/conversations/${conversationId}/messages`);
}

export function sendConversationMessage(conversationId, text) {
  return apiRequest(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
