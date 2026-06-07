# 1. Alumni Connect

## College Project Presentation

- A role-based full-stack platform for students, alumni, and administrators.
- Built with React, Flask, MongoDB, JWT cookies, Socket.IO, Gemini AI support, and LinkedIn publishing.
- Main goal: improve mentorship, career readiness, job access, and campus-alumni engagement.

**Speaker Notes:** Start by describing the problem: students need guidance, jobs, resume help, and real alumni connections. Alumni need a structured way to contribute. Admins need verification and moderation controls.

---

# 2. Problem Statement

- Students often do not have direct access to verified alumni mentors.
- Career opportunities are scattered across external platforms.
- Colleges need a controlled system for alumni verification and community moderation.
- Students need practical tools such as resume generation, mentor recommendations, and job matching.

**Speaker Notes:** Explain that this project is not only a directory. It is designed as a career ecosystem where networking, mentorship, jobs, and AI support are connected.

---

# 3. Project Objectives

- Create separate experiences for students, alumni, and admins.
- Enable alumni verification before giving privileged access.
- Recommend mentors based on profile data such as skills, goals, and topics.
- Support realtime alumni-student conversations.
- Provide job posting, job matching, application tracking, and LinkedIn-oriented publishing.
- Add AI-assisted resume, article, and assistant tools.

**Speaker Notes:** These objectives show that the project has both technical and product goals. The technical goal is full-stack integration; the product goal is campus career readiness.

---

# 4. High-Level Architecture

- Frontend: React + Vite single-page application.
- Backend: Flask API with Flask blueprints.
- Database: MongoDB document storage.
- Realtime layer: Flask-SocketIO and socket.io-client.
- Authentication: JWT access token stored in an HttpOnly cookie.
- External integrations: Gemini AI and LinkedIn OAuth/publishing.

**Speaker Notes:** Walk through the data flow: the browser calls Flask APIs, Flask reads or writes MongoDB, and Socket.IO pushes live updates for chat and jobs.

---

# 5. Frontend Stack

- React 19: component-based UI.
- React Router: public and protected routes.
- Tailwind CSS: utility-first styling.
- Framer Motion: transitions and card animations.
- Recharts: dashboard charts.
- Lucide React: icons.
- Socket.IO client: realtime chat and job updates.
- jsPDF, html2canvas, html2pdf.js, react-to-print: resume export and print workflows.

**Speaker Notes:** Mention that the frontend is organized by role and feature. API calls are wrapped in service files such as jobService, chatService, forumService, and aiToolsService.

---

# 6. Backend Stack

- Flask: lightweight Python web framework.
- Flask-CORS: allows frontend requests with cookies.
- Flask-JWT-Extended: creates and verifies JWT tokens.
- Flask-SocketIO: realtime communication.
- PyMongo: MongoDB access.
- bcrypt: password hashing.
- python-dotenv: environment variable loading.

**Speaker Notes:** Explain that Flask blueprints separate features into route modules: auth, profile, admin, chat, mentorship, forum, jobs, LinkedIn, and AI tools.

---

# 7. MongoDB Database Design

- users: login credentials, role, verification status, and profile.
- conversations: participant metadata and moderation status.
- messages: chat messages linked to conversations.
- job_posts: internal and LinkedIn-oriented job records.
- job_applications: student application tracking.
- forum_posts: community posts with sentiment metadata.
- platform_settings: LinkedIn organization connection details.

**Speaker Notes:** MongoDB works well here because profiles, conversations, and job metadata are naturally document-shaped. User profile data is nested inside the user document.

---

# 8. Role-Based Access

- Student: mentorship, jobs, conversations, resume builder, forum, article writer, assistant.
- Alumni: profile, student list, conversations, job posting, LinkedIn-oriented job workflows.
- Admin: alumni approval, metrics, student/alumni lists, conversation moderation, job management.
- Frontend protection improves UX; backend checks provide actual security.

**Speaker Notes:** Emphasize that frontend route protection alone is not enough. The backend must check JWT identity and role before performing sensitive actions.

---

# 9. Authentication Flow

- User selects a role and submits login credentials.
- Backend validates email, password, and requested role.
- bcrypt compares the entered password with the stored password hash.
- Unverified alumni are blocked until admin approval.
- Backend creates a JWT access token.
- Token is stored in an HttpOnly browser cookie.
- Frontend calls /api/auth/me to restore the session after refresh.

