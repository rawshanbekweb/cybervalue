# Animated portraits

The home page hero and each student's area draw a portrait out of outlined
triangle particles (`src/components/constellation.tsx`). A portrait is stored
as particle targets only, `{ aspect, points }` with x, y (0–999) and tone
(0–9) triples, never as the photo it came from.

## Home page portrait

Admins replace it at **/admin/portrait** (sidebar: _Home page portrait_) and
can restore the bundled default (`src/components/portrait-points.json`). The
upload is stored in the `SiteSetting` row `home-portrait`. The home page links
`/api/portrait?v=<upload time>`, so each upload gets a fresh, permanently
cacheable URL and the site shows it within the page's 60 s revalidation.

## Student portraits

On their area's home page a student opens _Add your photo_, uploads a photo and
gets their own animated portrait (`Student.portrait`). They can change or remove
it at any time. Uploads are limited to 10 per 10 minutes per student.

## How a photo becomes points

`src/lib/portrait.ts` (also used by `scripts/portrait-points.ts`):

1. The browser shrinks the photo to at most 720 px (under 900 KB) before
   sending it, which also drops its metadata.
2. A transparent cut-out uses its alpha channel as the silhouette. Otherwise
   the background is grown inwards from the top and upper side edges while its
   colour stays close; sizeable pieces over the figure's middle are kept.
3. If that fails (busy background, or one close to the skin colour) a
   head-and-shoulders oval stands in for the silhouette.
4. About 3,200 points are dithered over brightness, local contrast and the
   silhouette edge, with extra weight on the head.

A head-and-shoulders photo on a plain background gives the best result.
