import { apiRequest } from "./api";

export function getMentorRecommendations(areaOfInterest = "") {
  const query = areaOfInterest ? `?area_of_interest=${encodeURIComponent(areaOfInterest)}` : "";
  return apiRequest(`/mentorship/recommendations${query}`);
}

export function requestMentor(mentorId) {
  return apiRequest(`/mentorship/request/${mentorId}`, {
    method: "POST",
  });
}