**Speaker Notes:** This gives the app a session-like behavior while still using token-based auth. The browser automatically sends the cookie on API calls.

---

# 10. How JWT Works

- JWT means JSON Web Token.
- It has three parts: header, payload, and signature.
- Header describes the algorithm and token type.
- Payload stores claims such as user identity and role.
- Signature proves the token was created by the backend using the secret key.
- The backend verifies the signature before trusting the token.

**Speaker Notes:** A JWT is not encrypted by default; it is signed. That means the server can detect tampering. Sensitive data should not be placed inside the payload.

---

# 11. Access Token in This Project

- The backend creates an access token after successful login.
- Identity is the user's email.
- Role is added as a claim for role-based checks.
- Token expiry is configured for 2 hours.
- The token is stored in an HttpOnly cookie, not localStorage.
- HttpOnly helps prevent JavaScript from reading the token during XSS attacks.

**Speaker Notes:** Point to backend/src/app.py: JWT_TOKEN_LOCATION is cookies, JWT_COOKIE_HTTPONLY is true, and JWT_ACCESS_TOKEN_EXPIRES is 2 hours.

---

# 12. Refresh Token Concept

- A refresh token is a longer-lived token used to obtain new access tokens.
- Access tokens should be short-lived.
- Refresh tokens reduce how often users must log in.
- This project currently uses an access token cookie only.
- A production upgrade would add refresh tokens, token rotation, logout invalidation, and CSRF protection.

**Speaker Notes:** Be transparent: refresh tokens are important to explain, but they are not currently implemented in this codebase. Say this as an improvement area.

---

# 13. Cookie Security

- HttpOnly: JavaScript cannot read the cookie.
- SameSite=Lax: protects many cross-site request cases while allowing normal navigation.
- Secure=False locally: okay for localhost, should be True in HTTPS production.
- CSRF protection is currently disabled for development simplicity.
- Production should enable CSRF protection when using cookie-based JWT auth.

**Speaker Notes:** This slide shows awareness of security tradeoffs. It is useful in viva because you can explain both current behavior and recommended production hardening.

---

# 14. Registration Process

- Frontend sends full name, email, password, role, and profile fields.
- Backend checks if email already exists.
- Password is hashed with bcrypt.
- User document is formatted with role-specific profile fields.
- Student and admin accounts are verified immediately.
- Alumni accounts are created as unverified and require admin approval.

**Speaker Notes:** This process supports trust management. Alumni get access only after admin verification, which protects students from fake mentor accounts.

---

# 15. Profile System

- Each user has a nested profile object.
- Profile stores PRN/ID, graduation year, headline, bio, skills, career goals, mentorship topics, availability, location, company, and links.
- Profile update uses MongoDB nested field updates.
- Profile data powers mentorship matching, job scoring, resume defaults, and public profile views.

**Speaker Notes:** The profile is the central data source. Strong profile data improves matching and personalization across the platform.

---

# 16. Mentorship Matching

- Student requests mentor recommendations.
- Backend loads the student profile and verified alumni profiles.
- Local matching scores overlap in skills, career goals, mentorship topics, bio/headline terms, availability, and company information.
- Gemini can enhance ranking and match reasons when configured.
- If Gemini is unavailable, local fallback keeps the feature working.

**Speaker Notes:** This is a hybrid AI design: deterministic fallback plus optional AI enhancement. It is reliable for demos because it does not fully depend on an external API.

---

# 17. Mentorship Request Flow

- Student chooses a recommended mentor.
- Backend validates mentor ID and ensures the mentor is a verified alumni.
- Backend checks if a conversation already exists.
- If not, it creates a mentorship conversation.
- A system message announces the mentorship request.
- Student and alumni can continue in realtime chat.

**Speaker Notes:** This shows a connected workflow. Matching does not end at a recommendation card; it leads directly into communication.

---

# 18. Realtime Chat With Socket.IO

- Socket connection uses the JWT cookie to identify the user.
- Users join their personal room and conversation rooms.
- Messages are stored in MongoDB.
- Backend emits live events to conversation participants.
- Conversation metadata is updated with the latest message.
- Admin moderation can mute or close conversations.

