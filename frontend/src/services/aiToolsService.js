import { apiRequest } from "./api";

export function generateResume(payload) {
  return apiRequest("/ai/resume/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function improveResumeSection(payload) {
  return apiRequest("/ai/resume/improve-section", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function generateArticle(payload) {
  return apiRequest("/ai/articles/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function askAssistant(message) {
  return apiRequest("/ai/assistant/reply", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
