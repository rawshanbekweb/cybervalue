export type LessonType =
  | "flow"
  | "order"
  | "classify"
  | "match"
  | "frontend"
  | "auth"
  | "request"
  | "status"
  | "validate"
  | "jwt"
  | "cookies"
  | "database"
  | "sqlcrud"
  | "sql"
  | "xss"
  | "idor"
  | "surface"
  | "investigate"
  | "tasks"
  | "quiz"
  | "checkout"
  | "finalquiz"
  | "worksheet"
  | "teachback";

export interface Lesson {
  id: number;
  title: string;
  type: LessonType;
  minutes: number;
  heading: string;
  intro: string;
  task: string;
  mission: string;
  result: string;
  principle: string;
  theory: string[];
  teacher: string;
  question: string;
  real?: boolean;
  db?: boolean;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint?: string;
  body?: Record<string, unknown>;
  mode?: "vulnerable" | "safe";
}

export interface LessonGroup {
  title: string;
  from: number;
  to: number;
}

export interface QuizQuestion {
  q: string;
  a: string[];
  correct: number;
  why: string;
}

export const GROUPS: LessonGroup[] = [
  { title: "01 · Foundations & Architecture", from: 1, to: 6 },
  { title: "02 · HTTP & APIs", from: 7, to: 14 },
  { title: "03 · Backend & Identity", from: 15, to: 19 },
  { title: "04 · Database & Vulnerabilities", from: 20, to: 26 },
  { title: "05 · Analysis & Hardening", from: 27, to: 36 },
];

