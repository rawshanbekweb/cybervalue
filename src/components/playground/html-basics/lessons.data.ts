export interface HtmlCheck {
  label: string;
  test: (code: string) => boolean;
}

export interface HtmlLesson {
  id: number;
  title: string;
  intro: string;
  task: string;
  starter: string;
  solution: string;
  checks: HtmlCheck[];
}

export const HTML_LESSONS: HtmlLesson[] = [
  {
    id: 1,
    title: "The HTML skeleton",
    intro:
      "Every HTML page starts from the same \"skeleton\": <!DOCTYPE html>, <html>, <head>, and <body>. The <head> holds meta-information about the page, while the <body> holds the content the user actually sees.",
    task: 'Add a <title>My Page</title> line inside the <head>, and add the text "Hello, HTML!" inside the <body>.',
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n\n</head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Page</title>\n</head>\n<body>\n  Hello, HTML!\n</body>\n</html>`,
    checks: [
      { label: "<!DOCTYPE html> is present", test: (c) => /<!doctype html>/i.test(c) },
      { label: "<title> tag is inside <head>", test: (c) => /<title>[^<]*<\/title>/i.test(c) },
      {
        label: "There's text inside <body>",
        test: (c) => {
          const m = c.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
          return !!(m && m[1].replace(/<[^>]+>/g, "").trim().length);
        },
      },
    ],
  },
  {
    id: 2,
    title: "Headings and paragraphs",
    intro:
      "<h1> through <h6> mark heading levels — <h1> is the most important. Plain text goes inside <p> (paragraph). A page usually has a single <h1>.",
    task: "Add one <h1> heading and at least one <p> paragraph.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <h1>My Blog</h1>\n  <p>This is my first HTML page.</p>\n</body>\n</html>`,
    checks: [
      { label: "<h1> is present", test: (c) => /<h1[^>]*>[^<]+<\/h1>/i.test(c) },
      { label: "<p> is present", test: (c) => /<p[^>]*>[^<]+<\/p>/i.test(c) },
    ],
  },
  {
    id: 3,
    title: "Formatting text",
    intro:
      "<strong> makes text important (usually bold), <em> adds emphasis (usually italic). <br> breaks a line, <hr> draws a horizontal rule.",
    task: "Use at least one <strong>, one <em>, and one <br> tag.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>This is plain text.</p>\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>This is <strong>important</strong> and <em>emphasized</em> text.<br>A new line starts here.</p>\n</body>\n</html>`,
    checks: [
      { label: "<strong> is used", test: (c) => /<strong>[^<]+<\/strong>/i.test(c) },
      { label: "<em> is used", test: (c) => /<em>[^<]+<\/em>/i.test(c) },
      { label: "<br> is used", test: (c) => /<br\s*\/?>/i.test(c) },
    ],
  },
  {
    id: 4,
    title: "Lists",
    intro:
      "<ul> is an unordered (bulleted) list, <ol> is an ordered (numbered) list. In both, each item goes inside <li>.",
    task: "Create one <ul> list with at least 3 items.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <ul>\n    <li>Bread</li>\n    <li>Milk</li>\n    <li>Eggs</li>\n  </ul>\n</body>\n</html>`,
    checks: [
      { label: "<ul> is present", test: (c) => /<ul>/i.test(c) },
      { label: "At least 3 <li>", test: (c) => (c.match(/<li>/gi) || []).length >= 3 },
    ],
  },
  {
    id: 5,
    title: "Links",
    intro:
      '<a href="...">text</a> creates a link. The href attribute points to the destination. target="_blank" opens the link in a new tab.',
    task: "Add one <a> link with an href attribute.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <a href="https://example.test" target="_blank">Go to the site</a>\n</body>\n</html>`,
    checks: [
      { label: "<a> tag is present", test: (c) => /<a\s/i.test(c) },
      { label: "href attribute is present", test: (c) => /<a\s[^>]*href\s*=\s*["'][^"']+["']/i.test(c) },
    ],
  },
  {
    id: 6,
    title: "Images",
    intro:
      '<img src="..." alt="..."> places an image. src is the image address; alt is the text shown if the image fails to load or a screen reader is used. <img> doesn\'t need a closing tag.',
    task: "Add an <img> with src and alt attributes.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <img src="https://picsum.photos/200" alt="Random image" width="200">\n</body>\n</html>`,
    checks: [
      { label: "<img> tag is present", test: (c) => /<img\s/i.test(c) },
      { label: "src attribute is present", test: (c) => /<img\s[^>]*src\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "alt attribute is present", test: (c) => /<img\s[^>]*alt\s*=\s*["'][^"']*["']/i.test(c) },
    ],
  },
  {
    id: 7,
    title: "Tables",
    intro: "<table> creates a table. <tr> is a row, <th> is a header cell, <td> is a regular cell.",
    task: "Create one table with a header row and at least 2 rows.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <table border="1">\n    <tr><th>Name</th><th>Age</th></tr>\n    <tr><td>Ali</td><td>21</td></tr>\n  </table>\n</body>\n</html>`,
    checks: [
      { label: "<table> is present", test: (c) => /<table/i.test(c) },
      { label: "<th> is present", test: (c) => /<th>/i.test(c) },
      { label: "At least 2 <tr>", test: (c) => (c.match(/<tr>/gi) || []).length >= 2 },
    ],
  },
  {
    id: 8,
    title: "Forms and inputs",
    intro:
      "<form> collects information from the user. <input> can have different types (text, email, password...). <label> describes an input, <button> submits it.",
    task: 'Add a form with a text-type input bound to a <label>, plus a <button>.',
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <form>\n    <label for="name">Your name:</label>\n    <input type="text" id="name" name="name">\n    <button type="submit">Submit</button>\n  </form>\n</body>\n</html>`,
    checks: [
      { label: "<form> is present", test: (c) => /<form/i.test(c) },
      { label: "<input> is present", test: (c) => /<input\s/i.test(c) },
      { label: "<label> is present", test: (c) => /<label/i.test(c) },
      { label: "<button> is present", test: (c) => /<button/i.test(c) },
    ],
  },
  {
    id: 9,
    title: "Semantic tags",
    intro:
      "It's recommended to use meaningful tags instead of <div>: <header> (page top), <nav> (menu), <main> (main content), <footer> (page bottom). This helps search engines and screen readers.",
    task: "Add <header>, <main>, and <footer> tags.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <header><h1>Site Name</h1></header>\n  <main><p>The main content goes here.</p></main>\n  <footer><p>&copy; 2026</p></footer>\n</body>\n</html>`,
    checks: [
      { label: "<header> is present", test: (c) => /<header/i.test(c) },
      { label: "<main> is present", test: (c) => /<main/i.test(c) },
      { label: "<footer> is present", test: (c) => /<footer/i.test(c) },
    ],
  },
  {
    id: 10,
    title: "div and span",
    intro:
      "<div> is a generic block-level container (starts on its own line). <span> is an inline container (stays within the text flow). Neither has any meaning of its own — they're purely for grouping.",
    task: "Create one <div> containing text with a <span> inside it.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <div>\n    This paragraph has the word <span style="color:red">red</span> in it.\n  </div>\n</body>\n</html>`,
    checks: [
      { label: "<div> is present", test: (c) => /<div/i.test(c) },
      { label: "<span> is present", test: (c) => /<span/i.test(c) },
    ],
  },
  {
    id: 11,
    title: "Attributes, id/class, and comments",
    intro:
      "Any tag can be given an id (a unique name) or a class (a group name) — CSS or JavaScript can then target it. <!-- comment --> leaves a note in the code that isn't rendered.",
    task: "Add one element with an id attribute, another element with a class attribute, and one HTML comment.",
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <!-- A custom id for the heading -->\n  <h2 id="main-heading">Hello</h2>\n  <p class="note">This paragraph is marked with a class.</p>\n</body>\n</html>`,
    checks: [
      { label: "id attribute is used", test: (c) => /\sid\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "class attribute is used", test: (c) => /\sclass\s*=\s*["'][^"']+["']/i.test(c) },
      { label: "HTML comment is present", test: (c) => /<!--[\s\S]*?-->/.test(c) },
    ],
  },
  {
    id: 12,
    title: "Special characters",
    intro:
      'Some characters (<, >, &) have special meaning in HTML syntax, so they can\'t be typed directly. "Entities" are used instead: &lt; (<), &gt; (>), &amp; (&), &copy; (©), &nbsp; (space).',
    task: 'Use at least one of &lt;, &gt;, or &amp; as visible text (for example: "5 &lt; 10").',
    starter: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n\n</body>\n</html>`,
    solution: `<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="UTF-8"></head>\n<body>\n  <p>In math: 5 &lt; 10, and 2 &amp; 2 isn't 4, because &amp; is a logical operator.</p>\n</body>\n</html>`,
    checks: [{ label: "At least one entity (&lt; &gt; &amp; &copy; &nbsp;) is used", test: (c) => /&(lt|gt|amp|copy|nbsp);/i.test(c) }],
  },
];
