export type ProjectId = "incident" | "status" | "launch";
export type StudioProject = {
  id: ProjectId;
  title: string;
  client: string;
  level: string;
  brief: string;
  requirements: string[];
  review: string[];
  hints: string[];
  html: string;
  css: string;
};

const document = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
</head>
<body>
${body}
</body>
</html>`;

const baseCss = `* { box-sizing: border-box; }
body { margin: 0; background: #f3f5ed; color: #233122; font-family: system-ui, sans-serif; line-height: 1.6; }
main { width: min(720px, 100% - 40px); margin: 48px auto; }
h1 { font-size: clamp(30px, 6vw, 48px); line-height: 1.1; letter-spacing: -1.5px; }
h2 { font-size: 22px; }
p { color: #53634d; }
a { color: #365d1f; }
form, section, details { margin-top: 24px; }
label { display: block; margin-top: 18px; font-weight: 600; }
input:not([type=radio]), select, textarea { display: block; width: 100%; padding: 12px; margin-top: 6px; border: 1px solid #9ba992; border-radius: 8px; font: inherit; background: white; }
button, .cta { display: inline-block; margin-top: 20px; background: #355723; color: white; padding: 12px 22px; border: 0; border-radius: 8px; font: inherit; text-decoration: none; }
fieldset { margin: 24px 0 0; border: 1px solid #9ba992; border-radius: 8px; }
table { width: 100%; border-collapse: collapse; margin-top: 24px; }
caption { text-align: left; font-weight: 700; margin-bottom: 12px; }
th, td { text-align: left; padding: 14px 8px; border-bottom: 1px solid #c7d0bd; }
nav { display: flex; flex-wrap: wrap; gap: 20px; }
summary { cursor: pointer; font-weight: 600; }
:focus-visible { outline: 3px solid #527d35; outline-offset: 3px; }
/* Make it yours: change the palette, spacing, and layout.
   Check the phone preview before calling it finished. */`;

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: "incident",
    title: "A report that gets heard",
    client: "Northstar response team",
    level: "Forms & accessibility",
    brief:
      "An urgent report should not get lost behind an unusable form. Build an incident intake page that a keyboard or screen-reader user can understand. Make the fields meaningful, connect their labels, and let native HTML validation do its job.",
    requirements: [
      "Create one form with id=report inside main.",
      "Add a required email input with name=email, a unique id, and a connected text label.",
      "Add a required severity select with name=severity and options low, medium, high. Give it an empty placeholder option and a connected label.",
      "Add a required textarea with name=description, minlength=20, and a connected label.",
      "Group two radio choices (name=channel, values email and phone) in a fieldset with a meaningful legend and connected labels.",
      "Add a type=submit button with meaningful text. Keep this as a frontend prototype; no backend connection is needed.",
    ],
    review: [
      "Tab through the form: is focus visible and ordered?",
      "At 320px, can every label and field be read without horizontal scrolling?",
      "Explain why a placeholder cannot replace a label.",
    ],
    hints: [
      "A label’s for value must equal the input’s unique id. The name is the field’s submission key, not its label.",
      "An empty-value option plus required makes the severity selection intentional. Use fieldset and legend for the related radio choices.",
      "Use type=email and required together. Put minlength=20 on the description textarea; structural checks also require it to be inside the report form.",
    ],
    html: document(
      "Report an incident",
      `  <main>
    <p>NORTHSTAR / RESPONSE</p>
    <h1>Something doesn’t look right?</h1>
    <p>Help our team understand what happened.</p>
    <form id="report">
      <!-- Add labeled email, severity, description, and contact controls. -->
      <input placeholder="Your email">
      <button>Send</button>
    </form>
  </main>`,
    ),
    css: baseCss,
  },
  {
    id: "status",
    title: "Clarity during an outage",
    client: "Parcel Loop operations",
    level: "Tables & information design",
    brief:
      "The on-call team needs a status page that explains the situation without relying on colored dots. Build a readable service table, add a machine-readable update time, and connect the degraded service to a useful incident explanation.",
    requirements: [
      "Create a table inside main with a descriptive caption, thead, and tbody.",
      "Use three column headers: Service, Status, Updated. Each th needs scope=col.",
      "Add exactly three tbody rows: API Gateway / Degraded, Authentication / Operational, File Storage / Maintenance. Put each service name in th scope=row.",
      "Every row needs a time element with a valid ISO datetime and readable text in its Updated cell.",
      "Link the API Gateway row to #incident. Add a section id=incident containing an h2 and a paragraph of at least 40 characters explaining impact.",
      "Include a page-level time element outside the table so readers can see when this synthetic snapshot was updated.",
    ],
    review: [
      "Can the service states be understood with all colors removed?",
      "Does the three-column table fit a phone viewport?",
      "Does the incident link land on a useful heading?",
    ],
    hints: [
      "A caption names the whole table. Column headers describe fields; row headers name the individual service.",
      "Use a tbody row with th scope=row followed by two td cells. Put readable status text in the first td and a time element in the second.",
      "Use an ISO value such as 2026-09-23T09:30:00Z in datetime. The API link must point to the real incident section, not a placeholder URL.",
    ],
    html: document(
      "Parcel Loop status",
      `  <main>
    <p>PARCEL LOOP / SERVICE HEALTH</p>
    <h1>Know where things stand.</h1>
    <p>This is a synthetic service-status snapshot.</p>
    <table>
      <tr><td>API Gateway</td><td>🟠</td></tr>
    </table>
    <!-- Rebuild the table, then add an update time and incident details. -->
  </main>`,
    ),
    css: baseCss,
  },
  {
    id: "launch",
    title: "A launch with a clear next step",
    client: "Field Notes product team",
    level: "Semantic layout & navigation",
    brief:
      "Turn a product idea into a page someone can actually navigate. Explain the value, make the next action obvious, and answer common questions. The layout and voice are yours; the page still needs to work as a semantic document.",
    requirements: [
      "Add a header and nav containing at least two meaningful links to existing sections on this page.",
      "Create a section id=features inside main with an h2 and a list of at least three meaningful features.",
      "Add a clearly named hero link pointing to #signup.",
      "Create a form id=signup inside main, with a required email input, name=email, a unique id, a connected label, and a named type=submit button.",
      "Add a section id=faq with an h2 and at least three details elements. Each needs a summary question and a meaningful paragraph answer.",
      "Add a footer with meaningful text. Use your CSS to make the whole page readable at phone, tablet, and desktop widths.",
    ],
    review: [
      "Can a visitor understand the product before scrolling?",
      "Are navigation links and the primary action visually distinct?",
      "Open the FAQ with the keyboard and review the phone layout.",
    ],
    hints: [
      "Fragment links such as #features only work when the destination id exists and is unique.",
      "Use section and h2 for major topics, list items for features, and native details/summary for an FAQ that needs no JavaScript.",
      "The signup form needs id=signup. Put its labeled email input and explicit submit button inside that form, not beside it.",
    ],
    html: document(
      "Field Notes",
      `  <header>
    <nav><!-- Add links to #features and #faq. --></nav>
  </header>
  <main>
    <p>FIELD NOTES / BUILT FOR CURIOUS MINDS</p>
    <h1>Keep the thought. Find the thread.</h1>
    <p>A calmer place for the notes behind your next idea.</p>
    <!-- Add a hero action, features, signup form, and FAQ. -->
  </main>`,
    ),
    css:
      baseCss +
      "\nheader, footer { width: min(720px, 100% - 40px); margin: 28px auto; }\nli { margin-block: 12px; }\ndetails { border-bottom: 1px solid #c7d0bd; padding-bottom: 16px; }",
  },
];
