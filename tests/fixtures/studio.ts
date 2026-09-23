const document = (body: string) =>
  `<!DOCTYPE html><html lang="en"><head><title>Studio example project</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${body}</body></html>`;
const email = `<label for="email">Email address</label><input id="email" name="email" type="email" required><button type="submit">Send request</button>`;

export const studioSolutions = {
  incident: document(
    `<main><h1>Report a security incident</h1><form id="report">${email}<label for="severity">Severity</label><select name="severity" id="severity" required><option value="">Choose severity</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select><label for="description">What happened?</label><textarea id="description" name="description" minlength="20" required></textarea><fieldset><legend>Preferred contact method</legend><input id="contact-email" type="radio" name="channel" value="email"><label for="contact-email">Email</label><input id="contact-phone" type="radio" name="channel" value="phone"><label for="contact-phone">Phone</label></fieldset></form></main>`,
  ),
  status: document(
    `<main><h1>Parcel Loop service status</h1><time datetime="2026-09-23T09:30:00Z">Updated September 23 at 09:30 UTC</time><table><caption>Current service availability</caption><thead><tr><th scope="col">Service</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead><tbody>${[
      ["API Gateway", "Degraded"],
      ["Authentication", "Operational"],
      ["File Storage", "Maintenance"],
    ]
      .map(
        ([service, state], index) =>
          `<tr><th scope="row">${index === 0 ? `<a href="#incident">${service}</a>` : service}</th><td>${state}</td><td><time datetime="2026-09-23T09:30:00Z">09:30 UTC</time></td></tr>`,
      )
      .join(
        "",
      )}</tbody></table><section id="incident"><h2>Delayed API responses</h2><p>Some API requests are delayed while our team restores the affected processing workers.</p></section></main>`,
  ),
  launch: document(
    `<header><nav><a href="#features">Features</a><a href="#faq">Questions</a></nav></header><main><h1>Keep your ideas connected</h1><a href="#signup">Join the early access list</a><section id="features"><h2>A home for your notes</h2><ul><li>Capture ideas as they arrive</li><li>Connect notes across projects</li><li>Find the thought you need</li></ul></section><form id="signup">${email}</form><section id="faq"><h2>Common questions</h2>${["How does it work?", "Can I export my notes?", "When will it launch?"].map((question) => `<details><summary>${question}</summary><p>This example answer provides useful context for our product visitors.</p></details>`).join("")}</section></main><footer>Field Notes — a fictional product for curious minds.</footer>`,
  ),
};