**Speaker Notes:** Explain rooms: a room is a Socket.IO channel. It lets the server send updates only to relevant users instead of broadcasting to everyone.

---

# 19. Admin Governance

- Admin verifies pending alumni.
- Admin views student and alumni records.
- Admin dashboard shows platform metrics.
- Admin can inspect conversations.
- Admin can mark conversations active, flagged, muted, or closed.
- Moderation status affects backend chat behavior.

**Speaker Notes:** This is important because the admin is not just decorative. Admin actions affect platform trust and communication safety.

---

# 20. Job Portal

- Alumni and admins can post jobs.
- Students can browse jobs and open application links.
- Jobs have title, company, description, tags, location, publisher, source, and LinkedIn fields.
- Student job cards show personalized match score.
- Application count updates when students confirm they applied.
- Alumni and admins can delete jobs when needed.

**Speaker Notes:** Mention the recent delete feature: DELETE /api/jobs/<job_id> removes the job and associated saved application rows.

---

# 21. Job Matching and Applications

- Backend compares student profile skills with job tags.
- Career goals are checked against job tags.
- Each job receives a score and applied status.
- Student opens the external application link.
- Student confirms application inside the platform.
- Backend saves an application record and emits a realtime update.

**Speaker Notes:** This is a practical workflow because many applications happen on external company or LinkedIn pages. The platform tracks the student's action afterward.

---

# 22. LinkedIn Integration

- Admin connects an organization LinkedIn account using OAuth.
- Backend exchanges authorization code for a LinkedIn access token.
- Connection details are stored in platform settings.
- Job posts can be published to the organization page.
- Backend stores LinkedIn post URL, URN, and publish time.
- Socket event refreshes job cards after publishing.

**Speaker Notes:** OAuth flow: redirect user to LinkedIn, LinkedIn returns a code, backend exchanges code for token, token is used to call LinkedIn APIs.

---

# 23. Forum and Sentiment

- Authenticated users can create forum posts.
- Posts store author name, role, content, company, and timestamp.
- Rule-based sentiment checks positive and negative words.
- Posts can be flagged if negative score is high.
- Forum list returns community health metrics.
- Admin dashboard can use flagged forum counts for moderation visibility.

**Speaker Notes:** Be clear that this is a simple rule-based sentiment approach, not a deep NLP model. It is still useful for demonstrating moderation signals.

---

# 24. AI Resume Builder

- Student fills structured resume fields.
- Backend improves summary, skills, education, projects, certifications, and experience.
- Gemini can produce polished resume sections.
- Local fallback improves text when Gemini is not configured.
- Frontend supports templates, previews, section improvements, and PDF export.

**Speaker Notes:** This is a strong project feature because it has both backend AI logic and a rich frontend workflow. It supports repeated improvement attempts.

---

# 25. Article Writer and Assistant

- Article writer generates structured knowledge-sharing content.
- Audience can be students or alumni.
- Campus assistant gives guidance on mentorship, resumes, jobs, and platform usage.
- These tools add productivity support around the core networking features.

**Speaker Notes:** These are utility features. They make the platform feel like a career-readiness suite, not only a CRUD dashboard.

---

# 26. Service Layer Pattern

- Frontend services centralize API calls.
- Examples: jobService, mentorshipService, forumService, chatService, aiToolsService.
- Backend services centralize reusable logic.
- Examples: matching_service, gemini_service, sentiment_service, socket_service.
- This separation keeps components and controllers easier to maintain.

**Speaker Notes:** This is a good software engineering point for viva. Explain that UI components should not directly contain all HTTP or algorithm logic.

---

# 27. API and Blueprint Structure

- /api/auth: register, login, me, logout.
- /api/profile: profile update and profile fetch.
- /api/admin: approval, lists, metrics, moderation.
- /api/mentorship: recommendations and mentor request.
- /api/chat: conversations and messages.
- /api/jobs: job listing, create, delete, apply.
- /api/linkedin: OAuth status, connect, callback, publish job.
- /api/ai: resume, article, assistant tools.

**Speaker Notes:** Blueprints make the backend modular. Each domain has its own route file and controller file.

---

# 28. Data Flow Example: Login

