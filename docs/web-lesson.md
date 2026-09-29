# Web asoslari resource

The Resources page features the Uzbek “Web qanday ishlaydi?” lesson above the
CMS reference archive. It ships with the site, like the CTF gateway, and requires
no database import. The card is curated content, so archive filters and global
CMS search do not filter or index it. Edit `src/components/web-lesson-resource.tsx`
to update the card.

The standalone lesson lives at `/lessons/web-asoslari/index.html`. Its 75 slides,
keyboard navigation, topic fragments, teacher notes and local checklist use the
original HTML/CSS/JavaScript from `slayd2`. System fonts replace the external
Google Fonts import so both hosted and offline copies work without remote
requests. The existing CSP and frame protections remain in place.

`public/lessons/web-asoslari/` is the maintained source. The return link is shown
only over HTTP(S); it is hidden when opening the ZIP's HTML as a local file.
The ZIP is a public teaching resource, independent of CMS publication status.

After editing the lesson, rebuild the offline copy from the repository root:

```powershell
Compress-Archive -Path public/lessons/web-asoslari/* -DestinationPath public/lessons/web-asoslari.zip -Force
```

Validate with `npm run lint`, `npm run typecheck`, and, with the app running at
localhost:3000, `npx playwright test tests/e2e/web-lesson.spec.ts`.