export const LESSONS: Lesson[] = [
  {
    id: 1,
    title: "The goal of this course",
    type: "flow",
    minutes: 3,
    heading: "The journey of a single request",
    intro:
      "Starting from the “Open profile” button, trace the data's entire path. See which layer is doing the work at each step.",
    task: "Trace the request path",
    mission:
      "Start the animation. Identify where the data is displayed, where it's checked, and where it's stored.",
    result: "You'll be able to explain the browser → backend → database → backend → browser flow.",
    principle: "The frontend displays. The backend decides. The database stores.",
    theory: [
      "A web application exchanges data between the user and a server. This course teaches that flow through 36 short exercises.",
      "By the end, you'll be able to read a request and response, tell authentication and authorization apart, and explain the root cause of SQLi, XSS, and IDOR.",
    ],
    teacher:
      "Before starting, ask: “What happens after the login button is clicked?” Return to that question at the end of the lesson.",
    question: "What's the difference between displaying data and authorizing access to it?",
  },
  {
    id: 2,
    title: "Getting started",
    type: "order",
    minutes: 3,
    heading: "Build the chain yourself",
    intro: "Click the cards below to arrange the profile-fetching flow in the correct order.",
    task: "A 7-step flow",
    mission:
      "Build the chain from the browser all the way to the response coming back. If you get it wrong, start over.",
    result: "You'll see that the request and response are two directions on the same path.",
    principle: "First find the data's path, then analyze the trust boundary.",
    theory: [
      "The frontend usually runs inside the browser; the two aren't separate servers. The browser can send an HTTP request using frontend code.",
      "An API is the interface for talking to a backend. Not every request has to touch a database.",
    ],
    teacher: "Split students into pairs. One describes the request path, the other the response path.",
    question: "Can you give an example of a request that doesn't need a database?",
  },
  {
    id: 3,
    title: "What is a web application?",
    type: "classify",
    minutes: 3,
    heading: "A page, or an application?",
    intro: "Classify each scenario. Look at what the user is actually doing, not what it's called.",
    task: "Classify 3 scenarios",
    mission: "Find the difference between static content and an interactive exchange with the server.",
    result: "You'll understand that you can't identify a web application by appearance alone.",
    principle: "Even a static site can use JavaScript; the line between a “website” and a “web app” isn't strict.",
    theory: [
      "A web application is software used through a browser. Most have a backend, an API, a data store, and business logic.",
      "Login, commenting, placing an order, and editing a profile are typical actions that send data to a server. Some web apps, though, run entirely on the client.",
    ],
    teacher: "Compare an online store's product page with its checkout page.",
    question: "Can a calculator that only runs in the browser still be an application?",
  },
  {
    id: 4,
    title: "The three core parts",
    type: "match",
    minutes: 3,
    heading: "Whose job is it?",
    intro: "Pick the matching layer for each responsibility and check your answer.",
    task: "Assign the responsibilities",
    mission: "Determine where design, permission checks, and data storage each belong.",
    result: "You won't confuse the responsibilities of the frontend, backend, and database.",
    principle: "The authorization decision must never live in an environment the user controls.",
    theory: [
      "The frontend renders the interface and interacts with the user. The backend checks input, identity, permissions, and runs business logic. The database stores data and executes queries.",
      "This is a conceptual architecture — real applications can also involve caches, CDNs, queues, and external services.",
    ],
    teacher: "Have one student play the frontend, one the backend, one the database; pass a “request” between them on paper.",
    question: "Which layer should have the final say in calculating the price?",
  },
  {
    id: 5,
    title: "Frontend",
    type: "frontend",
    minutes: 4,
    heading: "See HTML, CSS, and JavaScript at work",
    intro:
      "Change the HTML text, the CSS color, and a JavaScript interaction. Watch the result update immediately alongside it.",
    task: "A small login interface",
    mission:
      "Swap the heading, change the color, and click the button. Notice that none of this actually logs in to a server.",
    result: "The difference between structure, design, and interaction becomes visible.",
    principle: "What's shown and stored in the browser is under the user's control.",
    theory: [
      "HTML defines structure, CSS defines appearance, and JavaScript defines interactive behavior.",
      'A password input\'s type="password" only hides the characters on screen — it\'s no substitute for transport encryption or server-side password hashing.',
    ],
    teacher: "Change the heading through DevTools → Elements. Then reload the page.",
    question: "Does changing a button's text to “Admin” actually grant you admin rights?",
  },
  {
    id: 6,
    title: "Hiding isn't protecting",
    type: "auth",
    minutes: 5,
    heading: "Expose the admin button",
    intro:
      "Log in as Ali. Reveal the admin button on the frontend and call the real /api/admin endpoint.",
    task: "Compare the UI and the actual permission",
    mission: "Notice the server still returns 403 even though the button is visible. Then log in as admin and compare.",
    result: "You'll see that a frontend check is no substitute for backend authorization.",
    principle: "Hiding the admin panel is a UX choice; the permission check on the server is the actual protection.",
    theory: [
      'if (user.role === "admin") showAdminPanel() only changes UI state. The API can be called directly, without ever going through the UI.',
      "The backend must check identity and the relevant permission on every protected endpoint.",
    ],
    teacher: "After revealing the button, ask the student to predict the response status.",
    question: "If the button is hidden but the API is wide open, where's the actual problem?",
  },
  {
    id: 7,
    title: "HTTP — the communication bridge",
    type: "flow",
    real: true,
    minutes: 4,
    heading: "Send a request, watch it travel",
    intro:
      "A real request is sent to /api/echo. The animation walks through the exchange between browser and backend step by step.",
    task: "Trace both directions",
    mission: "Open DevTools → Network, send the request, and find the echo call.",
    result: "You'll connect the animated explanation to a real HTTP entry.",
    principle: "HTTPS protects data in transit — it doesn't fix a broken authorization check on the server.",
    theory: [
      "HTTP is the protocol client requests and server responses are exchanged over. HTTPS is HTTP secured with TLS.",
      "This lab runs over loopback HTTP. Real login and session traffic on the internet needs HTTPS. The echo endpoint doesn't touch a database.",
    ],
    teacher: "Open a single request in Network and point out its request URL and response status.",
    question: "Can IDOR still happen even when HTTPS is used?",
  },
  {
    id: 8,
    title: "HTTP Request",
    type: "request",
    minutes: 5,
    method: "POST",
    endpoint: "/api/lab/echo",
    body: { username: "ali", action: "view_profile" },
    heading: "Build your own request",
    intro:
      "Change the method, endpoint, header, and JSON body. The backend echoes back exactly what it received.",
    task: "Find the 4 parts of a request",
    mission: "Change the X-Lesson header and the username inside the body. Find both of them in the response.",
    result: "You'll be able to read the method, URL, headers, and body separately.",
    principle: "URL, headers, cookies, and body are all data coming from the client.",
    theory: [
      "A request consists of a method, a URL, and headers; some methods also carry a body. Headers carry metadata — Content-Type, for example, describes the body's format.",
      "A JSON body is separated from the headers by a blank line. In this panel, GET doesn't send a body — put GET parameters in the URL instead.",
    ],
    teacher:
      "Add an extra field to the body. Then break the JSON with a stray comma and compare the client's error to the server's 400 response.",
    question: "Do Content-Type and Authorization serve the same purpose?",
  },
  {
    id: 9,
    title: "HTTP Methods",
    type: "request",
    minutes: 7,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: { title: "A new learning post" },
    heading: "One resource, five methods",
    intro: "First log in as Ali. Then use the ready-made examples to fetch, create, update, and delete a post.",
    task: "Run through a CRUD cycle",
    mission: "Take the id from the POST response; put that same id into the PUT, PATCH, and DELETE URLs. Verify with GET at the end.",
    result: "You'll see the outcome of GET → POST → PUT/PATCH → DELETE.",
    principle: "The method name by itself isn't a safeguard. GET should never be used for an action that changes server state.",
    theory: [
      "GET fetches a resource. POST can create a new resource or trigger an action. PUT replaces a resource's writable representation; PATCH updates it partially. DELETE removes it.",
      "This post model's only writable field is title; id and owner_id are managed by the server. That's why PUT and PATCH return similar results in this example.",
    ],
    teacher: "Find the Location header in the 201 response. After DELETE, send a GET to that same id.",
    question: "Does POST always create new data?",
  },
  {
    id: 10,
    title: "HTTP Response",
    type: "request",
    minutes: 4,
    method: "GET",
    endpoint: "/api/lab/profile",
    body: {},
    heading: "Split the response into three parts",
    intro: "First send a request to /api/profile without logging in. Then log in as Ali and send it again.",
    task: "Status, headers, and body",
    mission: "Open all three tabs in the response panel. Compare the 401 and 200 responses.",
    result: "You'll understand that a response isn't just JSON.",
    principle: "Status carries the overall outcome, headers carry metadata, and the body carries the content.",
    theory: [
      "An HTTP response consists of a status, headers, and an optional body. That body can be JSON, HTML, an image, or empty.",
      "The browser's fetch still returns a response object for HTTP 4xx/5xx replies — you have to check status or response.ok yourself.",
    ],
    teacher: "Have students find the Content-Type and X-Lab-Mode headers in the response.",
    question: "Can a 401 response still carry a JSON body?",
  },
  {
    id: 11,
    title: "HTTP Status Codes",
    type: "status",
    minutes: 4,
    heading: "Which response does the server send back?",
    intro:
      "Pick a status and get a real response. Choosing 301/302 makes the browser follow the redirect — you'll see the chain in Network.",
    task: "Learn the status code families",
    mission: "Trigger 200, 400, 401, 403, 404, and 500. Then trigger 302 and watch the redirect.",
    result: "You'll be able to explain the difference between 2xx, 3xx, 4xx, and 5xx.",
    principle: "A status code is a signal; the actual security decision is made in the server's logic.",
    theory: [
      "1xx is informational, 2xx is success, 3xx is a redirect, 4xx is a client-side error, and 5xx is a server error.",
      "This panel triggers these statuses on purpose. The 500, for example, isn't a real server failure — it's a teaching example. 1xx isn't sent here as a final response.",
    ],
    teacher: "Before revealing the result, have students guess the status family first.",
    question: "When a login is required, should the response be 401 or 500?",
  },
  {
    id: 12,
    title: "The difference between 401 and 403",
    type: "auth",
    minutes: 5,
    heading: "Guest → user → admin",
    intro: "Send a request to /api/admin in three states: logged out, logged in as Ali, and logged in as admin.",
    task: "Trigger 401 / 403 / 200",
    mission: "Log out and call the admin API. Then repeat as Ali, then as admin.",
    result: "You'll see the same endpoint return a different response depending on identity.",
    principle: "401 means valid credentials are missing. 403 means the server refused to perform the action.",
    theory: [
      "401 signals that valid authentication credentials are missing; it usually comes with a WWW-Authenticate header.",
      "403 means the server understood the request but refused to carry it out. Usually a permission is missing — though that doesn't always mean the user is logged in at all. Some systems return 404 instead, to avoid revealing that a resource exists.",
    ],
    teacher: "Build a table: guest → 401; ali → 403; admin → 200. Point out that this is exactly this endpoint's policy.",
    question: "Why is 401 — despite being named “Unauthorized” — actually about authentication?",
  },
  {
    id: 13,
    title: "Browser DevTools",
    type: "request",
    minutes: 5,
    method: "POST",
    endpoint: "/api/lab/echo?lesson=13",
    body: { message: "Find me through Network" },
    heading: "Network detective",
    intro: "F12 → Network → Fetch/XHR. Send the request and open the echo?lesson=13 entry.",
    task: "Find 7 pieces of evidence",
    mission:
      "Inspect the method, URL, headers, payload, status, response, and cookies sections. Write down what you find in your personal notes.",
    result: "You'll connect what the interface shows to what's actually visible on the wire.",
    principle: "The UI can hide data; but whatever response the browser received has already reached the user.",
    theory: [
      "The Network tab shows requests and responses. A reload or an action triggers a request. Preserve log is useful for tracking redirects.",
      "An HttpOnly cookie isn't exposed to JavaScript, but its owner can still see it in DevTools. Set-Cookie isn't a regular response header that fetch can read.",
    ],
    teacher: "Type “echo” into the filter. Show students not to mix up the Request Payload and Response tabs.",
    question: "If a hidden field comes back in the response, does simply not rendering it on the frontend count as protection?",
  },
  {
    id: 14,
    title: "What is an API?",
    type: "request",
    minutes: 4,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: {},
    heading: "An interface behind the interface",
    intro:
      "Call the posts API and the protected profile API. Change the URL and compare the results.",
    task: "Open and closed endpoints",
    mission: "Send GET requests to /api/posts, /api/profile, and /api/not-found.",
    result: "You'll separate an endpoint's existence from having permission to access it.",
    principle: "Every endpoint counts as an entry point that has to be checked.",
    theory: [
      "An API is a defined interface for talking to an application. A web API usually works through HTTP endpoints.",
      "An API doesn't have to be a separate server — in this project, a single backend handles all the /api/* paths.",
    ],
    teacher: "Show that you can interact with the API through this panel even with no UI at all.",
    question: "Does knowing an API endpoint exists grant you permission to its data?",
  },
  {
    id: 15,
    title: "Backend",
    type: "validate",
    minutes: 4,
    heading: "Bypass the frontend, test the server",
    intro: "Send an age value straight through JSON. See that browser input constraints can't substitute for the backend.",
    task: "Input validation",
    mission: 'Send the values 25, -5, and "twenty". Compare the server\'s status and error message each time.',
    result: "You'll see invalid input get rejected on the backend.",
    principle: "Unvalidated input must never reach business logic or the database.",
    theory: [
      "The backend accepts the request, validates input, applies authentication and authorization, runs business logic, and sends a response.",
      "Validation checks the shape and range of input. Authorization checks who's allowed to do what — the two are separate controls.",
    ],
    teacher: 'Show that even with type="number", you can send a plain string directly through JSON.',
    question: "Does the age being in the right format mean the profile update is authorized?",
  },
  {
    id: 16,
    title: "Authentication",
    type: "auth",
    minutes: 5,
    heading: "How does the backend recognize you?",
    intro: "Log in with the wrong password, then the right one. Watch the login response and the profile request that follows.",
    task: "The login cycle",
    mission: "Log in with ali / wrong-password, then with ali / ali123. Confirm your identity via /api/profile.",
    result: "You'll see credentials get checked and a session get created.",
    principle: "Passwords must never be stored as reversible plain text.",
    theory: [
      "Authentication verifies who a user is. This lab compares the password against a PBKDF2 hash and issues both a short-lived cookie session and a JWT.",
      "These demo credentials are public knowledge. A production system also needs a unique salt, properly tuned password-hashing parameters, MFA, and solid rate limiting. The limit in this lab only applies within a single browser lab session.",
    ],
    teacher: "Fail the login 5 times to trigger a 429. Explain what the 30-second Retry-After means.",
    question: "Does a successful login unlock access to every resource?",
  },
  {
    id: 17,
    title: "Authorization",
    type: "auth",
    minutes: 5,
    heading: "Same action, different permission",
    intro: "Call the profile and admin endpoints using both the Ali and admin accounts.",
    task: "Verify the permission table",
    mission: "Write down the results for Ali → profile, Ali → admin, and admin → admin.",
    result: "You'll separate identity verification from permission checking.",
    principle: "Permissions are checked on every single request, and where needed, at the exact object level.",
    theory: [
      "Authorization checks which actions a user can perform on which resource. A role-based check alone isn't enough for resources that also require an ownership check.",
      "For example, an admin can view every profile, while a regular user can only view their own. The policy is defined by the application's requirements.",
    ],
    teacher: "Draw two columns labeled “Who?” and “What's allowed?”",
    question: "Is simply having the “user” role enough to open another user's private profile?",
  },
  {
    id: 18,
    title: "JWT",
    type: "jwt",
    minutes: 6,
    heading: "Read the token, then verify it",
    intro:
      "Log in to get a real, signed JWT. Read its payload, then change a single character in the token and send it to the server.",
    task: "Decode ≠ verify",
    mission: "Get a 200 with the original token, and a 401 with the tampered one. Find exp and sub inside the payload.",
    result: "You'll see the difference between a readable payload and a verified signature.",
    principle: "JWT is a token format; a cookie is the browser's storage/transport mechanism. A JWT can also be stored inside a cookie.",
    theory: [
      "This lab uses an HS256-signed JWT: header.payload.signature. The header and payload are base64url-encoded — that's encoding, not encryption. JWTs can also take other forms, including encrypted ones.",
      "The server checks the algorithm, the signature, exp, issuer, and audience. The token proves identity; resource authorization is still checked separately. Logout ends the cookie session, but a JWT already issued stays valid until it expires.",
    ],
    teacher:
      "Explain that simply writing a role into the payload doesn't actually grant that permission. Our server reads the role from its own account data instead.",
    question: "Does base64url-decoding a token count as verifying its signature?",
  },
  {
    id: 19,
    title: "Cookie",
    type: "cookies",
    minutes: 5,
    heading: "The browser sends the session on its own",
    intro:
      "Log in and send a profile request. Even without an Authorization header, identity gets resolved through the cookie.",
    task: "Inspect the cookie flags",
    mission:
      "Open DevTools → Application → Cookies and Network → login → Headers. Find HttpOnly, SameSite, and Max-Age.",
    result: "You'll see the Set-Cookie and Cookie headers travel in opposite directions.",
    principle: "HttpOnly doesn't eliminate XSS. And SameSite doesn't fully substitute for CSRF protection in every case.",
    theory: [
      "The server issues a cookie via Set-Cookie. The browser automatically resends it in the Cookie header whenever the domain, path, SameSite, and other rules match.",
      "HttpOnly blocks reading the cookie through JavaScript. Secure requires it to be sent only over HTTPS (browsers may make an exception for localhost). This HTTP lab doesn't set Secure. SameSite restricts when the cookie is sent on cross-site requests.",
    ],
    teacher: "Compare how the session is invisible in document.cookie yet still gets sent in Network.",
    question: "Do cookies and JWTs have to be mutually exclusive?",
  },
  {
    id: 20,
    title: "Database",
    type: "database",
    minutes: 3,
    heading: "Look at the data table",
    intro: "Fetch the ephemeral SQLite users table through the backend. Tell rows and columns apart.",
    task: "Read the schema",
    mission: "Find Ali's id, role, and email fields. Notice which endpoint returned this data.",
    result: "You'll see the browser is sending HTTP, not SQL.",
    principle: "Database credentials are never handed to the frontend; access to the data is controlled on the backend.",
    theory: [
      "A database stores data and organizes how it's retrieved. Relational databases work with tables, rows, columns, and relationships.",
      "MySQL, PostgreSQL, and SQLite are relational databases. MongoDB uses a different, document-based model. This demo table is recreated in a fresh, ephemeral SQLite instance on every read.",
    ],
    teacher: "Connect the SQL column name to the JSON key and to the table header shown in the UI.",
    question: "Do all databases use SQL?",
  },
  {
    id: 21,
    title: "SQL",
    type: "sqlcrud",
    minutes: 5,
    heading: "SELECT, INSERT, UPDATE, DELETE",
    intro: "Pick an operation. The backend runs it against a fresh SQLite instance and returns “before / after” tables.",
    task: "Run all four operations",
    mission: "Spot the new row after INSERT, the changed username after UPDATE, and the missing row after DELETE.",
    result: "You'll see exactly what SQL does to the data.",
    principle: "In UPDATE and DELETE, the WHERE clause decides which rows are affected.",
    theory: [
      "SELECT retrieves data, INSERT adds it, UPDATE modifies it, and DELETE removes it. WHERE defines the condition.",
      "Each button runs against a brand-new fixture database, so these operations don't persist between clicks. The posts in the HTTP Methods lesson, by contrast, persist for the whole lab session.",
    ],
    teacher: "Explain conceptually what happens if a DELETE has no WHERE clause.",
    question: "SELECT and DELETE can share the same WHERE condition — so what's actually different between them?",
  },
  {
    id: 22,
    title: "Backend and Database",
    type: "flow",
    real: true,
    db: true,
    minutes: 4,
    heading: "Where does HTTP turn into SQL?",
    intro:
      "Send a request. The backend reads from a SQLite table and returns JSON; the animation shows every boundary along the way.",
    task: "Two different protocols",
    mission: "Find /api/database in Network. Explain that the browser never opens a SQL connection itself.",
    result: "You'll separate the HTTP exchange from the backend's SQL query.",
    principle: "The backend is the control point that governs access to the database.",
    theory: [
      "A typical architecture flows browser → HTTP → backend → SQL → database. The backend turns the result into JSON or HTML.",
      "Even browser SDKs that look like they talk to a database directly usually still go through a managed API and an access policy.",
    ],
    teacher: "Show that a SELECT on the server and a GET in the browser operate at entirely different levels.",
    question: "Is the JSON that reaches the browser literally the original SQL query?",
  },
  {
    id: 23,
    title: "SQL Injection",
    type: "sql",
    mode: "vulnerable",
    minutes: 6,
    heading: "When input bleeds into the query",
    intro: "Try a normal username and then the pre-built lab payload. Compare the query's structure and how many rows come back.",
    task: "See the root cause",
    mission: "Send “ali” in vulnerable mode, then the pre-built payload. Then resend the same payload in safe mode.",
    result: "You'll understand how a value can turn into query structure.",
    principle: "SQLi isn't a “database disease” — it's the consequence of building a query unsafely.",
    theory: [
      "When user input gets interpolated straight into SQL text, that data can bleed into the query's syntax. This lab only ever runs a SELECT against a synthetic table.",
      "The real impact depends on the query and the database's permissions. Exposing raw error text in a production response can also leak information.",
    ],
    teacher: "Read out the closing quote and the leftover condition in the query separately, even without syntax highlighting.",
    question: "Why isn't input validation by itself the primary safeguard against SQLi?",
  },
  {
    id: 24,
    title: "Defending against SQL Injection",
    type: "sql",
    mode: "safe",
    minutes: 5,
    heading: "Separate the SQL from the value",
    intro: "In a prepared query, the ? placeholder and the parameters travel separately. Compare the same input in both modes.",
    task: "Parameterized query",
    mission: "Explain why the pre-built payload returns 0 rows in safe mode; then get 1 row back with “ali”.",
    result: "You'll see the query's structure never changes.",
    principle: "Even inside an ORM, unsafe raw SQL can still cause SQLi.",
    theory: [
      "A parameterized query keeps the query's structure separate from its values. This SQLite example uses db.execute(sql, (username,)).",
      "Parameters are meant for values — table or column names can't be substituted through a parameter. When a dynamic identifier is genuinely needed, it's picked from an allow-list instead.",
    ],
    teacher: "Show that the query stays identical while only the parameters field changes.",
    question: "If you're already using an ORM, does it matter how you write raw SQL?",
  },
  {
    id: 25,
    title: "XSS",
    type: "xss",
    minutes: 7,
    heading: "Is it text, or is it executable content?",
    intro:
      "Compare a single input rendered safely as text versus rendered unsafely as HTML. Try each of the three XSS flow types separately.",
    task: "Trace the source → sink path",
    mission:
      "Paste in the pre-built, harmless payload. Try the DOM, reflected, and stored flows; only observe the result inside the sandboxed window.",
    result: "You'll understand that stored/reflected describe the data flow, while DOM-based describes a dangerous sink in the browser.",
    principle: "In an HTML context, use textContent and escaping; when HTML output is genuinely needed, use proper sanitization. CSP is an extra layer, not a replacement.",
    theory: [
      "XSS happens when attacker-controlled content gets executed as script. Stored content is saved first; reflected content bounces straight from a request into a response; DOM-based happens when client-side JavaScript feeds it into a dangerous DOM sink. These categories can overlap.",
      "This exercise runs inside a sandboxed iframe with no origin privileges of its own. The main interface renders results via textContent. Plain escaping isn't identical across every context.",
    ],
    teacher: "Have students spot the trust mistake between storing a payload as “just a comment” and later rendering it as HTML.",
    question: "In stored XSS, does the malicious text execute as script the moment it's saved to the database?",
  },
  {
    id: 26,
    title: "IDOR / Broken Access Control",
    type: "idor",
    minutes: 6,
    heading: "15 is yours. What about 16?",
    intro:
      "Log in as Ali. Change the profile ID and compare the mode with object-level authorization on versus off.",
    task: "Check the object-level permission",
    mission: "As Ali, get a 200 for 15 and a 403 for 16. Then watch 16 come back in vulnerable mode.",
    result: "You'll understand that another ID existing doesn't mean you have permission to view it.",
    principle: "A random UUID makes guessing harder, but it's no substitute for an authorization check.",
    theory: [
      "IDOR happens when access based on a user-controlled object ID isn't properly authorized. It's one form of Broken Access Control.",
      "Viewing a genuinely public profile isn't itself a flaw — the problem is when it violates the actual privacy and permission policy. In this lab, profile data should only be accessible to its owner or an admin.",
    ],
    teacher: "Discuss the difference between hiding a user ID and actually checking ownership on the server.",
    question: "Is it enough for the server to only ask “is this user logged in?”",
  },
  {
    id: 27,
    title: "Attack Surface",
    type: "surface",
    minutes: 5,
    heading: "Mapping the trust boundaries",
    intro: "Pick an entry point. See the input's path, the likely problem, and the main defense.",
    task: "Analyze 4 entry points",
    mission:
      "Open Comment, Resource ID, Login, and Search. For each one, walk through the chain “input → where it's used → defense”.",
    result: "You'll see a vulnerability across its whole flow, instead of pinning it to a single layer.",
    principle: "XSS can come from server-side rendering, SQLi from how the backend builds a query — always trace the full flow.",
    theory: [
      "The attack surface is the sum of every entry point and boundary that can influence a system: URLs, JSON, headers, uploads, cookies, and external integrations all count.",
      "Vulnerabilities don't sort neatly into layers. The problem usually shows up when one layer's output gets misinterpreted by the next.",
    ],
    teacher: "Have students build a new chain for an upload endpoint: type, size, storage, rendering.",
    question: "Does an endpoint that's locked down to admins still count as part of the attack surface?",
  },
  {
    id: 28,
    title: "How does a researcher think?",
    type: "investigate",
    minutes: 4,
    heading: "From a feature to a trust question",
    intro: "Pick an application feature and find the most useful question to investigate it with.",
    task: "Ask the right question",
    mission: "Work through the login, comment, and checkout scenarios. Explain which server-side check each question points to.",
    result: "You'll move from asking “does it work?” to asking “for whom, and under what condition?”",
    principle: "In security analysis, authorization, scope, and using synthetic test data are all made explicit.",
    theory: [
      "A security researcher traces a data's source, its transformations, its sink, and the permission conditions around it. Accepting input isn't itself a mistake — what matters is how it's used afterward.",
      "Verify every assumption against request/response evidence. The experiments in this course only apply to this local learning environment.",
    ],
    teacher: "Give each group a single feature; have them come up with at least one authentication, one authorization, and one data-handling question.",
    question: "What goes wrong if checkout trusts the price sent by the client?",
  },
  {
    id: 29,
    title: "Auditing a mini social network",
    type: "request",
    minutes: 8,
    method: "GET",
    endpoint: "/api/lab/posts",
    body: {},
    heading: "A small application audit",
    intro: "Audit a single local application's login, profile, posts, comments, and admin endpoints.",
    task: "Build an endpoint map",
    mission:
      "List which endpoints are open, which require login, and which require admin. Back every conclusion with a status code as evidence.",
    result: "You'll connect the previously isolated examples into one application's flow.",
    principle: "Every field an API returns is data that's now exposed to that user.",
    theory: [
      "This mini application has login, profile, users/:id, posts, comments, and admin endpoints. Registration and file upload are outside this lab's scope.",
      "Posts and comments live in server memory scoped to your browser. The user directory is a synthetic SQLite fixture — passwords and sessions never appear in it.",
    ],
    teacher: "Have students write up findings in columns: “endpoint, method, identity, status, conclusion”.",
    question: "Is a 200 response by itself proof of a vulnerability?",
  },
  {
    id: 30,
    title: "Hands-on workshop",
    type: "tasks",
    minutes: 12,
    heading: "Four independent missions",
    intro: "Complete the exercises below. Each one leads back to its related lesson — write your findings down in your notes.",
    task: "Gather evidence",
    mission: "Write down one finding each for Network, API, access control, and data flow.",
    result: "You'll end up with a short report made of method, endpoint, status, and a note.",
    principle: "Observation → hypothesis → authorized test → evidence → conclusion.",
    theory: [
      "These exercises only use this localhost environment. Tie every finding back to a specific request and response.",
      "For more advanced practice, an instructor can set up a dedicated lab like OWASP Juice Shop separately. This project provides its own small-scale lab.",
    ],
    teacher: "10 minutes of work, 2 minutes to report back in pairs. Push for concrete evidence when asking “what did you observe?”",
    question: "How could another student independently verify your conclusion?",
  },
  {
    id: 31,
    title: "Questions and answers",
    type: "quiz",
    minutes: 7,
    heading: "Test your knowledge",
    intro: "10 questions. After you pick an answer, read the explanation. Your score is saved in this browser.",
    task: "Reinforce 10 concepts",
    mission: "Answer the questions. If you miss one, go back to that topic and redo the exercise.",
    result: "You'll assess yourself on frontend, auth, SQLi, XSS, and IDOR.",
    principle: "Explaining the cause and the defense matters more than memorizing terminology.",
    theory: [
      "This check focuses on your core mental model and trust decisions. The score reflects your current understanding.",
      "Read the explanation after each answer. A wrong answer points you toward what to practice next.",
    ],
    teacher: "Before revealing the answer, ask the student “why?”",
    question: "Which concept was hardest for you to explain with an example?",
  },
  {
    id: 32,
    title: "The core mental model",
    type: "match",
    minutes: 4,
    heading: "Who answers which question?",
    intro: "Match each layer to its question. Then walk through a single login example to explain it.",
    task: "Reinforce the model",
    mission: "Place the questions “What do I show?”, “What's allowed?”, and “Where is it stored?”",
    result: "You'll be able to explain the architecture briefly and precisely.",
    principle: "Security's central question is: who trusts what, and on what evidence?",
    theory: [
      "Frontend handles display and interaction; HTTP handles communication; API is the interface; backend handles business logic and permissions; database handles storage.",
      "Authentication checks identity; authorization checks permission for a resource and action. Neither control substitutes for the other.",
    ],
    teacher: "Clear the board and have students draw the diagram from memory.",
    question: "At which boundary does user-controlled data actually enter the server?",
  },
  {
    id: 33,
    title: "Never trust user input",
    type: "checkout",
    minutes: 5,
    heading: "Send the price as 1",
    intro: "Change the client-side price and quantity. Watch the backend pull the real price from its own catalog instead.",
    task: "Test the business logic",
    mission: "Send price=1, then quantity=-2. Get the correct total the first time, and a 400 response the second.",
    result: "You'll see input shape and business rules get validated separately.",
    principle: "“Don't trust” doesn't mean reject all input — it means checking every value against what it's actually meant to do.",
    theory: [
      "URLs, headers, cookies, JSON, files, and frontend state can all be under the client's control. Be explicit about exactly how much trust each field deserves.",
      "Validation, authentication, authorization, proper output encoding, and safe database access all complement each other. Sensitive values like price and role are always sourced from the server.",
    ],
    teacher: "Discuss how a price can be formatted correctly and still be wrong.",
    question: "price=1 is a perfectly valid number. So why doesn't the backend calculate from it?",
  },
  {
    id: 34,
    title: "Course wrap-up",
    type: "finalquiz",
    minutes: 4,
    heading: "Vulnerability → root cause → defense",
    intro: "Pick the right defense for three scenarios. Explain each using the application's flow.",
    task: "Match 3 defenses",
    mission: "Find the primary defense that matches each of the SQLi, XSS, and IDOR examples.",
    result: "You'll be able to move from a vulnerability's name to its concrete control.",
    principle: "A defense has to eliminate the actual trust mistake that let the vulnerability occur.",
    theory: [
      "For SQLi, the query and its values are kept separate. For XSS, context-appropriate safe rendering is used. For IDOR, permission is checked on every single object.",
      "These measures are only part of a complete security program — transport, session, dependency, monitoring, and business-logic controls all matter too.",
    ],
    teacher: "For each defense, ask “why this one specifically?”",
    question: "Does a parameterized query also fix IDOR?",
  },
  {
    id: 35,
    title: "Take-home assignment",
    type: "worksheet",
    minutes: 10,
    heading: "Write your own architecture report",
    intro: "Pick an authorized lab and fill out the form. You can download it as a Markdown file.",
    task: "Write a mini analysis",
    mission:
      "Write up the frontend, backend, API, database, auth, request, response, and attack surface. Mark anything you're unsure of as an assumption.",
    result: "You'll end up with a personal report backed by verifiable evidence.",
    principle: "Never write down a backend technology you can't actually see from the browser as fact — mark it unknown instead.",
    theory: [
      "A good report covers scope and authorization, the observed architecture, request/response evidence, and potential risks.",
      "A “potential attack surface” isn't the same as a confirmed vulnerability. Without evidence, write down the assumption and the next question to investigate.",
    ],
    teacher: "Grading: 3 points for the flow, 2 for the auth distinction, 3 for HTTP evidence, 2 for risk and defense.",
    question: "Does your report clearly separate observed fact from assumption?",
  },
  {
    id: 36,
    title: "Wrap-up: teach it back",
    type: "teachback",
    minutes: 5,
    heading: "Explain it in 60 seconds",
    intro: "Start the timer and explain the web application flow out loud. Grade yourself against the checklist.",
    task: "Teach it to someone else",
    mission: "Explain the flow from browser to database, both auth concepts, and the root cause of one vulnerability.",
    result: "You'll be able to explain the mental model, not just recite terms.",
    principle: "The application flow comes first. The vulnerability inside that flow comes second.",
    theory: [
      "The most important outcome of this course is a durable mental model of data flow and trust boundaries.",
      "Future lessons can go deeper into SQLi, XSS, access control, sessions, and other topics — all built on top of this same model.",
    ],
    teacher: "Take the final teach-back either written or spoken. Return to the opening question: “What happens after the login button is clicked?”",
    question: "Which part of the flow is the student still fuzzy on?",
  },
];

