import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Sparkles } from "lucide-react";

import { generateResume, improveResumeSection } from "../../../services/aiToolsService";
import {
  previewTemplates,
  ResumeTemplateShowcase,
} from "./ResumePreviewTemplates";

const initialForm = {
  template: "classic",
  targetRole: "",
  personalDetails: {
    name: "",
    email: "",
    github: "",
    linkedin: "",
    location: "",
  },
  professionalSummary: "",
  education: [
    {
      degree: "",
      institution: "",
      year: "",
      score: "",
      highlights: "",
    },
  ],
  technicalSkills: {
    core: "",
    frameworks: "",
    databases: "",
    tools: "",
  },
  experiences: [
    {
      title: "",
      organization: "",
      duration: "",
      details: "",
    },
  ],
  certifications: "",
  projects: [
    {
      name: "",
      techStack: "",
      features: "",
      effort: "",
    },
  ],
  softSkills: "",
  languages: "",
  hobbies: "",
};

const steps = [
  "Personal Details",
  "Professional Summary",
  "Education & Technical Skills",
  "Experience, Certifications & Projects",
  "Final Details",
];

const fieldClass =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500";

function updateArrayItem(setter, key, index, field, value) {
  setter((current) => ({
    ...current,
    [key]: current[key].map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ),
  }));
}

