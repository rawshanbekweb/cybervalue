import { getCtfTranslator } from "@/lib/challenges/view";
import Link from "next/link";

import { requirePlayer } from "@/lib/challenges/session";
import { teamOf } from "@/lib/challenges/teams";
import { TEAM_MAX_MEMBERS } from "@/lib/challenges/account";
import {
  CreateTeamForm,
  InviteCode,
  JoinTeamForm,
  LeaveTeamButton,
  MemberActions,
  RenameTeamForm,
} from "@/components/challenges/team-forms";

export async function generateMetadata() {
  const t = await getCtfTranslator();
  return { title: t("My team") };
}

export default async function TeamPage() {
  const player = await requirePlayer("/challenges/team");
  const t = await getCtfTranslator();
  const team = await teamOf(player.id);

  if (!team)
    return (
      <>
        <p className="ctf-eyebrow">{t("Team")}</p>
        <h1 className="ctf-title">{t("My team")}</h1>
        <p className="ctf-lead">
          {t(
            "You are not in a team. You can play alone, create a team or join one with an invite code. A team has up to {max} players.",
            { max: TEAM_MAX_MEMBERS },
          )}
        </p>
        {!player.emailVerifiedAt ? (
          <p className="ctf-banner" role="status">
            {t("Confirm your email before joining or creating a team.")}{" "}
            <Link href="/challenges/account">{t("My account")}</Link>
          </p>
        ) : (
          <div className="ctf-grid">
            <section className="ctf-panel" aria-labelledby="ctf-create-team">
              <h2 id="ctf-create-team" className="ctf-h2">
                {t("Create a team")}
              </h2>
              <p className="ctf-muted ctf-small">
                {t("You become the captain and get a code to invite others.")}
              </p>
              <CreateTeamForm />
            </section>
            <section className="ctf-panel" aria-labelledby="ctf-join-team">
              <h2 id="ctf-join-team" className="ctf-h2">
                {t("Join a team")}
              </h2>
              <p className="ctf-muted ctf-small">
                {t("Ask the captain for the team’s invite code.")}
              </p>
              <JoinTeamForm />
            </section>
          </div>
        )}
      </>
    );

  const captain = team.captainId === player.id;
  return (
    <>
      <p className="ctf-eyebrow">{t("Team")}</p>
      <h1 className="ctf-title">{team.name}</h1>
      <p className="ctf-lead">
        {t("{count} of {max} players", {
          count: team.members.length,
          max: TEAM_MAX_MEMBERS,
        })}
        {captain && ` · ${t("You are the captain.")}`}
      </p>
      <div className="ctf-grid">
        <section className="ctf-panel" aria-labelledby="ctf-members">
          <h2 id="ctf-members" className="ctf-h2">
            {t("Members")}
          </h2>
          <ul className="ctf-members">
            {team.members.map((m) => (
              <li key={m.id}>
                <span>
                  {m.username}
                  {m.id === team.captainId && (
                    <span className="ctf-tag">{t("Captain")}</span>
                  )}
                  {m.id === player.id && (
                    <span className="ctf-muted ctf-small"> ({t("you")})</span>
                  )}
                </span>
                {captain && m.id !== player.id && (
                  <MemberActions memberId={m.id} name={m.username} />
                )}
              </li>
            ))}
          </ul>
        </section>
        <section className="ctf-panel" aria-labelledby="ctf-invite">
          <h2 id="ctf-invite" className="ctf-h2">
            {t("Invite players")}
          </h2>
          <InviteCode code={team.inviteCode} captain={captain} />
        </section>
        {captain && (
          <section className="ctf-panel" aria-labelledby="ctf-rename">
            <h2 id="ctf-rename" className="ctf-h2">
              {t("Rename the team")}
            </h2>
            <RenameTeamForm name={team.name} />
          </section>
        )}
        <section className="ctf-panel" aria-labelledby="ctf-leave">
          <h2 id="ctf-leave" className="ctf-h2">
            {t("Leave the team")}
          </h2>
          <p className="ctf-muted ctf-small">
            {captain && team.members.length > 1
              ? t("The longest-standing member becomes the captain.")
              : team.members.length === 1
                ? t("You are the only member: leaving deletes the team.")
                : t("You can join another team afterwards.")}
          </p>
          <LeaveTeamButton last={team.members.length === 1} />
        </section>
      </div>
    </>
  );
}
