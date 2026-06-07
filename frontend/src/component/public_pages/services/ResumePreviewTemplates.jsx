import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Mail, MapPin } from "lucide-react";

const sectionTitleClass = "text-[11px] font-black uppercase tracking-[0.32em]";

export const previewTemplates = [
  {
    id: "classic",
    name: "Classic Slate",
    accent: "bg-slate-900",
    description: "Balanced academic layout with polished serif-style hierarchy.",
  },
  {
    id: "modern",
    name: "Modern Grid",
    accent: "bg-orange-500",
    description: "Project-forward layout with bento sections and fast scanning.",
  },
  {
    id: "creative",
    name: "Creative Spotlight",
    accent: "bg-teal-500",
    description: "Bold hero presentation for visually memorable student portfolios.",
  },
];

export function ResumeTemplateShowcase({ templateId, data }) {
  const template = previewTemplates.find((item) => item.id === templateId) || previewTemplates[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.985 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="min-h-[980px] avoid-page-break"
      >
        {template.id === "modern" ? <ModernTemplate data={data} /> : null}
        {template.id === "creative" ? <CreativeTemplate data={data} /> : null}
        {template.id === "classic" ? <ClassicTemplate data={data} /> : null}
      </motion.div>
    </AnimatePresence>
  );
}

function ClassicTemplate({ data }) {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="bg-[linear-gradient(120deg,#0f172a,#1e293b_45%,#334155)] px-10 py-10 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-black tracking-tight"
        >
          {data.name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-lg text-slate-200"
        >
          {data.targetRole}
        </motion.p>
        <ContactStrip data={data} dark />
      </div>

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-0">
        <div className="p-10 space-y-8">
          <ResumeSection title="Professional Summary" accent="text-slate-900">
            <BulletList items={data.summary} />
          </ResumeSection>
          <ResumeSection title="Projects" accent="text-slate-900">
            <ProjectCards items={data.projects} tone="slate" />
          </ResumeSection>
          <ResumeSection title="Experience & Training" accent="text-slate-900">
            <EntryList items={data.experiences} />
          </ResumeSection>
        </div>

        <div className="bg-slate-50 p-10 space-y-8 border-l border-slate-200">
          <ResumeSection title="Education" accent="text-slate-900">
            <EntryList items={data.education} compact />
          </ResumeSection>
          <ResumeSection title="Technical Skills" accent="text-slate-900">
            <TagCloud items={data.skills} tone="slate" />
          </ResumeSection>
          <ResumeSection title="Certifications" accent="text-slate-900">
            <BulletList items={data.certifications} />
          </ResumeSection>
          <ResumeSection title="Soft Skills" accent="text-slate-900">
            <TagCloud items={data.softSkills} tone="light" />
          </ResumeSection>
          <ResumeSection title="Languages & Hobbies" accent="text-slate-900">
            <MiniColumns leftTitle="Languages" leftItems={data.languages} rightTitle="Hobbies" rightItems={data.hobbies} />
          </ResumeSection>
        </div>
      </div>
    </div>
  );
}

function ModernTemplate({ data }) {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-orange-100 bg-[radial-gradient(circle_at_top_right,#ffedd5,transparent_30%),linear-gradient(180deg,#fff7ed,#ffffff_32%)] shadow-[0_24px_80px_rgba(249,115,22,0.12)]">
      <div className="px-10 py-10 border-b border-orange-100">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-black uppercase tracking-[0.38em] text-orange-500"
            >
              Resume Preview
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-3 text-4xl font-black text-slate-900"
            >
              {data.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 text-lg text-slate-600"
            >
              {data.targetRole}
            </motion.p>
          </div>
          <div className="min-w-[240px] rounded-[1.5rem] border border-orange-200 bg-white/80 p-4 backdrop-blur">
            <ContactStrip data={data} />
          </div>
        </div>
      </div>

      <div className="p-8 grid xl:grid-cols-2 gap-6">
        <AnimatedCard delay={0.04} className="xl:col-span-2 bg-white">
          <ResumeSection title="Professional Highlights" accent="text-orange-500">
            <BulletList items={data.summary} />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.08} className="bg-slate-900 text-white">
          <ResumeSection title="Tech Stack" accent="text-orange-300" dark>
            <TagCloud items={data.skills} tone="dark" />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.12} className="bg-white">
          <ResumeSection title="Education" accent="text-orange-500">
            <EntryList items={data.education} compact />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.16} className="bg-white">
          <ResumeSection title="Projects" accent="text-orange-500">
            <ProjectCards items={data.projects} tone="orange" />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.2} className="bg-white">
          <ResumeSection title="Experience" accent="text-orange-500">
            <EntryList items={data.experiences} />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.24} className="bg-white">
          <ResumeSection title="Certifications & Traits" accent="text-orange-500">
            <BulletList items={data.certifications} />
            <div className="mt-4">
              <TagCloud items={data.softSkills} tone="orange-light" />
            </div>
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.28} className="xl:col-span-2 bg-[linear-gradient(120deg,#fff7ed,#ffffff,#f8fafc)]">
          <MiniColumns leftTitle="Languages" leftItems={data.languages} rightTitle="Hobbies" rightItems={data.hobbies} />
        </AnimatedCard>
      </div>
    </div>
  );
}

