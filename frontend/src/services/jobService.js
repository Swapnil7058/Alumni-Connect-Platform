import { API_BASE_URL, apiRequest } from "./api";

export function getJobs() {
  return apiRequest("/jobs/");
}

export function getLinkedInJobs() {
  return apiRequest("/jobs/linkedin?channel=linkedin");
}

export function createJob(job) {
  return apiRequest("/jobs/", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

export function deleteJob(jobId) {
  return apiRequest(`/jobs/${jobId}`, {
    method: "DELETE",
  });
}

export function applyToJob(jobId) {
  return apiRequest(`/jobs/${jobId}/apply`, {
    method: "POST",
  });
}

export function getLinkedInPublishingStatus() {
  return apiRequest("/linkedin/status");
}

export function connectOrganizationLinkedIn() {
  window.location.href = `${API_BASE_URL}/linkedin/connect`;
}

export function publishJobToLinkedIn(jobId) {
  return apiRequest(`/linkedin/publish-job/${jobId}`, {
    method: "POST",
  });
}