- 1. User submits login form.
- 2. React calls backend auth API.
- 3. Flask validates credentials and role.
- 4. bcrypt verifies password hash.
- 5. Flask creates JWT access token.
- 6. Browser stores HttpOnly cookie.
- 7. AuthContext calls /api/auth/me to load current user.
- 8. ProtectedRoute allows role-specific dashboard access.

**Speaker Notes:** Use this as a process explanation slide. It shows frontend, backend, database, and token behavior together.

---

# 29. Data Flow Example: Mentor Request

- 1. Student opens mentorship page.
- 2. Frontend requests recommendations.
- 3. Backend ranks verified alumni.
- 4. Student clicks request mentor.
- 5. Backend creates or reuses conversation.
- 6. System message is inserted.
- 7. Student and alumni chat in realtime.

**Speaker Notes:** This explains why MongoDB collections are connected: users feed matching, matching feeds conversations, conversations feed messages.

---

# 30. Data Flow Example: Job Delete

- 1. Alumni or admin clicks trash button on a job card.
- 2. Frontend asks for confirmation.
- 3. Frontend sends DELETE /api/jobs/<job_id>.
- 4. Backend verifies JWT and role.
- 5. Backend deletes the job post.
- 6. Backend removes related job application records.
- 7. Backend emits jobs:deleted event.
- 8. Open job portals refresh automatically.

**Speaker Notes:** This slide can be used to show the recent maintenance feature and how frontend, backend, database, and sockets coordinate.

---

# 31. Environment and Configuration

- JWT_SECRET_KEY secures token signatures.
- MongoDB URI and database name configure persistence.
- Gemini API key enables AI enhancement.
- LinkedIn client ID, secret, redirect URI, and organization settings enable publishing.
- Frontend API base URL points to the Flask backend.
- Local development uses localhost ports 5173 and 5000.

**Speaker Notes:** Explain that secrets should stay in .env and should not be committed publicly. Production should move localhost origins to environment variables.

---

# 32. Security Considerations

- Passwords are hashed with bcrypt.
- JWT token is stored in HttpOnly cookie.
- Backend enforces role checks for protected actions.
- Alumni verification protects students from untrusted accounts.
- CSRF protection should be enabled before production deployment.
- Refresh tokens and token rotation would improve long-term sessions.
- Sensitive API keys must stay in environment variables.

**Speaker Notes:** This slide prepares you for security questions. Mention what is already implemented and what should be improved for production.

---

# 33. Testing and Validation

- Frontend build is verified with Vite.
- Manual workflow testing covers login, role navigation, job posting, mentor request, and chat.
- Recommended future tests: auth controller, job controller, mentorship matching, chat moderation, profile updates.
- Request validation schemas would make API behavior safer and clearer.

**Speaker Notes:** Be honest that a formal automated test suite is still a future improvement. That is normal for many academic projects but worth acknowledging.

---

# 34. Current Limitations

- Some dashboard metrics and charts are still presentation-oriented.
- Forgot/reset password screens need a complete backend token flow.
- Refresh token flow is not implemented yet.
- Some old or duplicate components remain in the codebase.
- Production deployment needs stronger environment configuration and security settings.

**Speaker Notes:** A good presentation should include limitations. It shows maturity and makes the project more credible.

---

# 35. Future Scope

- Add refresh token rotation and CSRF protection.
- Complete forgot/reset password with email token verification.
- Add analytics dashboards with live charts.
- Improve mentor recommendations with feedback loops.
- Add notification system for mentorship, jobs, and admin alerts.
- Add automated tests and deployment pipeline.
- Enhance sentiment analysis with a stronger NLP model.

**Speaker Notes:** Future scope should sound practical. These are extensions of the existing architecture rather than unrelated features.

---

# 36. Conclusion

- Alumni Connect solves a real campus career-readiness problem.
- It demonstrates full-stack development with React, Flask, MongoDB, JWT, Socket.IO, AI tools, and LinkedIn integration.
- The platform supports students, alumni, and admins with role-specific workflows.
- Core strengths are mentorship matching, realtime chat, job workflows, admin governance, and AI-assisted productivity.

**Speaker Notes:** End by connecting the technical implementation back to the social impact: better alumni engagement and better student career preparation.