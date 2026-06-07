import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("docs");
const htmlPath = path.join(outDir, "alumni-connect-college-presentation.html");
const mdPath = path.join(outDir, "alumni-connect-college-presentation.md");

const slides = [
  {
    title: "Alumni Connect",
    subtitle: "College Project Presentation",
    bullets: [
      "A role-based full-stack platform for students, alumni, and administrators.",
      "Built with React, Flask, MongoDB, JWT cookies, Socket.IO, Gemini AI support, and LinkedIn publishing.",
      "Main goal: improve mentorship, career readiness, job access, and campus-alumni engagement.",
    ],
    notes:
      "Start by describing the problem: students need guidance, jobs, resume help, and real alumni connections. Alumni need a structured way to contribute. Admins need verification and moderation controls.",
  },
  {
    title: "Problem Statement",
    bullets: [
      "Students often do not have direct access to verified alumni mentors.",
      "Career opportunities are scattered across external platforms.",
      "Colleges need a controlled system for alumni verification and community moderation.",
      "Students need practical tools such as resume generation, mentor recommendations, and job matching.",
    ],
    notes:
      "Explain that this project is not only a directory. It is designed as a career ecosystem where networking, mentorship, jobs, and AI support are connected.",
  },
  {
    title: "Project Objectives",
    bullets: [
      "Create separate experiences for students, alumni, and admins.",
      "Enable alumni verification before giving privileged access.",
      "Recommend mentors based on profile data such as skills, goals, and topics.",
      "Support realtime alumni-student conversations.",
      "Provide job posting, job matching, application tracking, and LinkedIn-oriented publishing.",
      "Add AI-assisted resume, article, and assistant tools.",
    ],
    notes:
      "These objectives show that the project has both technical and product goals. The technical goal is full-stack integration; the product goal is campus career readiness.",
  },
  {
    title: "High-Level Architecture",
    bullets: [
      "Frontend: React + Vite single-page application.",
      "Backend: Flask API with Flask blueprints.",
      "Database: MongoDB document storage.",
      "Realtime layer: Flask-SocketIO and socket.io-client.",
      "Authentication: JWT access token stored in an HttpOnly cookie.",
      "External integrations: Gemini AI and LinkedIn OAuth/publishing.",
    ],
    diagram: ["React Frontend", "Flask REST API", "MongoDB", "Socket.IO", "Gemini / LinkedIn"],
    notes:
      "Walk through the data flow: the browser calls Flask APIs, Flask reads or writes MongoDB, and Socket.IO pushes live updates for chat and jobs.",
  },
  {
    title: "Frontend Stack",
    bullets: [
      "React 19: component-based UI.",
      "React Router: public and protected routes.",
      "Tailwind CSS: utility-first styling.",
      "Framer Motion: transitions and card animations.",
      "Recharts: dashboard charts.",
      "Lucide React: icons.",
      "Socket.IO client: realtime chat and job updates.",
      "jsPDF, html2canvas, html2pdf.js, react-to-print: resume export and print workflows.",
    ],
    notes:
      "Mention that the frontend is organized by role and feature. API calls are wrapped in service files such as jobService, chatService, forumService, and aiToolsService.",
  },
  {
    title: "Backend Stack",
    bullets: [
      "Flask: lightweight Python web framework.",
      "Flask-CORS: allows frontend requests with cookies.",
      "Flask-JWT-Extended: creates and verifies JWT tokens.",
      "Flask-SocketIO: realtime communication.",
      "PyMongo: MongoDB access.",
      "bcrypt: password hashing.",
      "python-dotenv: environment variable loading.",
    ],
    notes:
      "Explain that Flask blueprints separate features into route modules: auth, profile, admin, chat, mentorship, forum, jobs, LinkedIn, and AI tools.",
  },
  {
    title: "MongoDB Database Design",
    bullets: [
      "users: login credentials, role, verification status, and profile.",
      "conversations: participant metadata and moderation status.",
      "messages: chat messages linked to conversations.",
      "job_posts: internal and LinkedIn-oriented job records.",
      "job_applications: student application tracking.",
      "forum_posts: community posts with sentiment metadata.",
      "platform_settings: LinkedIn organization connection details.",
    ],
    notes:
      "MongoDB works well here because profiles, conversations, and job metadata are naturally document-shaped. User profile data is nested inside the user document.",
  },
  {
    title: "Role-Based Access",
    bullets: [
      "Student: mentorship, jobs, conversations, resume builder, forum, article writer, assistant.",
      "Alumni: profile, student list, conversations, job posting, LinkedIn-oriented job workflows.",
      "Admin: alumni approval, metrics, student/alumni lists, conversation moderation, job management.",
      "Frontend protection improves UX; backend checks provide actual security.",
    ],
    notes:
      "Emphasize that frontend route protection alone is not enough. The backend must check JWT identity and role before performing sensitive actions.",
  },
  {
    title: "Authentication Flow",
    bullets: [
      "User selects a role and submits login credentials.",
      "Backend validates email, password, and requested role.",
      "bcrypt compares the entered password with the stored password hash.",
      "Unverified alumni are blocked until admin approval.",
      "Backend creates a JWT access token.",
      "Token is stored in an HttpOnly browser cookie.",
      "Frontend calls /api/auth/me to restore the session after refresh.",
    ],
    notes:
      "This gives the app a session-like behavior while still using token-based auth. The browser automatically sends the cookie on API calls.",
  },
  {
    title: "How JWT Works",
    bullets: [
      "JWT means JSON Web Token.",
      "It has three parts: header, payload, and signature.",
      "Header describes the algorithm and token type.",
      "Payload stores claims such as user identity and role.",
      "Signature proves the token was created by the backend using the secret key.",
      "The backend verifies the signature before trusting the token.",
    ],
    notes:
      "A JWT is not encrypted by default; it is signed. That means the server can detect tampering. Sensitive data should not be placed inside the payload.",
  },
  {
    title: "Access Token in This Project",
    bullets: [
      "The backend creates an access token after successful login.",
      "Identity is the user's email.",
      "Role is added as a claim for role-based checks.",
      "Token expiry is configured for 2 hours.",
      "The token is stored in an HttpOnly cookie, not localStorage.",
      "HttpOnly helps prevent JavaScript from reading the token during XSS attacks.",
    ],
    notes:
      "Point to backend/src/app.py: JWT_TOKEN_LOCATION is cookies, JWT_COOKIE_HTTPONLY is true, and JWT_ACCESS_TOKEN_EXPIRES is 2 hours.",
  },
  {
    title: "Refresh Token Concept",
    bullets: [
      "A refresh token is a longer-lived token used to obtain new access tokens.",
      "Access tokens should be short-lived.",
      "Refresh tokens reduce how often users must log in.",
      "This project currently uses an access token cookie only.",
      "A production upgrade would add refresh tokens, token rotation, logout invalidation, and CSRF protection.",
    ],
    notes:
      "Be transparent: refresh tokens are important to explain, but they are not currently implemented in this codebase. Say this as an improvement area.",
  },
  {
    title: "Cookie Security",
    bullets: [
      "HttpOnly: JavaScript cannot read the cookie.",
      "SameSite=Lax: protects many cross-site request cases while allowing normal navigation.",
      "Secure=False locally: okay for localhost, should be True in HTTPS production.",
      "CSRF protection is currently disabled for development simplicity.",
      "Production should enable CSRF protection when using cookie-based JWT auth.",
    ],
    notes:
      "This slide shows awareness of security tradeoffs. It is useful in viva because you can explain both current behavior and recommended production hardening.",
  },
  {
    title: "Registration Process",
    bullets: [
      "Frontend sends full name, email, password, role, and profile fields.",
      "Backend checks if email already exists.",
      "Password is hashed with bcrypt.",
      "User document is formatted with role-specific profile fields.",
      "Student and admin accounts are verified immediately.",
      "Alumni accounts are created as unverified and require admin approval.",
    ],
    notes:
      "This process supports trust management. Alumni get access only after admin verification, which protects students from fake mentor accounts.",
  },
  {
    title: "Profile System",
    bullets: [
      "Each user has a nested profile object.",
      "Profile stores PRN/ID, graduation year, headline, bio, skills, career goals, mentorship topics, availability, location, company, and links.",
      "Profile update uses MongoDB nested field updates.",
      "Profile data powers mentorship matching, job scoring, resume defaults, and public profile views.",
    ],
    notes:
      "The profile is the central data source. Strong profile data improves matching and personalization across the platform.",
  },
  {
    title: "Mentorship Matching",
    bullets: [
      "Student requests mentor recommendations.",
      "Backend loads the student profile and verified alumni profiles.",
      "Local matching scores overlap in skills, career goals, mentorship topics, bio/headline terms, availability, and company information.",
      "Gemini can enhance ranking and match reasons when configured.",
      "If Gemini is unavailable, local fallback keeps the feature working.",
    ],
    notes:
      "This is a hybrid AI design: deterministic fallback plus optional AI enhancement. It is reliable for demos because it does not fully depend on an external API.",
  },
  {
    title: "Mentorship Request Flow",
    bullets: [
      "Student chooses a recommended mentor.",
      "Backend validates mentor ID and ensures the mentor is a verified alumni.",
      "Backend checks if a conversation already exists.",
      "If not, it creates a mentorship conversation.",
      "A system message announces the mentorship request.",
      "Student and alumni can continue in realtime chat.",
    ],
    notes:
      "This shows a connected workflow. Matching does not end at a recommendation card; it leads directly into communication.",
  },
  {
    title: "Realtime Chat With Socket.IO",
    bullets: [
      "Socket connection uses the JWT cookie to identify the user.",
      "Users join their personal room and conversation rooms.",
      "Messages are stored in MongoDB.",
      "Backend emits live events to conversation participants.",
      "Conversation metadata is updated with the latest message.",
      "Admin moderation can mute or close conversations.",
    ],
    notes:
      "Explain rooms: a room is a Socket.IO channel. It lets the server send updates only to relevant users instead of broadcasting to everyone.",
  },
  {
    title: "Admin Governance",
    bullets: [
      "Admin verifies pending alumni.",
      "Admin views student and alumni records.",
      "Admin dashboard shows platform metrics.",
      "Admin can inspect conversations.",
      "Admin can mark conversations active, flagged, muted, or closed.",
      "Moderation status affects backend chat behavior.",
    ],
    notes:
      "This is important because the admin is not just decorative. Admin actions affect platform trust and communication safety.",
  },
  {
    title: "Job Portal",
    bullets: [
      "Alumni and admins can post jobs.",
      "Students can browse jobs and open application links.",
      "Jobs have title, company, description, tags, location, publisher, source, and LinkedIn fields.",
      "Student job cards show personalized match score.",
      "Application count updates when students confirm they applied.",
      "Alumni and admins can delete jobs when needed.",
    ],
    notes:
      "Mention the recent delete feature: DELETE /api/jobs/<job_id> removes the job and associated saved application rows.",
  },
  {
    title: "Job Matching and Applications",
    bullets: [
      "Backend compares student profile skills with job tags.",
      "Career goals are checked against job tags.",
      "Each job receives a score and applied status.",
      "Student opens the external application link.",
      "Student confirms application inside the platform.",
      "Backend saves an application record and emits a realtime update.",
    ],
    notes:
      "This is a practical workflow because many applications happen on external company or LinkedIn pages. The platform tracks the student's action afterward.",
  },
  {
    title: "LinkedIn Integration",
    bullets: [
      "Admin connects an organization LinkedIn account using OAuth.",
      "Backend exchanges authorization code for a LinkedIn access token.",
      "Connection details are stored in platform settings.",
      "Job posts can be published to the organization page.",
      "Backend stores LinkedIn post URL, URN, and publish time.",
      "Socket event refreshes job cards after publishing.",
    ],
    notes:
      "OAuth flow: redirect user to LinkedIn, LinkedIn returns a code, backend exchanges code for token, token is used to call LinkedIn APIs.",
  },
  {
    title: "Forum and Sentiment",
    bullets: [
      "Authenticated users can create forum posts.",
      "Posts store author name, role, content, company, and timestamp.",
      "Rule-based sentiment checks positive and negative words.",
      "Posts can be flagged if negative score is high.",
      "Forum list returns community health metrics.",
      "Admin dashboard can use flagged forum counts for moderation visibility.",
    ],
    notes:
      "Be clear that this is a simple rule-based sentiment approach, not a deep NLP model. It is still useful for demonstrating moderation signals.",
  },
  {
    title: "AI Resume Builder",
    bullets: [
      "Student fills structured resume fields.",
      "Backend improves summary, skills, education, projects, certifications, and experience.",
      "Gemini can produce polished resume sections.",
      "Local fallback improves text when Gemini is not configured.",
      "Frontend supports templates, previews, section improvements, and PDF export.",
    ],
    notes:
      "This is a strong project feature because it has both backend AI logic and a rich frontend workflow. It supports repeated improvement attempts.",
  },
  {
    title: "Article Writer and Assistant",
    bullets: [
      "Article writer generates structured knowledge-sharing content.",
      "Audience can be students or alumni.",
      "Campus assistant gives guidance on mentorship, resumes, jobs, and platform usage.",
      "These tools add productivity support around the core networking features.",
    ],
    notes:
      "These are utility features. They make the platform feel like a career-readiness suite, not only a CRUD dashboard.",
  },
  {
    title: "Service Layer Pattern",
    bullets: [
      "Frontend services centralize API calls.",
      "Examples: jobService, mentorshipService, forumService, chatService, aiToolsService.",
      "Backend services centralize reusable logic.",
      "Examples: matching_service, gemini_service, sentiment_service, socket_service.",
      "This separation keeps components and controllers easier to maintain.",
    ],
    notes:
      "This is a good software engineering point for viva. Explain that UI components should not directly contain all HTTP or algorithm logic.",
  },
  {
    title: "API and Blueprint Structure",
    bullets: [
      "/api/auth: register, login, me, logout.",
      "/api/profile: profile update and profile fetch.",
      "/api/admin: approval, lists, metrics, moderation.",
      "/api/mentorship: recommendations and mentor request.",
      "/api/chat: conversations and messages.",
      "/api/jobs: job listing, create, delete, apply.",
      "/api/linkedin: OAuth status, connect, callback, publish job.",
      "/api/ai: resume, article, assistant tools.",
    ],
    notes:
      "Blueprints make the backend modular. Each domain has its own route file and controller file.",
  },
  {
    title: "Data Flow Example: Login",
    bullets: [
      "1. User submits login form.",
      "2. React calls backend auth API.",
      "3. Flask validates credentials and role.",
      "4. bcrypt verifies password hash.",
      "5. Flask creates JWT access token.",
      "6. Browser stores HttpOnly cookie.",
      "7. AuthContext calls /api/auth/me to load current user.",
      "8. ProtectedRoute allows role-specific dashboard access.",
    ],
    notes:
      "Use this as a process explanation slide. It shows frontend, backend, database, and token behavior together.",
  },
  {
    title: "Data Flow Example: Mentor Request",
    bullets: [
      "1. Student opens mentorship page.",
      "2. Frontend requests recommendations.",
      "3. Backend ranks verified alumni.",
      "4. Student clicks request mentor.",
      "5. Backend creates or reuses conversation.",
      "6. System message is inserted.",
      "7. Student and alumni chat in realtime.",
    ],
    notes:
      "This explains why MongoDB collections are connected: users feed matching, matching feeds conversations, conversations feed messages.",
  },
  {
    title: "Data Flow Example: Job Delete",
    bullets: [
      "1. Alumni or admin clicks trash button on a job card.",
      "2. Frontend asks for confirmation.",
      "3. Frontend sends DELETE /api/jobs/<job_id>.",
      "4. Backend verifies JWT and role.",
      "5. Backend deletes the job post.",
      "6. Backend removes related job application records.",
      "7. Backend emits jobs:deleted event.",
      "8. Open job portals refresh automatically.",
    ],
    notes:
      "This slide can be used to show the recent maintenance feature and how frontend, backend, database, and sockets coordinate.",
  },
  {
    title: "Environment and Configuration",
    bullets: [
      "JWT_SECRET_KEY secures token signatures.",
      "MongoDB URI and database name configure persistence.",
      "Gemini API key enables AI enhancement.",
      "LinkedIn client ID, secret, redirect URI, and organization settings enable publishing.",
      "Frontend API base URL points to the Flask backend.",
      "Local development uses localhost ports 5173 and 5000.",
    ],
    notes:
      "Explain that secrets should stay in .env and should not be committed publicly. Production should move localhost origins to environment variables.",
  },
  {
    title: "Security Considerations",
    bullets: [
      "Passwords are hashed with bcrypt.",
      "JWT token is stored in HttpOnly cookie.",
      "Backend enforces role checks for protected actions.",
      "Alumni verification protects students from untrusted accounts.",
      "CSRF protection should be enabled before production deployment.",
      "Refresh tokens and token rotation would improve long-term sessions.",
      "Sensitive API keys must stay in environment variables.",
    ],
    notes:
      "This slide prepares you for security questions. Mention what is already implemented and what should be improved for production.",
  },
  {
    title: "Testing and Validation",
    bullets: [
      "Frontend build is verified with Vite.",
      "Manual workflow testing covers login, role navigation, job posting, mentor request, and chat.",
      "Recommended future tests: auth controller, job controller, mentorship matching, chat moderation, profile updates.",
      "Request validation schemas would make API behavior safer and clearer.",
    ],
    notes:
      "Be honest that a formal automated test suite is still a future improvement. That is normal for many academic projects but worth acknowledging.",
  },
  {
    title: "Current Limitations",
    bullets: [
      "Some dashboard metrics and charts are still presentation-oriented.",
      "Forgot/reset password screens need a complete backend token flow.",
      "Refresh token flow is not implemented yet.",
      "Some old or duplicate components remain in the codebase.",
      "Production deployment needs stronger environment configuration and security settings.",
    ],
    notes:
      "A good presentation should include limitations. It shows maturity and makes the project more credible.",
  },
  {
    title: "Future Scope",
    bullets: [
      "Add refresh token rotation and CSRF protection.",
      "Complete forgot/reset password with email token verification.",
      "Add analytics dashboards with live charts.",
      "Improve mentor recommendations with feedback loops.",
      "Add notification system for mentorship, jobs, and admin alerts.",
      "Add automated tests and deployment pipeline.",
      "Enhance sentiment analysis with a stronger NLP model.",
    ],
    notes:
      "Future scope should sound practical. These are extensions of the existing architecture rather than unrelated features.",
  },
  {
    title: "Conclusion",
    bullets: [
      "Alumni Connect solves a real campus career-readiness problem.",
      "It demonstrates full-stack development with React, Flask, MongoDB, JWT, Socket.IO, AI tools, and LinkedIn integration.",
      "The platform supports students, alumni, and admins with role-specific workflows.",
      "Core strengths are mentorship matching, realtime chat, job workflows, admin governance, and AI-assisted productivity.",
    ],
    notes:
      "End by connecting the technical implementation back to the social impact: better alumni engagement and better student career preparation.",
  },
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderDiagram(items) {
  if (!items) return "";
  return `<div class="diagram">${items
    .map((item, index) => `<div class="node">${escapeHtml(item)}</div>${index < items.length - 1 ? '<div class="arrow">→</div>' : ""}`)
    .join("")}</div>`;
}

function renderHtml() {
  const sections = slides
    .map(
      (slide, index) => `
      <section class="slide${index === 0 ? " active" : ""}" data-index="${index}">
        <div class="slide-number">${index + 1} / ${slides.length}</div>
        <div class="content">
          <p class="eyebrow">Alumni Connect</p>
          <h1>${escapeHtml(slide.title)}</h1>
          ${slide.subtitle ? `<h2>${escapeHtml(slide.subtitle)}</h2>` : ""}
          ${renderDiagram(slide.diagram)}
          <ul>
            ${slide.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
          </ul>
        </div>
        <details class="notes">
          <summary>Speaker Notes</summary>
          <p>${escapeHtml(slide.notes)}</p>
        </details>
      </section>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Alumni Connect College Presentation</title>
  <style>
    :root {
      --bg: #f4f7fb;
      --ink: #162033;
      --muted: #5b677a;
      --accent: #c81e1e;
      --accent-dark: #8f1515;
      --panel: #ffffff;
      --line: #dfe6f1;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--ink);
    }

    .deck {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }

    .slide {
      display: none;
      width: min(1120px, 100%);
      min-height: 680px;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 18px;
      box-shadow: 0 24px 80px rgba(22, 32, 51, 0.12);
      position: relative;
      overflow: hidden;
      padding: 54px 64px 96px;
    }

    .slide::before {
      content: "";
      position: absolute;
      inset: 0 0 auto;
      height: 10px;
      background: linear-gradient(90deg, var(--accent), #1d4ed8, #059669);
    }

    .slide.active { display: block; }

    .slide-number {
      position: absolute;
      top: 26px;
      right: 34px;
      color: var(--muted);
      font-weight: 700;
      font-size: 14px;
    }

    .eyebrow {
      color: var(--accent);
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin: 0 0 16px;
    }

    h1 {
      font-size: 54px;
      line-height: 1.04;
      margin: 0 0 14px;
      max-width: 900px;
    }

    h2 {
      font-size: 25px;
      line-height: 1.3;
      margin: 0 0 28px;
      color: var(--muted);
      font-weight: 700;
    }

    ul {
      margin: 32px 0 0;
      padding-left: 26px;
      max-width: 940px;
    }

    li {
      font-size: 24px;
      line-height: 1.42;
      margin: 14px 0;
      padding-left: 6px;
    }

    li::marker { color: var(--accent); }

    .diagram {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin: 28px 0 18px;
    }

    .node {
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 17px;
      font-weight: 800;
    }

    .arrow {
      color: var(--accent);
      font-size: 24px;
      font-weight: 900;
    }

    .notes {
      position: absolute;
      left: 64px;
      right: 64px;
      bottom: 26px;
      border-top: 1px solid var(--line);
      padding-top: 14px;
      color: var(--muted);
      font-size: 15px;
    }

    .notes summary {
      cursor: pointer;
      font-weight: 900;
      color: var(--accent-dark);
    }

    .notes p {
      margin: 8px 0 0;
      line-height: 1.45;
    }

    .controls {
      position: fixed;
      left: 50%;
      bottom: 18px;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      background: rgba(255,255,255,0.9);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 8px;
      box-shadow: 0 10px 30px rgba(22, 32, 51, 0.14);
    }

    button {
      border: 0;
      border-radius: 999px;
      background: var(--ink);
      color: #fff;
      font-weight: 900;
      padding: 10px 16px;
      cursor: pointer;
    }

    button.secondary {
      background: #eef2f7;
      color: var(--ink);
    }

    @media (max-width: 760px) {
      .deck { padding: 10px; }
      .slide {
        min-height: calc(100vh - 20px);
        border-radius: 12px;
        padding: 42px 24px 100px;
      }
      h1 { font-size: 34px; }
      h2 { font-size: 20px; }
      li { font-size: 18px; }
      .notes { left: 24px; right: 24px; }
    }

    @media print {
      body { background: #fff; }
      .deck { display: block; padding: 0; }
      .slide {
        display: block !important;
        break-after: page;
        page-break-after: always;
        width: 100%;
        min-height: 100vh;
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }
      .controls { display: none; }
    }
  </style>
</head>
<body>
  <main class="deck">
    ${sections}
  </main>
  <nav class="controls" aria-label="Presentation controls">
    <button class="secondary" id="prev">Previous</button>
    <button id="next">Next</button>
    <button class="secondary" id="print">Print / Save PDF</button>
  </nav>
  <script>
    const slides = Array.from(document.querySelectorAll(".slide"));
    let current = 0;

    function show(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      location.hash = String(current + 1);
    }

    document.getElementById("prev").addEventListener("click", () => show(current - 1));
    document.getElementById("next").addEventListener("click", () => show(current + 1));
    document.getElementById("print").addEventListener("click", () => window.print());

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") show(current + 1);
      if (event.key === "ArrowLeft" || event.key === "PageUp") show(current - 1);
      if (event.key === "Home") show(0);
      if (event.key === "End") show(slides.length - 1);
    });

    const initial = Number(location.hash.replace("#", ""));
    if (initial) show(initial - 1);
  </script>
</body>
</html>`;
}

function renderMarkdown() {
  return slides
    .map((slide, index) => {
      const title = `# ${index + 1}. ${slide.title}`;
      const subtitle = slide.subtitle ? `\n\n## ${slide.subtitle}` : "";
      const bullets = slide.bullets.map((bullet) => `- ${bullet}`).join("\n");
      return `${title}${subtitle}\n\n${bullets}\n\n**Speaker Notes:** ${slide.notes}`;
    })
    .join("\n\n---\n\n");
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(htmlPath, renderHtml(), "utf8");
fs.writeFileSync(mdPath, renderMarkdown(), "utf8");

console.log(`Wrote ${htmlPath}`);
console.log(`Wrote ${mdPath}`);
