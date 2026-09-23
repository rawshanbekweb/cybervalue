# 00:17 — So‘nggi signal

An Uzbek-language, story-based CTF at `/playground/ctf`. Links appear on the home page, playground, and `/ctf` competition archive. No account or database is required.

Five challenges restore a fictional NOVA station: inspecting HTML source, reversing Base64/ROT13, following an archive's robots.txt clues, reconstructing interleaved trace logs, and opening a final transmission with four recovered letters and the station time. The 00:17 clock is a story artifact, not a countdown. All evidence is synthetic. The archive path inspector reads fixed local fixtures and makes no HTTP requests.

Flags are verified by `POST /api/ctf/verify`. Answers and receipt generation live in the server dependency graph; the finale requires the correct receipts from all four earlier challenges. Requests are streamed with a 4 KiB limit. Responses are not cached. A bounded process-wide limit permits 600 verification requests per minute; it is not a distributed competition rate limiter.

The personal score totals 900 points. Each optional hint reduces that challenge's award by 10; incorrect submissions cost nothing. Repeated correct submissions do not add points. Browser storage keeps validated progress, hints, notes, feedback, and receipts under `cybervalue:ctf:signal-0017:v1`. The final receipt is discarded during recovery if prerequisite receipts are absent. Reset asks for confirmation. Markdown export preserves investigation notes.

This is a self-paced learning game. Browser records and scores are editable, source is inspectable, and receipts are deterministic evidence of a correct answer, not authenticated achievements. No leaderboard, time ranking, prizes, or certification is provided. A competitive version would need accounts, server-owned scores, per-user challenge state, and stronger abuse controls. Verification needs network access; unavailable storage does not prevent in-memory play.

`tests/ctf.test.ts` derives flags from actual evidence and covers receipt gates, validation, score recovery, decoders, and archive boundaries. `tests/e2e/ctf.spec.ts` covers the complete story, hints, persistence, exports, reset, errors, API validation, responsive layout, reduced motion, and accessibility.