export default function ResumeBuilder() {
  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [improvingSection, setImprovingSection] = useState("");
  const [sectionAttempts, setSectionAttempts] = useState({});
  const [sectionStatus, setSectionStatus] = useState({});
  const previewRef = useRef(null);

  const progress = useMemo(() => `${step + 1}/${steps.length}`, [step]);
  const previewData = useMemo(() => buildPreviewData(form, result), [form, result]);

  const selectTemplate = (templateId) => {
    setForm((current) => ({ ...current, template: templateId }));
    setResult((current) => (current ? { ...current, template: templateId } : current));
  };

  const handleExportPdf = async () => {
    if (!result) {
      return;
    }

    try {
      setExportingPdf(true);

      const { jsPDF } = await import("jspdf");
      const safeName = (form.personalDetails.name || "student-resume")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const pdf = new jsPDF("p", "mm", "a4");
      exportStructuredPdf(pdf, previewData, form.template);
      const fileName = `${safeName || "student-resume"}-${form.template || "template"}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF export failed", error);
      window.alert("PDF export failed. Please try again.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleImproveSection = async (section) => {
    const attempt = (sectionAttempts[section] || 0) + 1;

    try {
      setImprovingSection(section);
      const response = await improveResumeSection({
        section,
        formData: form,
        attempt,
      });

      setSectionAttempts((current) => ({ ...current, [section]: attempt }));
      setSectionStatus((current) => ({
        ...current,
        [section]: `${response.aiProvider === "gemini" ? "Gemini" : "AI"} improved this section. Current version: ${response.attempt}. ${response.notes || ""}`.trim(),
      }));

      setForm((current) => {
        if (section === "professionalSummary") {
          return { ...current, professionalSummary: response.content || "" };
        }

        if (section === "technicalSkills") {
          return {
            ...current,
            technicalSkills: { ...current.technicalSkills, ...(response.content || {}) },
          };
        }

        if (section === "education") {
          return {
            ...current,
            education: Array.isArray(response.content) ? response.content : current.education,
          };
        }

        if (section === "experiences") {
          return {
            ...current,
            experiences: Array.isArray(response.content) ? response.content : current.experiences,
          };
        }

        if (section === "certifications") {
          return {
            ...current,
            certifications:
              typeof response.content === "string" ? response.content : current.certifications,
          };
        }

        if (section === "projects") {
          return {
            ...current,
            projects: Array.isArray(response.content) ? response.content : current.projects,
          };
        }

        if (section === "finalDetails") {
          return {
            ...current,
            softSkills: response.content?.softSkills ?? current.softSkills,
            languages: response.content?.languages ?? current.languages,
            hobbies: response.content?.hobbies ?? current.hobbies,
          };
        }

        return current;
      });
    } catch (error) {
      setSectionStatus((current) => ({
        ...current,
        [section]: error.message || "Failed to improve this section.",
      }));
    } finally {
      setImprovingSection("");
    }
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await generateResume({
        ...form,
        technicalSkills: {
          core: form.technicalSkills.core
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          frameworks: form.technicalSkills.frameworks
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          databases: form.technicalSkills.databases
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          tools: form.technicalSkills.tools
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700">Resume Template</label>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              {previewTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectTemplate(template.id)}
                  className={`text-left rounded-2xl border p-4 transition-colors ${
                    form.template === template.id
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-slate-900">{template.name}</span>
                    {form.template === template.id ? (
                      <span className="text-xs font-bold text-red-600">Selected</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <Field label="Target Role">
            <input
              value={form.targetRole}
              onChange={(event) =>
                setForm((current) => ({ ...current, targetRole: event.target.value }))
              }
              className={fieldClass}
              placeholder="e.g. Full Stack Developer"
            />
          </Field>

          {[
            ["name", "Full Name"],
            ["email", "Email"],
            ["github", "GitHub"],
            ["linkedin", "LinkedIn"],
            ["location", "Location"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                value={form.personalDetails[key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    personalDetails: { ...current.personalDetails, [key]: event.target.value },
                  }))
                }
                className={fieldClass}
                placeholder={label}
              />
            </Field>
          ))}
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4">
          <SectionImproveBar
            title="Professional Summary"
            section="professionalSummary"
            improvingSection={improvingSection}
            sectionAttempts={sectionAttempts}
            sectionStatus={sectionStatus}
            onImprove={handleImproveSection}
          />

          <Field label="Raw Professional Summary">
            <textarea
              value={form.professionalSummary}
              onChange={(event) =>
                setForm((current) => ({ ...current, professionalSummary: event.target.value }))
              }
              className={`${fieldClass} min-h-[240px]`}
              placeholder="Write in plain text about yourself, your goals, strengths, interests, and what kind of role you want. AI will improve this into a professional summary."
            />
          </Field>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
              <h3 className="font-bold text-slate-900">Education</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      education: [
                        ...current.education,
                        {
                          degree: "",
                          institution: "",
                          year: "",
                          score: "",
                          highlights: "",
                        },
                      ],
                    }))
                  }
                  className="text-sm font-bold text-red-600"
                >
                  Add Education
                </button>
                <InlineImproveButton
                  section="education"
                  improvingSection={improvingSection}
                  sectionAttempts={sectionAttempts}
                  onImprove={handleImproveSection}
                />
              </div>
            </div>
            <SectionStatus section="education" sectionStatus={sectionStatus} />

            <div className="space-y-5 mt-4">
              {form.education.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-4 grid md:grid-cols-2 gap-4"
                >
                  {[
                    ["degree", "Degree / Course"],
                    ["institution", "Institution"],
                    ["year", "Passing Year"],
                    ["score", "CGPA / Percentage"],
                    ["highlights", "Subjects / Highlights"],
                  ].map(([field, label]) => (
                    <input
                      key={field}
                      value={item[field]}
                      onChange={(event) =>
                        updateArrayItem(setForm, "education", index, field, event.target.value)
                      }
                      className={fieldClass}
                      placeholder={label}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <SectionImproveBar
                title="Technical Skills"
                section="technicalSkills"
                improvingSection={improvingSection}
                sectionAttempts={sectionAttempts}
                sectionStatus={sectionStatus}
                onImprove={handleImproveSection}
              />
            </div>

            <Field label="Core Technical Skills">
              <input
                value={form.technicalSkills.core}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    technicalSkills: { ...current.technicalSkills, core: event.target.value },
                  }))
                }
                className={fieldClass}
                placeholder="python, java, javascript"
              />
            </Field>
            <Field label="Frameworks / Libraries">
              <input
                value={form.technicalSkills.frameworks}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    technicalSkills: {
                      ...current.technicalSkills,
                      frameworks: event.target.value,
                    },
                  }))
                }
                className={fieldClass}
                placeholder="react, flask, django"
              />
            </Field>
            <Field label="Databases">
              <input
                value={form.technicalSkills.databases}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    technicalSkills: {
                      ...current.technicalSkills,
                      databases: event.target.value,
                    },
                  }))
                }
                className={fieldClass}
                placeholder="mysql, mongodb, postgres"
              />
            </Field>
            <Field label="Tools / Platforms">
              <input
                value={form.technicalSkills.tools}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    technicalSkills: { ...current.technicalSkills, tools: event.target.value },
                  }))
                }
                className={fieldClass}
                placeholder="git, github, vscode, postman"
              />
            </Field>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
              <h3 className="font-bold text-slate-900">Experiences / Trainings</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      experiences: [
                        ...current.experiences,
                        { title: "", organization: "", duration: "", details: "" },
                      ],
                    }))
                  }
                  className="text-sm font-bold text-red-600"
                >
                  Add Experience
                </button>
                <InlineImproveButton
                  section="experiences"
                  improvingSection={improvingSection}
                  sectionAttempts={sectionAttempts}
                  onImprove={handleImproveSection}
                />
              </div>
            </div>
            <SectionStatus section="experiences" sectionStatus={sectionStatus} />

            <div className="space-y-5 mt-4">
              {form.experiences.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      value={item.title}
                      onChange={(event) =>
                        updateArrayItem(setForm, "experiences", index, "title", event.target.value)
                      }
                      className={fieldClass}
                      placeholder="Role / Training Title"
                    />
                    <input
                      value={item.organization}
                      onChange={(event) =>
                        updateArrayItem(
                          setForm,
                          "experiences",
                          index,
                          "organization",
                          event.target.value
                        )
                      }
                      className={fieldClass}
                      placeholder="Organization"
                    />
                    <input
                      value={item.duration}
                      onChange={(event) =>
                        updateArrayItem(
                          setForm,
                          "experiences",
                          index,
                          "duration",
                          event.target.value
                        )
                      }
                      className={fieldClass}
                      placeholder="Duration"
                    />
                  </div>
                  <textarea
                    value={item.details}
                    onChange={(event) =>
                      updateArrayItem(setForm, "experiences", index, "details", event.target.value)
                    }
                    className={`${fieldClass} min-h-[120px]`}
                    placeholder="Write raw points about what you did. AI will improve the headline and turn this into professional contribution text."
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionImproveBar
              title="Certifications / Trainings"
              section="certifications"
              improvingSection={improvingSection}
              sectionAttempts={sectionAttempts}
              sectionStatus={sectionStatus}
              onImprove={handleImproveSection}
            />
            <Field label="Certifications / Trainings">
              <textarea
                value={form.certifications}
                onChange={(event) =>
                  setForm((current) => ({ ...current, certifications: event.target.value }))
                }
                className={`${fieldClass} min-h-[110px]`}
                placeholder="One certification or training per line"
              />
            </Field>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
              <h3 className="font-bold text-slate-900">Projects</h3>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      projects: [
                        ...current.projects,
                        { name: "", techStack: "", features: "", effort: "" },
                      ],
                    }))
                  }
                  className="text-sm font-bold text-red-600"
                >
                  Add Project
                </button>
                <InlineImproveButton
                  section="projects"
                  improvingSection={improvingSection}
                  sectionAttempts={sectionAttempts}
                  onImprove={handleImproveSection}
                />
              </div>
            </div>
            <SectionStatus section="projects" sectionStatus={sectionStatus} />

            <div className="space-y-5 mt-4">
              {form.projects.map((item, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 p-4 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateArrayItem(setForm, "projects", index, "name", event.target.value)
                      }
                      className={fieldClass}
                      placeholder="Project Name"
                    />
                    <input
                      value={item.techStack}
                      onChange={(event) =>
                        updateArrayItem(
                          setForm,
                          "projects",
                          index,
                          "techStack",
                          event.target.value
                        )
                      }
                      className={fieldClass}
                      placeholder="Tech Stack"
                    />
                  </div>
                  <textarea
                    value={item.features}
                    onChange={(event) =>
                      updateArrayItem(setForm, "projects", index, "features", event.target.value)
                    }
                    className={`${fieldClass} min-h-[120px]`}
                    placeholder="Write features or modules, one per line. AI will expand them into a clearer professional project description."
                  />
                  <textarea
                    value={item.effort}
                    onChange={(event) =>
                      updateArrayItem(setForm, "projects", index, "effort", event.target.value)
                    }
                    className={`${fieldClass} min-h-[90px]`}
                    placeholder="Mention your contribution, challenges solved, teamwork, research, implementation effort, etc."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <SectionImproveBar
          title="Soft Skills, Languages & Hobbies"
          section="finalDetails"
          improvingSection={improvingSection}
          sectionAttempts={sectionAttempts}
          sectionStatus={sectionStatus}
          onImprove={handleImproveSection}
        />
        <Field label="Soft Skills">
          <input
            value={form.softSkills}
            onChange={(event) => setForm((current) => ({ ...current, softSkills: event.target.value }))}
            className={fieldClass}
            placeholder="communication, teamwork, leadership"
          />
        </Field>
        <Field label="Languages">
          <input
            value={form.languages}
            onChange={(event) => setForm((current) => ({ ...current, languages: event.target.value }))}
            className={fieldClass}
            placeholder="English, Hindi, Marathi"
          />
        </Field>
        <Field label="Hobbies">
          <input
            value={form.hobbies}
            onChange={(event) => setForm((current) => ({ ...current, hobbies: event.target.value }))}
            className={fieldClass}
            placeholder="reading, cricket, sketching"
          />
        </Field>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[520px,1fr] gap-8">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">AI Resume Builder</h1>
              <p className="text-slate-500 mt-2">
                Fill the resume step by step. AI can improve each section live, and you can regenerate any section until you like the wording.
              </p>
            </div>
            <div className="text-sm font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {progress}
            </div>
          </div>

          <div className="flex gap-2 mt-6 mb-8 flex-wrap">
            {steps.map((label, index) => (
              <button
                key={label}
                onClick={() => setStep(index)}
                className={`px-3 py-2 rounded-full text-xs font-bold transition-colors ${
                  index === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {renderStep()}

          <div className="flex items-center justify-between gap-4 mt-8">
            <button
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
              className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-bold disabled:opacity-40 flex items-center gap-2"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                className="px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:bg-red-600"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-5 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:bg-slate-300"
              >
                {loading ? "Generating..." : "Generate Resume Draft"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          {result ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Live Resume Preview</h2>
                  <p className="text-slate-500">
                    Score: {result.score}/100 | Template: {result.template}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="px-4 py-2 rounded-full bg-red-50 text-red-700 text-sm font-bold flex items-center gap-2">
                    <Sparkles size={16} /> AI-assisted draft ({result.aiProvider})
                  </div>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="px-4 py-2 rounded-full bg-slate-100 text-slate-600 text-sm font-bold flex items-center gap-2"
                    title="Download the current preview as a PDF file."
                  >
                    <Download size={15} /> {exportingPdf ? "Exporting PDF..." : "Download PDF"}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold text-slate-700">Template Switcher</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {previewTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => selectTemplate(template.id)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        form.template === template.id
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`h-3 w-3 rounded-full ${template.accent}`} />
                        <span className="font-bold">{template.name}</span>
                      </div>
                      <p
                        className={`mt-2 max-w-xs text-sm ${
                          form.template === template.id ? "text-slate-200" : "text-slate-500"
                        }`}
                      >
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div
                ref={previewRef}
                id="resume-preview-export"
                className="rounded-[2rem] bg-slate-100 p-4 md:p-6"
              >
                <ResumeTemplateShowcase templateId={form.template} data={previewData} />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">AI Improvements</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>- Professional summary generated or improved from raw input.</li>
                    <li>- Technical skills cleaned and grouped into clearer categories.</li>
                    <li>- Education rewritten with academic excellence framing.</li>
                    <li>- Experience, certifications, and projects polished into resume language.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Improvement Suggestions</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {result.suggestions.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-bold text-slate-900 mb-3">Generated Text Draft</h3>
                <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {result.resumeText}
                </pre>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[700px] flex items-center justify-center text-slate-400">
              Your generated multi-section resume will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-700">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SectionImproveBar({
  title,
  section,
  improvingSection,
  sectionAttempts,
  sectionStatus,
  onImprove,
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 mt-1">
            Click improve to rewrite this section with stronger wording. If you do not like it, click again for a new version.
          </p>
        </div>
        <InlineImproveButton
          section={section}
          improvingSection={improvingSection}
          sectionAttempts={sectionAttempts}
          onImprove={onImprove}
        />
      </div>
      <SectionStatus section={section} sectionStatus={sectionStatus} />
    </div>
  );
}

function InlineImproveButton({ section, improvingSection, sectionAttempts, onImprove }) {
  const isBusy = improvingSection === section;
  const version = sectionAttempts[section] || 0;

  return (
    <button
      type="button"
      onClick={() => onImprove(section)}
      disabled={Boolean(improvingSection)}
      className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-red-600 disabled:bg-slate-300 flex items-center gap-2"
    >
      <Sparkles size={15} />
      {isBusy ? "Improving..." : version > 0 ? `Try New Version (${version})` : "Improve By AI"}
    </button>
  );
}

function SectionStatus({ section, sectionStatus }) {
  if (!sectionStatus[section]) {
    return null;
  }

  return <p className="text-sm text-slate-600 mt-3">{sectionStatus[section]}</p>;
}

function buildPreviewData(form, result) {
  const generated = result?.generatedSections || {};

  return {
    name: form.personalDetails.name || "Student Name",
    email: form.personalDetails.email || "student@example.com",
    github: form.personalDetails.github || "",
    linkedin: form.personalDetails.linkedin || "",
    location: form.personalDetails.location || "",
    targetRole: form.targetRole || "Target Role",
    summary: normalizeLines(generated.professionalSummary || form.professionalSummary),
    education: normalizeLines(generated.education || form.education.map(formatEducationFallback)),
    skills: normalizeLines(
      generated.technicalSkills ||
        [
          form.technicalSkills.core && `Programming: ${form.technicalSkills.core}`,
          form.technicalSkills.frameworks && `Frameworks: ${form.technicalSkills.frameworks}`,
          form.technicalSkills.databases && `Databases: ${form.technicalSkills.databases}`,
          form.technicalSkills.tools && `Tools: ${form.technicalSkills.tools}`,
        ].filter(Boolean)
    ),
    experiences: normalizeLines(
      generated.experiences ||
        form.experiences.map((item) =>
          [item.title, item.organization, item.duration, item.details].filter(Boolean).join(" | ")
        )
    ),
    certifications: normalizeLines(generated.certifications || form.certifications),
    projects: normalizeLines(
      generated.projects ||
        form.projects.map((item) =>
          [item.name, item.techStack, item.features, item.effort].filter(Boolean).join(" | ")
        )
    ),
    softSkills: normalizeLines(form.softSkills.split(",").map((item) => item.trim()).filter(Boolean)),
    languages: normalizeLines(form.languages.split(",").map((item) => item.trim()).filter(Boolean)),
    hobbies: normalizeLines(form.hobbies.split(",").map((item) => item.trim()).filter(Boolean)),
  };
}

function normalizeLines(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").replace(/^-+\s*/, "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split("\n")
    .map((item) => item.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
}

function formatEducationFallback(item) {
  return [item.degree, item.institution, item.year, item.score].filter(Boolean).join(" | ");
}

function exportStructuredPdf(pdf, data, template) {
  const theme = PDF_THEMES[template] || PDF_THEMES.classic;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(...theme.pageBg);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  if (template === "modern") {
    renderModernPdf(pdf, data, theme);
    return;
  }

  if (template === "creative") {
    renderCreativePdf(pdf, data, theme);
    return;
  }

  renderClassicPdf(pdf, data, theme);
}

function renderContactRow(pdf, data, startX, startY, maxWidth, color) {
  const contactItems = [data.email, data.location, data.github, data.linkedin].filter(Boolean);
  pdf.setTextColor(...color);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);

  let x = startX;
  let y = startY;
  contactItems.forEach((item) => {
    const text = truncatePdfText(item, 36);
    const width = pdf.getTextWidth(text) + 10;
    if (x + width > startX + maxWidth) {
      x = startX;
      y += 5;
    }
    pdf.text(text, x, y);
    x += width;
  });
  return y;
}

function renderClassicPdf(pdf, data, theme) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const sidebarWidth = 58;
  const gap = 8;
  const mainX = margin + sidebarWidth + gap;
  const mainWidth = pageWidth - margin - mainX;

  pdf.setFillColor(...theme.sidebarBg);
  pdf.roundedRect(margin, margin, sidebarWidth, pageHeight - margin * 2, 6, 6, "F");

  pdf.setTextColor(...theme.headerText);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(data.name, margin + 6, 20, { maxWidth: sidebarWidth - 12 });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(data.targetRole, margin + 6, 30, { maxWidth: sidebarWidth - 12 });
  renderContactColumn(pdf, data, margin + 6, 40, sidebarWidth - 12, theme.headerText);

  let sidebarY = 78;
  sidebarY = renderSection(pdf, "Technical Skills", data.skills, sidebarY, sidebarWidth - 12, margin + 6, theme, "tags", true);
  sidebarY = renderSection(pdf, "Soft Skills", data.softSkills, sidebarY, sidebarWidth - 12, margin + 6, theme, "tags", true);
  sidebarY = renderSection(pdf, "Languages", data.languages, sidebarY, sidebarWidth - 12, margin + 6, theme, "bullets", true);
  renderSection(pdf, "Hobbies", data.hobbies, sidebarY, sidebarWidth - 12, margin + 6, theme, "bullets", true);

  let mainY = margin + 4;
  mainY = renderSection(pdf, "Professional Summary", data.summary, mainY, mainWidth, mainX, theme, "bullets");
  mainY = renderSection(pdf, "Projects", data.projects, mainY, mainWidth, mainX, theme, "bullets");
  mainY = renderSection(pdf, "Experience", data.experiences, mainY, mainWidth, mainX, theme, "bullets");
  mainY = renderSection(pdf, "Education", data.education, mainY, mainWidth, mainX, theme, "bullets");
  renderSection(pdf, "Certifications", data.certifications, mainY, mainWidth, mainX, theme, "bullets");
}

function renderModernPdf(pdf, data, theme) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  pdf.setFillColor(...theme.headerBg);
  pdf.roundedRect(margin, margin, contentWidth, 30, 6, 6, "F");
  pdf.setTextColor(...theme.headerText);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.text(data.name, margin + 8, 21);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(data.targetRole, margin + 8, 28);
  renderContactInlineCompact(pdf, data, margin + 90, 28, contentWidth - 98, theme.headerText);

  let y = 48;
  y = renderCardSection(pdf, "Professional Highlights", data.summary, margin, y, contentWidth, theme, "bullets");

  const columnGap = 6;
  const leftWidth = (contentWidth - columnGap) / 2;
  const rightX = margin + leftWidth + columnGap;
  let leftY = y;
  let rightY = y;

  leftY = renderCardSection(pdf, "Projects", data.projects, margin, leftY, leftWidth, theme, "bullets");
  leftY = renderCardSection(pdf, "Experience", data.experiences, margin, leftY, leftWidth, theme, "bullets");

  rightY = renderCardSection(pdf, "Tech Stack", data.skills, rightX, rightY, leftWidth, theme, "tags");
  rightY = renderCardSection(pdf, "Education", data.education, rightX, rightY, leftWidth, theme, "bullets");
  rightY = renderCardSection(pdf, "Certifications", data.certifications, rightX, rightY, leftWidth, theme, "bullets");

  const bottomY = Math.max(leftY, rightY) + 2;
  const halfWidth = (contentWidth - columnGap) / 2;
  renderCardSection(pdf, "Soft Skills", data.softSkills, margin, bottomY, halfWidth, theme, "tags");
  renderCardSection(pdf, "Languages & Hobbies", [...data.languages, ...data.hobbies], rightX, bottomY, halfWidth, theme, "bullets");
}

function renderCreativePdf(pdf, data, theme) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentWidth = pageWidth - margin * 2;

  pdf.setFillColor(...theme.headerBg);
  pdf.rect(0, 0, pageWidth, 56, "F");
  pdf.setFillColor(...theme.headerGlow);
  pdf.circle(pageWidth - 24, 16, 14, "F");
  pdf.setTextColor(...theme.headerText);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.text(data.name, margin + 6, 22);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.text(data.targetRole, margin + 6, 30);
  renderContactInlineCompact(pdf, data, margin + 6, 39, contentWidth - 12, theme.headerText);

  let y = 62;
  y = renderTintedBlock(pdf, "Career Snapshot", data.summary, margin, y, contentWidth * 0.62, theme, "bullets");
  renderTintedBlock(pdf, "Technical Identity", data.skills, margin + contentWidth * 0.64, y - 26, contentWidth * 0.36, theme, "tags", true);

  const columnGap = 6;
  const leftWidth = (contentWidth - columnGap) / 2;
  const rightX = margin + leftWidth + columnGap;
  let leftY = y + 6;
  let rightY = y + 6;

  leftY = renderTintedBlock(pdf, "Projects", data.projects, margin, leftY, leftWidth, theme, "bullets");
  leftY = renderTintedBlock(pdf, "Education", data.education, margin, leftY, leftWidth, theme, "bullets", true);

  rightY = renderTintedBlock(pdf, "Experience", data.experiences, rightX, rightY, leftWidth, theme, "bullets");
  rightY = renderTintedBlock(pdf, "Certifications", data.certifications, rightX, rightY, leftWidth, theme, "bullets", true);

  const footerY = Math.max(leftY, rightY) + 4;
  renderTintedBlock(pdf, "Soft Skills", data.softSkills, margin, footerY, leftWidth, theme, "tags", true);
  renderTintedBlock(pdf, "Languages & Hobbies", [...data.languages, ...data.hobbies], rightX, footerY, leftWidth, theme, "bullets", true);

  pdf.setDrawColor(...theme.frame);
  pdf.roundedRect(margin, 58, contentWidth, pageHeight - 66, 6, 6, "S");
}

function renderContactColumn(pdf, data, startX, startY, maxWidth, color) {
  const contactItems = [data.email, data.location, data.github, data.linkedin].filter(Boolean);
  pdf.setTextColor(...color);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.7);
  let y = startY;
  contactItems.forEach((item) => {
    const lines = pdf.splitTextToSize(truncatePdfText(item, 42), maxWidth);
    pdf.text(lines, startX, y);
    y += lines.length * 4.2;
  });
  return y;
}

function renderContactInlineCompact(pdf, data, startX, startY, maxWidth, color) {
  const contactItems = [data.email, data.location, data.github, data.linkedin].filter(Boolean);
  pdf.setTextColor(...color);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  let x = startX;
  let y = startY;
  contactItems.forEach((item) => {
    const text = truncatePdfText(item, 24);
    const width = pdf.getTextWidth(text) + 8;
    if (x + width > startX + maxWidth) {
      x = startX;
      y += 4.5;
    }
    pdf.text(text, x, y);
    x += width;
  });
  return y;
}

function renderCardSection(pdf, title, items, x, y, width, theme, mode) {
  const height = estimateSectionHeight(pdf, items, width, mode, 18);
  pdf.setFillColor(...theme.cardBg);
  pdf.roundedRect(x, y, width, height, 5, 5, "F");
  return renderSection(pdf, title, items, y + 8, width - 10, x + 5, theme, mode) + 6;
}

function renderTintedBlock(pdf, title, items, x, y, width, theme, mode, soft = false) {
  const height = estimateSectionHeight(pdf, items, width, mode, 18);
  pdf.setFillColor(...(soft ? theme.softBlockBg : theme.blockBg));
  pdf.roundedRect(x, y, width, height, 5, 5, "F");
  return renderSection(pdf, title, items, y + 8, width - 10, x + 5, theme, mode) + 6;
}

function estimateSectionHeight(pdf, items, width, mode, baseHeight = 16) {
  const normalizedItems = (items || []).filter(Boolean);
  if (!normalizedItems.length) {
    return baseHeight;
  }

  if (mode === "tags") {
    let x = 0;
    let rows = 1;
    normalizedItems.forEach((item) => {
      const text = cleanPdfLine(item).replace(/^[A-Za-z\s]+:\s*/, "");
      const chipWidth = pdf.getTextWidth(text) + 11;
      if (x + chipWidth > width - 8) {
        rows += 1;
        x = 0;
      }
      x += chipWidth + 3;
    });
    return Math.max(baseHeight, 16 + rows * 8);
  }

  let lines = 0;
  normalizedItems.forEach((item) => {
    lines += pdf.splitTextToSize(cleanPdfLine(item), width - 10).length;
  });
  return Math.max(baseHeight, 12 + lines * 4.8 + normalizedItems.length * 1.5);
}

function renderSection(pdf, title, items, cursorY, contentWidth, margin, theme, mode) {
  const normalizedItems = (items || []).filter(Boolean);
  if (!normalizedItems.length) {
    return cursorY;
  }

  const pageHeight = pdf.internal.pageSize.getHeight();
  if (cursorY > pageHeight - 40) {
    pdf.addPage();
    pdf.setFillColor(...theme.pageBg);
    pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pageHeight, "F");
    cursorY = 12;
  }

  pdf.setTextColor(...theme.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(title.toUpperCase(), margin, cursorY);
  cursorY += 6;

  if (mode === "tags") {
    return renderTagSection(pdf, normalizedItems, cursorY, contentWidth, margin, theme);
  }

  pdf.setTextColor(...theme.bodyText);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);

  normalizedItems.forEach((item) => {
    const lines = pdf.splitTextToSize(cleanPdfLine(item), contentWidth - 10);
    const requiredHeight = lines.length * 4.8 + 2;
    if (cursorY + requiredHeight > pageHeight - 12) {
      pdf.addPage();
      pdf.setFillColor(...theme.pageBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pageHeight, "F");
      cursorY = 12;
    }

    pdf.setFillColor(...theme.bullet);
    pdf.circle(margin + 1.5, cursorY + 1.6, 0.8, "F");
    pdf.text(lines, margin + 5, cursorY + 2);
    cursorY += requiredHeight;
  });

  return cursorY + 3;
}

function renderTagSection(pdf, items, cursorY, contentWidth, margin, theme) {
  const pageHeight = pdf.internal.pageSize.getHeight();
  let x = margin;
  let y = cursorY;

  items.forEach((item) => {
    const text = cleanPdfLine(item).replace(/^[A-Za-z\s]+:\s*/, "");
    const chipWidth = pdf.getTextWidth(text) + 8;
    if (x + chipWidth > margin + contentWidth) {
      x = margin;
      y += 8;
    }
    if (y > pageHeight - 16) {
      pdf.addPage();
      pdf.setFillColor(...theme.pageBg);
      pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), pageHeight, "F");
      x = margin;
      y = 12;
    }
    pdf.setFillColor(...theme.chipBg);
    pdf.roundedRect(x, y - 3.5, chipWidth, 6.5, 3, 3, "F");
    pdf.setTextColor(...theme.chipText);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(text, x + 4, y + 0.8);
    x += chipWidth + 3;
  });

  return y + 9;
}

function cleanPdfLine(value) {
  return String(value || "")
    .replace(/^-+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncatePdfText(value, maxLength) {
  const text = String(value || "").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

const PDF_THEMES = {
  classic: {
    pageBg: [248, 250, 252],
    headerBg: [15, 23, 42],
    headerText: [255, 255, 255],
    sidebarBg: [15, 23, 42],
    accent: [15, 23, 42],
    bodyText: [51, 65, 85],
    bullet: [100, 116, 139],
    chipBg: [226, 232, 240],
    chipText: [15, 23, 42],
    cardBg: [255, 255, 255],
  },
  modern: {
    pageBg: [255, 247, 237],
    headerBg: [255, 237, 213],
    headerText: [15, 23, 42],
    accent: [249, 115, 22],
    bodyText: [51, 65, 85],
    bullet: [249, 115, 22],
    chipBg: [255, 237, 213],
    chipText: [194, 65, 12],
    cardBg: [255, 255, 255],
  },
  creative: {
    pageBg: [240, 253, 250],
    headerBg: [15, 23, 42],
    headerText: [255, 255, 255],
    headerGlow: [45, 212, 191],
    accent: [13, 148, 136],
    bodyText: [30, 41, 59],
    bullet: [13, 148, 136],
    chipBg: [204, 251, 241],
    chipText: [15, 118, 110],
    blockBg: [255, 255, 255],
    softBlockBg: [236, 254, 255],
    frame: [15, 118, 110],
  },
};
