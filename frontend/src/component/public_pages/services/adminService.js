import { apiRequest } from "../../../services/api";

export const getAllStudents = async () => {
  return apiRequest("/admin/students");
};

export const getVerifiedAlumni = async () => {
  return apiRequest("/admin/alumni");
};

export const getPendingAlumni = async () => {
  return apiRequest("/admin/pending-alumni");
};

export const verifyAlumni = async (userId) => {
  return apiRequest(`/admin/verify-alumni/${userId}`, {
    method: "PUT",
  });
};

export const getAdminOverview = async () => {
  return apiRequest("/admin/overview");
};

export const getConversationModerationQueue = async () => {
  return apiRequest("/admin/conversations");
};

export const updateConversationModeration = async (conversationId, moderation_status) => {
  return apiRequest(`/admin/conversations/${conversationId}/moderate`, {
    method: "PUT",
    body: JSON.stringify({ moderation_status }),
  });
};