export const QUIZ: QuizQuestion[] = [
  {
    q: "Why can't a security decision be delegated to the frontend?",
    a: ["The user can modify it", "It's made up of nothing but CSS", "It doesn't connect to the internet"],
    correct: 0,
    why: "The frontend runs on the client's device. Requests can be sent without ever going through the UI's checks.",
  },
  {
    q: "What does authentication establish?",
    a: ["Which color looks nicer", "The user's identity", "A SQL table's name"],
    correct: 1,
    why: "Authentication verifies identity; authorization verifies permission.",
  },
  {
    q: "Ali is logged in, but /api/admin rejected the request. Which control kicked in?",
    a: ["CSS", "Authentication was disabled", "Authorization"],
    correct: 2,
    why: "Identity is established, but there's no permission for the admin action.",
  },
  {
    q: "There are no valid credentials. What's the typical response from a protected API?",
    a: ["201", "401", "500"],
    correct: 1,
    why: "401 means valid authentication credentials are missing.",
  },
  {
    q: "Which part typically talks to the database directly?",
    a: ["Backend", "CSS", "The browser's address bar"],
    correct: 0,
    why: "The backend sends the query to the database and turns the result into an HTTP response.",
  },
  {
    q: "What's the root cause of SQL Injection?",
    a: ["SQL being too fast", "The table being too large", "Input bleeding into the query's structure"],
    correct: 2,
    why: "A parameterized query keeps the value separate from the SQL structure.",
  },
  {
    q: "When does XSS occur?",
    a: [
      "Whenever any comment is posted",
      "When untrusted content becomes executable script in the browser",
      "When the server returns a 404",
    ],
    correct: 1,
    why: "Once content reaches a dangerous rendering sink, the browser can interpret it as code.",
  },
  {
    q: "User 15 can see user 16's private profile. What control is missing?",
    a: ["Object-level authorization", "Font size", "Using POST instead of GET"],
    correct: 0,
    why: "The server needs to check whether this specific resource may be given to the requesting identity.",
  },
  {
    q: "What does decoding a JWT's payload actually prove?",
    a: ["That the token is definitely valid", "That the user is definitely an admin", "Only that the payload was read"],
    correct: 2,
    why: "Decoding doesn't verify the signature, expiration, issuer, or audience.",
  },
  {
    q: "What does an HttpOnly cookie restrict?",
    a: ["Sending SQL to the database", "Reading the cookie through JavaScript", "XSS, in every case"],
    correct: 1,
    why: "HttpOnly restricts reading the cookie; XSS can still perform actions on the user's behalf regardless.",
  },
];

export const SOURCES: [string, string][] = [
  ["MDN · HTTP status codes", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status"],
  [
    "OWASP · SQL Injection Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
  ],
  [
    "OWASP · XSS Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html",
  ],
  [
    "OWASP · IDOR Prevention",
    "https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html",
  ],
];

export function groupFor(lessonId: number): LessonGroup {
  return GROUPS.find((g) => lessonId >= g.from && lessonId <= g.to) ?? GROUPS[0];
}
