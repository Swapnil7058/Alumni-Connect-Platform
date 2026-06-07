import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase,
  Building2,
  Check,
  ExternalLink,
  Globe2,
  Link2,
  PlusCircle,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserCheck,
} from "lucide-react";

import {
  applyToJob,
  connectOrganizationLinkedIn,
  createJob,
  deleteJob,
  getJobs,
  getLinkedInJobs,
  getLinkedInPublishingStatus,
  publishJobToLinkedIn,
} from "../../services/jobService";
import RoleSidebar from "../shared/RoleSidebar";
import { connectSocket } from "../../services/socket";

const emptyJob = {
  title: "",
  company: "",
  description: "",
  tags: "",
  link: "",
  location: "",
  source: "internal",
  published_to_linkedin: false,
  linkedin_post_url: "",
  linkedin_caption: "",
  publisher_name: "",
  visibility: "public",
};

const boardTabs = [
  { id: "all", label: "All Jobs" },
  { id: "linkedin", label: "LinkedIn Jobs" },
];

const JobPortalPage = ({ userRole = "alumni", initialBoard = "all" }) => {
  const [searchParams] = useSearchParams();
  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [linkedInJobs, setLinkedInJobs] = useState([]);
  const [activeBoard, setActiveBoard] = useState(initialBoard);
  const [form, setForm] = useState(emptyJob);
  const [pendingApplicationJob, setPendingApplicationJob] = useState(null);
  const [confirmApplicationJobId, setConfirmApplicationJobId] = useState("");
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [publishingLinkedInJobId, setPublishingLinkedInJobId] = useState("");
  const [deletingJobId, setDeletingJobId] = useState("");
  const [linkedinStatus, setLinkedinStatus] = useState({
    connected: false,
    can_manage: false,
    organization_urn: "",
    connected_by: "",
    config_error: "",
  });

  const canPost = ["alumni", "admin", "college"].includes(userRole);
  const canManageLinkedIn = userRole === "admin";
  const linkedinQueryStatus = searchParams.get("linkedin");
  const linkedinQueryMessage = searchParams.get("message");

  const loadJobs = useCallback(async () => {
    const [jobsResponse, linkedInResponse] = await Promise.all([getJobs(), getLinkedInJobs()]);
    setJobs(jobsResponse.jobs || []);
    setLinkedInJobs(linkedInResponse.jobs || []);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const loadLinkedInStatus = useCallback(async () => {
    try {
      const response = await getLinkedInPublishingStatus();
      setLinkedinStatus(response);
    } catch (error) {
      console.error("LinkedIn status error:", error);
    }
  }, []);

  useEffect(() => {
    if (canPost) {
      loadLinkedInStatus();
    }
  }, [canPost, loadLinkedInStatus]);

  useEffect(() => {
    const socket = connectSocket();
    const refreshJobs = () => {
      loadJobs();
    };
    const refreshLinkedInJobs = () => {
      loadJobs();
      loadLinkedInStatus();
    };

    socket.on("jobs:created", refreshJobs);
    socket.on("jobs:deleted", refreshJobs);
    socket.on("jobs:application-updated", refreshJobs);
    socket.on("jobs:linkedin-updated", refreshLinkedInJobs);

    return () => {
      socket.off("jobs:created", refreshJobs);
      socket.off("jobs:deleted", refreshJobs);
      socket.off("jobs:application-updated", refreshJobs);
      socket.off("jobs:linkedin-updated", refreshLinkedInJobs);
    };
  }, [loadJobs, loadLinkedInStatus]);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingApplicationJob) {
        setConfirmApplicationJobId(pendingApplicationJob._id);
        setPendingApplicationJob(null);
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [pendingApplicationJob]);

  const visibleJobs = activeBoard === "linkedin" ? linkedInJobs : jobs;

  const filteredJobs = useMemo(() => {
    return visibleJobs.filter((job) =>
      `${job.title} ${job.company} ${job.description} ${(job.tags || []).join(" ")}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, visibleJobs]);

  const handleCreate = async () => {
    await createJob({
      ...form,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    });
    setForm(emptyJob);
    setIsPosting(false);
    setActiveBoard(form.published_to_linkedin || form.source === "linkedin" ? "linkedin" : "all");
    loadJobs();
  };

  const handleLinkedInPost = async (job) => {
    if (linkedinStatus.config_error) {
      alert(`LinkedIn configuration issue: ${linkedinStatus.config_error}`);
      return;
    }

    if (!linkedinStatus.connected) {
      if (canManageLinkedIn) {
        const shouldConnect = window.confirm(
          "The organization LinkedIn account is not connected yet. Do you want to connect it now?"
        );
        if (shouldConnect) {
          connectOrganizationLinkedIn();
        }
      } else {
        alert("The organization LinkedIn account is not connected yet. Please ask an admin to connect it first.");
      }
      return;
    }

    try {
      setPublishingLinkedInJobId(job._id);
      await publishJobToLinkedIn(job._id);
      await loadJobs();
      await loadLinkedInStatus();
    } catch (error) {
      alert(error.message || "Unable to publish this job to LinkedIn.");
    } finally {
      setPublishingLinkedInJobId("");
    }
  };

  const handleDeleteJob = async (job) => {
    const shouldDelete = window.confirm(
      `Delete "${job.title}" at ${job.company}? This will also remove its saved applications.`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingJobId(job._id);
      await deleteJob(job._id);
      await loadJobs();
    } catch (error) {
      alert(error.message || "Unable to delete this job.");
    } finally {
      setDeletingJobId("");
    }
  };

  const handleApply = (job) => {
    const applicationUrl = job.link || job.linkedin_post_url;

    if (!applicationUrl) {
      alert("This job does not have an application link yet.");
      return;
    }

    const applicationWindow = window.open(applicationUrl, "_blank", "noopener,noreferrer");

    if (!applicationWindow) {
      alert("Popup blocked. Please allow popups and try again.");
      return;
    }

    setPendingApplicationJob(job);
  };

  const handleApplicationConfirmation = async (didApply) => {
    const confirmApplicationJob = jobs
      .concat(linkedInJobs)
      .find((job) => job._id === confirmApplicationJobId);

    if (!confirmApplicationJob) {
      return;
    }

    if (!didApply) {
      setConfirmApplicationJobId("");
      return;
    }

    try {
      setIsSubmittingApplication(true);
      await applyToJob(confirmApplicationJob._id);
      await loadJobs();
      setConfirmApplicationJobId("");
    } catch (error) {
      alert(error.message || "Unable to save the application status.");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <RoleSidebar role={userRole} />
      <div className="ml-64 pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        {linkedinQueryStatus ? (
          <div
            className={`mb-6 rounded-2xl border px-5 py-4 text-sm ${
              linkedinQueryStatus === "connected"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {linkedinQueryStatus === "connected"
              ? "Organization LinkedIn account connected successfully."
              : linkedinQueryMessage || "LinkedIn action did not complete successfully."}
          </div>
        ) : null}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Job Portal</h1>
            <p className="text-slate-500 mt-2">
              Manage internal jobs and LinkedIn-linked job announcements from alumni, admins, and partner institutions.
            </p>
          </div>

          {canPost ? (
            <div className="flex flex-wrap items-center gap-3">
              {linkedinStatus.connected ? (
                <div className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200">
                  Organization LinkedIn connected
                  {linkedinStatus.connected_by ? ` by ${linkedinStatus.connected_by}` : ""}
                </div>
              ) : canManageLinkedIn ? (
                <button
                  onClick={connectOrganizationLinkedIn}
                  className="bg-[#0a66c2] hover:bg-[#004182] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md"
                >
                  <Link2 size={18} /> Connect Organization LinkedIn
                </button>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">
                  Ask an admin to connect the organization LinkedIn account
                </div>
              )}

              <button
                onClick={() => setIsPosting(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-md"
              >
                <PlusCircle size={18} /> Post Job
              </button>
            </div>
          ) : null}
        </div>

        <div className="grid lg:grid-cols-[1fr,320px] gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex flex-wrap gap-3">
              {boardTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveBoard(tab.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    activeBoard === tab.id
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative max-w-xl mt-5">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search jobs, companies, or tags..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
              LinkedIn Strategy
            </p>
            <div className="space-y-3 text-sm text-slate-600">
              <p>- Create the job in your platform first so students always see it here.</p>
              <p>- Jobs can be published to the organization LinkedIn account from this portal once admin connects it.</p>
              <p>- Dedicated LinkedIn view helps students focus on externally promoted opportunities.</p>
              {linkedinStatus.config_error ? (
                <p className="text-red-600 font-semibold">Config issue: {linkedinStatus.config_error}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition relative"
              >
                {(() => {
                  const isApiPublished = job.linkedin_status === "published" && job.linkedin_post_urn;
                  const isLinkedOnly = !!job.linkedin_post_url && !isApiPublished;
                  const isQueuedForPublish = job.linkedin_status === "queued" && !isApiPublished;

                  return (
                    <>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {canPost ? (
                    <button
                      type="button"
                      onClick={() => handleDeleteJob(job)}
                      disabled={deletingJobId === job._id}
                      title="Delete job"
                      className="w-8 h-8 rounded-full bg-white border border-red-100 text-red-600 shadow-sm flex items-center justify-center hover:bg-red-600 hover:text-white disabled:bg-slate-100 disabled:text-slate-400 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                  <div className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles size={14} />
                    {job.score}% Match
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 pr-40">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.company}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {isApiPublished ? (
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-blue-50 text-blue-700 inline-flex items-center gap-1">
                      <Globe2 size={12} /> Published on LinkedIn
                    </span>
                  ) : null}
                  {isLinkedOnly ? (
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-sky-50 text-sky-700 inline-flex items-center gap-1">
                      <Link2 size={12} /> LinkedIn Link Added
                    </span>
                  ) : null}
                  {isQueuedForPublish ? (
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                      <Globe2 size={12} /> Ready to Publish
                    </span>
                  ) : null}
                  <span className="text-xs px-2 py-1 rounded-lg font-semibold bg-slate-100 text-slate-600 inline-flex items-center gap-1">
                    <Building2 size={12} /> {job.publisher_name || job.posted_by}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 italic">"{job.description}"</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {(job.tags || []).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-lg font-semibold bg-gray-100 text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-xs text-slate-500 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <UserCheck size={14} /> Posted by {job.posted_by}
                  </div>
                  {job.location ? (
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} /> {job.location}
                    </div>
                  ) : null}
                  {job.linkedin_post_url ? (
                    <a
                      href={job.linkedin_post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 font-semibold"
                    >
                      <Link2 size={14} /> Open LinkedIn Post
                    </a>
                  ) : null}
                  {job.link ? (
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-red-600 font-semibold"
                    >
                      <ExternalLink size={14} /> Apply Link
                    </a>
                  ) : null}
                </div>

                {userRole === "student" && confirmApplicationJobId === job._id && !job.applied ? (
                  <div className="mt-4 rounded-2xl bg-[#d9e9fb] px-5 py-4">
                    <h4 className="text-[1.1rem] font-semibold text-slate-900">Did you apply?</h4>
                    <p className="mt-1 text-sm text-slate-700">
                      Let us know, and we&apos;ll help you track your application.
                    </p>
                    <div className="mt-4 flex items-center gap-8 text-[1.05rem] font-semibold text-slate-900">
                      <button
                        onClick={() => handleApplicationConfirmation(true)}
                        disabled={isSubmittingApplication}
                        className="hover:text-red-600 disabled:text-slate-400 transition"
                      >
                        {isSubmittingApplication ? "Saving..." : "Yes"}
                      </button>
                      <button
                        onClick={() => handleApplicationConfirmation(false)}
                        disabled={isSubmittingApplication}
                        className="hover:text-red-600 disabled:text-slate-400 transition"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex justify-between items-center pt-5 gap-3">
                  {userRole === "student" ? (
                    <button
                      onClick={() => handleApply(job)}
                      disabled={job.applied}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white disabled:bg-slate-200 disabled:text-slate-500 transition"
                    >
                      {job.applied ? "Applied" : "Open Application"} <Send size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full gap-3">
                      <div className="text-xs font-bold text-slate-500">{job.application_count} applications</div>
                      {canPost ? (
                        <button
                          onClick={() => handleLinkedInPost(job)}
                          disabled={publishingLinkedInJobId === job._id || isApiPublished}
                          className="flex items-center gap-2 px-4 py-2 bg-[#0a66c2] text-white rounded-lg text-sm font-semibold hover:bg-[#004182] disabled:bg-slate-300 disabled:text-slate-600 transition"
                        >
                          <Check size={14} />
                          {isApiPublished
                            ? "Published on LinkedIn"
                            : publishingLinkedInJobId === job._id
                            ? "Publishing..."
                            : "Publish to LinkedIn"}
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
                    </>
                  );
                })()}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      </div>

      {isPosting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold mb-6">Post New Opportunity</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                ["title", "Job Title"],
                ["company", "Company Name"],
                ["location", "Location"],
                ["publisher_name", "Publisher / Organization Name"],
                ["link", "Application Link"],
                ["linkedin_post_url", "LinkedIn Post URL"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={form[key]}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                  placeholder={label}
                  className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none"
                />
              ))}
            </div>

            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Description"
              className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none mt-4 min-h-[120px]"
            />

            <input
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Skills / Tags (comma separated)"
              className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none mt-4"
            />

            <textarea
              value={form.linkedin_caption}
              onChange={(event) => setForm((current) => ({ ...current, linkedin_caption: event.target.value }))}
              placeholder="Optional LinkedIn announcement caption"
              className="w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none mt-4 min-h-[96px]"
            />

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <label className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">Publish / Mirror on LinkedIn</p>
                  <p className="text-sm text-slate-500">Use when the job is also announced on LinkedIn.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.published_to_linkedin}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      published_to_linkedin: event.target.checked,
                    }))
                  }
                />
              </label>

              <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-800 mb-2">Job Source</p>
                <select
                  value={form.source}
                  onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                  className="w-full p-3 bg-white rounded-xl border focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="internal">Internal Platform Job</option>
                  <option value="linkedin">LinkedIn-originated Announcement</option>
                </select>
              </label>
            </div>

            {canPost ? (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-900">
                After creating the job, use the <span className="font-bold">Publish to LinkedIn</span> button on the
                job card. The backend will publish it through the organization LinkedIn account, not the browser&apos;s
                currently logged-in personal account.
              </div>
            ) : null}

            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsPosting(false)} className="px-5 py-2 text-gray-500 font-semibold">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
              >
                Submit Job
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default JobPortalPage;