function CreativeTemplate({ data }) {
  return (
    <div className="rounded-[2rem] overflow-hidden border border-teal-100 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#134e4a_100%)] shadow-[0_24px_90px_rgba(20,184,166,0.18)] text-white">
      <div className="px-10 py-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(45,212,191,0.28),transparent_28%),radial-gradient(circle_at_90%_15%,rgba(251,191,36,0.18),transparent_22%)]" />
        <div className="relative grid lg:grid-cols-[1.05fr,0.95fr] gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-black uppercase tracking-[0.42em] text-teal-200"
            >
              Student Showcase Resume
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="mt-4 text-5xl font-black leading-tight"
            >
              {data.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mt-4 text-xl text-teal-100"
            >
              {data.targetRole}
            </motion.p>
            <div className="mt-8">
              <ResumeSection title="Career Snapshot" accent="text-teal-200" dark>
                <BulletList items={data.summary} dark />
              </ResumeSection>
            </div>
          </div>
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.16 }}
              className="rounded-[2rem] border border-white/10 bg-white/8 backdrop-blur-lg p-6"
            >
              <ContactStrip data={data} dark />
              <div className="mt-6">
                <ResumeSection title="Technical Identity" accent="text-amber-300" dark>
                  <TagCloud items={data.skills} tone="dark-teal" />
                </ResumeSection>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-white text-slate-900 p-8 grid xl:grid-cols-[1.05fr,0.95fr] gap-6">
        <AnimatedCard delay={0.06} className="bg-teal-50">
          <ResumeSection title="Projects" accent="text-teal-700">
            <ProjectCards items={data.projects} tone="teal" />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.1} className="bg-white">
          <ResumeSection title="Experience" accent="text-teal-700">
            <EntryList items={data.experiences} />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.14} className="bg-white">
          <ResumeSection title="Education" accent="text-teal-700">
            <EntryList items={data.education} compact />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.18} className="bg-white">
          <ResumeSection title="Certifications" accent="text-teal-700">
            <BulletList items={data.certifications} />
          </ResumeSection>
        </AnimatedCard>
        <AnimatedCard delay={0.22} className="xl:col-span-2 bg-[linear-gradient(120deg,#ecfeff,#ffffff,#f8fafc)]">
          <div className="grid md:grid-cols-3 gap-5">
            <ResumeSection title="Soft Skills" accent="text-teal-700">
              <TagCloud items={data.softSkills} tone="teal-light" />
            </ResumeSection>
            <ResumeSection title="Languages" accent="text-teal-700">
              <BulletList items={data.languages} />
            </ResumeSection>
            <ResumeSection title="Hobbies" accent="text-teal-700">
              <BulletList items={data.hobbies} />
            </ResumeSection>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

function ResumeSection({ title, accent, dark = false, children }) {
  return (
    <section>
      <p className={`${sectionTitleClass} ${accent}`}>{title}</p>
      <div className={`mt-4 ${dark ? "text-slate-100" : "text-slate-700"}`}>{children}</div>
    </section>
  );
}

function AnimatedCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`rounded-[1.75rem] border border-black/5 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function ContactStrip({ data, dark = false }) {
  const items = [
    { icon: Mail, text: data.email },
    { icon: MapPin, text: data.location },
    { icon: ExternalLink, text: data.github },
    { icon: ExternalLink, text: data.linkedin },
  ].filter((item) => item.text);

  return (
    <div className={`mt-6 flex flex-wrap gap-3 ${dark ? "text-slate-200" : "text-slate-600"}`}>
      {items.map((item) => (
        <span
          key={`${item.text}-${item.icon.displayName || "icon"}`}
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ${
            dark ? "bg-white/10 border border-white/10" : "bg-slate-100"
          }`}
        >
          <item.icon size={14} />
          {item.text}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items, dark = false }) {
  return (
    <ul className={`space-y-2 text-sm leading-6 ${dark ? "text-slate-100" : "text-slate-700"}`}>
      {items.map((item) => (
        <motion.li
          key={item}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <span className={`mt-2 h-2 w-2 rounded-full ${dark ? "bg-teal-200" : "bg-current opacity-60"}`} />
          <span>{cleanLine(item)}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function EntryList({ items, compact = false }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl ${compact ? "bg-transparent border-0 p-0" : "bg-white/70 border border-slate-200 p-4"}`}
        >
          <p className="text-sm leading-6 text-slate-700">{cleanLine(item)}</p>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectCards({ items, tone }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[1.5rem] p-4 border ${projectToneClass(tone)}`}
        >
          <p className="text-sm leading-6">{cleanLine(item)}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TagCloud({ items, tone }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <motion.span
          key={item}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-full px-3 py-2 text-sm font-semibold ${tagToneClass(tone)}`}
        >
          {cleanLine(item).replace(/^[A-Za-z\s]+:\s*/, "")}
        </motion.span>
      ))}
    </div>
  );
}

function MiniColumns({ leftTitle, leftItems, rightTitle, rightItems }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">{leftTitle}</p>
        <div className="mt-3">
          <BulletList items={leftItems} />
        </div>
      </div>
      <div>
        <p className="text-sm font-black uppercase tracking-[0.25em] text-slate-500">{rightTitle}</p>
        <div className="mt-3">
          <BulletList items={rightItems} />
        </div>
      </div>
    </div>
  );
}

function cleanLine(line) {
  return String(line || "")
    .replace(/^-+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function projectToneClass(tone) {
  if (tone === "orange") {
    return "border-orange-200 bg-orange-50/70 text-slate-700";
  }
  if (tone === "teal") {
    return "border-teal-200 bg-white text-slate-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function tagToneClass(tone) {
  if (tone === "dark") {
    return "bg-white/10 text-white border border-white/10";
  }
  if (tone === "dark-teal") {
    return "bg-white/10 text-teal-50 border border-white/10";
  }
  if (tone === "orange-light") {
    return "bg-orange-100 text-orange-700";
  }
  if (tone === "orange") {
    return "bg-orange-500/10 text-orange-700";
  }
  if (tone === "teal-light") {
    return "bg-teal-100 text-teal-700";
  }
  if (tone === "light") {
    return "bg-white text-slate-700 border border-slate-200";
  }
  return "bg-slate-100 text-slate-700";
}
