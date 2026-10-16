// Turns a portrait photo into the particle targets the home hero gathers into
// (the bundled default; admins can replace it at /admin/portrait).
//
//   npx tsx scripts/portrait-points.ts <photo> [--preview out.png]
//
// Writes src/components/portrait-points.json: { aspect, points } where points
// is a flat list of x, y (0–999, top-left origin) and tone (0–9) triples. A
// cut-out PNG with a transparent background gives the cleanest silhouette.
import fs from "node:fs";
import sharp from "sharp";
import { portraitFromImage } from "../src/lib/portrait";

const [input, flag, previewPath] = process.argv.slice(2);
if (!input) {
  console.error(
    "Usage: tsx scripts/portrait-points.ts <photo> [--preview out.png]",
  );
  process.exit(1);
}

const { aspect, points } = await portraitFromImage(fs.readFileSync(input));
const output = "src/components/portrait-points.json";
fs.writeFileSync(output, JSON.stringify({ aspect, points }) + "\n");
console.log(`${points.length / 3} points → ${output}`);

if (flag === "--preview" && previewPath) {
  const width = 520;
  const height = Math.round(width / aspect);
  let seed = 11;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const shapes: string[] = [];
  for (let i = 0; i < points.length; i += 3) {
    const cx = (points[i] / 999) * width;
    const cy = (points[i + 1] / 999) * height;
    const angle = random() * Math.PI * 2;
    const corners = [0, 1, 2]
      .map((k) => {
        const a = angle + (k * Math.PI * 2) / 3;
        return `${(cx + Math.cos(a) * 1.8).toFixed(1)},${(cy + Math.sin(a) * 1.8).toFixed(1)}`;
      })
      .join(" ");
    shapes.push(
      `<polygon points="${corners}" fill="none" stroke="#a68bff" stroke-opacity="${(0.3 + points[i + 2] / 12).toFixed(2)}"/>`,
    );
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%"/>${shapes.join("")}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(previewPath);
  console.log(`preview → ${previewPath}`);
}
