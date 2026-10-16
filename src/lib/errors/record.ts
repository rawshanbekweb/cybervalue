import "server-only";
import { getDb } from "../db";
import { escapeHtml } from "../telegram/escape";
import { notify, teacherSubjects } from "../telegram/notify";
import { shapeError, type ErrorInput } from "./shape";

/**
 * Stores an error, or bumps the count of the same one. A new error, or one
 * that comes back after being marked resolved, is sent to the teachers'
 * Telegram once a day. Never throws: reporting must not cause errors.
 */
export async function recordError(input: ErrorInput) {
  try {
    const db = getDb();
    if (!db) return;
    const data = shapeError(input);
    const existing = await db.errorEvent.findUnique({
      where: { fingerprint: data.fingerprint },
      select: { id: true, resolvedAt: true },
    });
    if (existing)
      await db.errorEvent.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
          lastAt: new Date(),
          resolvedAt: null,
          path: data.path,
          ...(data.stack ? { stack: data.stack } : {}),
        },
      });
    else await db.errorEvent.create({ data });
    if (!existing || existing.resolvedAt) {
      const day = new Date().toISOString().slice(0, 10);
      await notify(
        db,
        await teacherSubjects(db),
        [
          `<b>Saytda xato</b> (${data.source})`,
          escapeHtml(data.message.slice(0, 300)),
          escapeHtml(data.route || data.path),
        ].join("\n"),
        `error:${data.fingerprint}:${day}`,
      );
    }
  } catch (error) {
    console.error("could not record an error", error);
  }
}
