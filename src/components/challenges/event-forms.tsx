"use client";
import { useActionState, useId } from "react";
import { useTranslator } from "@/components/locale-provider";
import {
  registerSoloAction,
  registerTeamAction,
  submitFlagAction,
  unlockHintAction,
  withdrawAction,
  type FlagState,
  type FormState,
} from "@/app/challenges/actions";

function Message({ state }: { state: FormState }) {
  const t = useTranslator();
  if (state?.error)
    return (
      <p className="ctf-error" role="alert">
        {t(state.error)}
      </p>
    );
  if (state?.success)
    return (
      <p className="ctf-success" role="status">
        {t(state.success)}
      </p>
    );
  return null;
}

export function RegisterButtons({
  slug,
  team,
  solo,
}: {
  slug: string;
  team: boolean;
  solo: boolean;
}) {
  const t = useTranslator();
  const [teamState, teamAction, teamPending] = useActionState(
    registerTeamAction.bind(null, slug),
    undefined,
  );
  const [soloState, soloAction, soloPending] = useActionState(
    registerSoloAction.bind(null, slug),
    undefined,
  );
  return (
    <div className="ctf-form">
      <div className="ctf-actions">
        {team && (
          <form action={teamAction}>
            <button type="submit" className="ctf-button" disabled={teamPending}>
              {t("Register my team")}
            </button>
          </form>
        )}
        {solo && (
          <form action={soloAction}>
            <button
              type="submit"
              className={team ? "ctf-button is-ghost" : "ctf-button"}
              disabled={soloPending}
            >
              {t("Play on my own")}
            </button>
          </form>
        )}
      </div>
      <Message state={teamState ?? soloState} />
    </div>
  );
}

export function WithdrawButton({ slug }: { slug: string }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    withdrawAction.bind(null, slug),
    undefined,
  );
  return (
    <form
      action={action}
      className="ctf-form"
      onSubmit={(event) => {
        if (!confirm(t("Withdraw from this competition?")))
          event.preventDefault();
      }}
    >
      <div className="ctf-actions">
        <button
          type="submit"
          className="ctf-button is-ghost"
          disabled={pending}
        >
          {t("Withdraw")}
        </button>
      </div>
      <Message state={state} />
    </form>
  );
}

export function FlagForm({
  slug,
  challengeId,
}: {
  slug: string;
  challengeId: string;
}) {
  const t = useTranslator();
  const id = useId();
  const [state, action, pending] = useActionState<FlagState, FormData>(
    submitFlagAction.bind(null, slug, challengeId),
    undefined,
  );
  return (
    <form action={action} className="ctf-flag-form">
      <label htmlFor={id} className="ctf-hidden-label">
        {t("Flag")}
      </label>
      <input
        id={id}
        name="flag"
        className="ctf-input"
        placeholder="CV{...}"
        required
        maxLength={200}
        autoComplete="off"
        spellCheck={false}
        aria-invalid={state?.result === "wrong" ? true : undefined}
      />
      <button type="submit" className="ctf-button" disabled={pending}>
        {pending ? t("Checking…") : t("Submit")}
      </button>
      <p className="ctf-flag-result" role="status" aria-live="polite">
        {state?.error && <span className="ctf-error">{t(state.error)}</span>}
        {state?.result === "wrong" && (
          <span className="ctf-error">{t("Not this flag. Try again.")}</span>
        )}
        {state?.result === "correct" && (
          <span className="ctf-success">
            {t("Correct! The flag is yours.")}
          </span>
        )}
        {state?.result === "already" && (
          <span className="ctf-success">
            {t("Already solved by your side.")}
          </span>
        )}
      </p>
    </form>
  );
}

export function HintButton({
  slug,
  hintId,
  cost,
}: {
  slug: string;
  hintId: string;
  cost: number;
}) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(
    unlockHintAction.bind(null, slug, hintId),
    undefined,
  );
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          cost > 0 &&
          !confirm(t("Open this hint for {cost} points?", { cost }))
        )
          event.preventDefault();
      }}
    >
      <button type="submit" className="ctf-button is-ghost" disabled={pending}>
        {cost > 0
          ? t("Open a hint (−{cost} points)", { cost })
          : t("Open a hint (free)")}
      </button>
      <Message state={state} />
    </form>
  );
}
