# CyberValue promo

20-second silent animated advertisement, 1080 × 1920 (9:16), H.264 MP4.

- `cybervalue-ad.mp4`: final video, no audio track.
- `cover.png`: cover image.
- `cybervalue-ad.html`: animated preview and editable source; open in a browser.
- `assets/`: screenshots captured from the actual HTML Basics and Web Security Lab pages.

English edition: `cybervalue-ad-en.mp4`, `cover-en.png`, and `cybervalue-ad-en.html`.
To regenerate it, run `node marketing/localize-en.mjs` then `node marketing/render.mjs --en`.
English screenshots can be refreshed with `node marketing/capture.mjs --en` while the preview server runs. This translates the assessment link in the captured browser DOM only, without changing the website source.

The final card uses the CyberValue name and “PLAYGROUND” because a public domain was not provided.

To render again from the repository root:

```powershell
node marketing/render.mjs
```

To put your domain on the final card:

```powershell
$env:AD_DOMAIN = 'your-domain.example'
node marketing/render.mjs
```

To refresh the screenshots, start `node marketing/preview-server.mjs` and then run `node marketing/capture.mjs` in another terminal. The preview process disables the database only for its own environment; it does not edit `.env`. Stop it after capturing.

The video animates real page screenshots and promotional text. It does not depict a recorded live backend session. Rendering uses the installed Playwright Chromium and its MP4 MediaRecorder support.
