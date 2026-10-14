// One defended solution per Build & Defend scenario: every attack must fail
// and every feature must keep working.
export const defendSolutions = {
  comments: `function renderComments(root, comments) {
  root.replaceChildren(
    ...comments.map((comment) => {
      const article = document.createElement("article");
      article.className = "comment";
      const author = document.createElement("b");
      author.textContent = comment.author;
      const text = document.createElement("p");
      text.textContent = comment.text;
      article.append(author, text);
      return article;
    }),
  );
}
`,
  profile: `function renderProfile(root, profile) {
  const card = document.createElement("div");
  card.className = "card";
  if (/^#[0-9a-f]{6}$/i.test(profile.color))
    card.style.borderColor = profile.color;
  const name = document.createElement("h2");
  name.title = profile.name;
  name.textContent = profile.name;
  const bio = document.createElement("p");
  bio.textContent = profile.bio;
  card.append(name, bio);
  try {
    const url = new URL(profile.website);
    if (url.protocol === "https:" || url.protocol === "http:") {
      const link = document.createElement("a");
      link.href = url.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Website";
      card.append(link);
    }
  } catch {}
  root.replaceChildren(card);
}
`,
  search: `function highlight(text, query) {
  const nodes = [];
  let start = 0;
  if (query)
    for (let at = text.indexOf(query); at !== -1; at = text.indexOf(query, start)) {
      nodes.push(document.createTextNode(text.slice(start, at)));
      const mark = document.createElement("mark");
      mark.textContent = query;
      nodes.push(mark);
      start = at + query.length;
    }
  nodes.push(document.createTextNode(text.slice(start)));
  return nodes;
}

function renderResults(root, query, results) {
  const summary = document.createElement("p");
  summary.textContent = \`Results for “\${query}”: \${results.length}\`;
  const list = document.createElement("ul");
  for (const result of results) {
    const item = document.createElement("li");
    let safe = false;
    try {
      safe = new URL(result.url, SITE).protocol === "https:";
    } catch {}
    const parent = safe ? document.createElement("a") : item;
    if (safe) {
      parent.href = result.url;
      item.append(parent);
    }
    parent.append(...highlight(result.title, query));
    list.append(item);
  }
  root.replaceChildren(summary, list);
}
`,
  redirect: `function safeRedirect(next) {
  try {
    const url = new URL(next || "/", "https://cybervalue.example");
    if (url.origin === "https://cybervalue.example")
      return url.pathname + url.search + url.hash;
  } catch {}
  return "/";
}
`,
};
