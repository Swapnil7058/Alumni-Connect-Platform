import { apiRequest } from "./api";

export function getForumPosts() {
  return apiRequest("/forum/posts");
}

export function createForumPost(text) {
  return apiRequest("/forum/posts", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
