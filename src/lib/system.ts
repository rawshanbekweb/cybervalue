import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";

export const CRON_KEY = "cron-last-run";
export const EXPORT_KEY = "last-export";

async function stamp(db: PrismaClient, key: string) {
  const value = { at: new Date().toISOString() };
  await db.siteSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
export const markCronRun = (db: PrismaClient) => stamp(db, CRON_KEY);
export const markExport = (db: PrismaClient) => stamp(db, EXPORT_KEY);

export async function stampOf(db: PrismaClient, key: string) {
  const row = await db.siteSetting.findUnique({ where: { key } });
  const at = (row?.value as { at?: unknown } | null)?.at;
  return typeof at === "string" ? new Date(at) : null;
}

// Learning data and content, for a backup next to Neon's own history.
// Sessions, rate limits and logs are left out, and so are admin password
// hashes and two-factor secrets; stored files keep their details but not
// their bytes.
export async function exportData(db: PrismaClient) {
  const [
    users,
    contents,
    tags,
    categories,
    images,
    links,
    files,
    settings,
    students,
    materials,
    submissions,
    progress,
    certificates,
    checkpoints,
    labs,
    assignments,
    juniors,
    exams,
    candidates,
    games,
    players,
    answers,
    chats,
  ] = await Promise.all([
    db.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    db.content.findMany(),
    db.tag.findMany(),
    db.category.findMany(),
    db.contentImage.findMany(),
    db.socialLink.findMany(),
    db.storedFile.findMany({ omit: { data: true } }),
    db.siteSetting.findMany(),
    db.student.findMany(),
    db.studentMaterial.findMany(),
    db.studentSubmission.findMany(),
    db.studentProgress.findMany(),
    db.studentCertificate.findMany(),
    db.studentCheckpoint.findMany(),
    db.studentLabProgress.findMany(),
    db.studentAssignment.findMany(),
    db.juniorMember.findMany(),
    db.htmlExam.findMany(),
    db.htmlCandidate.findMany(),
    db.liveGame.findMany(),
    db.livePlayer.findMany(),
    db.liveAnswer.findMany(),
    db.telegramChat.findMany(),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: {
      users,
      contents,
      tags,
      categories,
      images,
      links,
      files,
      settings,
      students,
      materials,
      submissions,
      progress,
      certificates,
      checkpoints,
      labs,
      assignments,
      juniors,
      exams,
      candidates,
      games,
      players,
      answers,
      chats,
    },
  };
}

/** Round-trip time, size, version and migration state of the database. */
export async function databaseInfo(db: PrismaClient) {
  const started = performance.now();
  await db.$queryRaw`SELECT 1`;
  const ms = Math.round(performance.now() - started);
  const [[info], migrations] = await Promise.all([
    db.$queryRaw<{ size: string; version: string }[]>`
      SELECT pg_size_pretty(pg_database_size(current_database())) AS size,
             current_setting('server_version') AS version`,
    db.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
      SELECT migration_name, finished_at FROM "_prisma_migrations"
      ORDER BY started_at DESC`,
  ]);
  return {
    ms,
    size: info.size,
    version: info.version,
    migrations: migrations.length,
    latest: migrations[0]?.migration_name ?? "—",
    failed: migrations.filter((m) => !m.finished_at).length,
  };
}
