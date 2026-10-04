import { getAdminTranslator } from "@/lib/i18n/server";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mfaAvailable, unseal } from "@/lib/mfa";
import { otpauthUri } from "@/lib/totp";
import { AccountForms } from "@/components/admin/account-forms";
import { MfaForms, type MfaView } from "@/components/admin/mfa-forms";

async function mfaView(user: {
  email: string | null;
  totpSecret: string | null;
  totpPendingSecret: string | null;
  recoveryCodes: string[];
}): Promise<MfaView> {
  if (user.totpSecret)
    return { status: "on", recoveryLeft: user.recoveryCodes.length };
  if (!mfaAvailable()) return { status: "unavailable" };
  if (!user.totpPendingSecret) return { status: "off" };
  try {
    const secret = unseal(user.totpPendingSecret);
    const uri = otpauthUri(secret, user.email ?? "admin", "CyberValue");
    const svg = await QRCode.toString(uri, { type: "svg", margin: 1 });
    return {
      status: "setup",
      secret: secret.replace(/(.{4})/g, "$1 ").trim(),
      qr: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    };
  } catch {
    return { status: "off" };
  }
}

export default async function AccountPage() {
  const t = await getAdminTranslator();
  const session = await requireAdmin("/admin/account");
  const count =
    (await getDb()?.session.count({
      where: { userId: session.user.id, expiresAt: { gt: new Date() } },
    })) ?? 0;
  return (
    <div className="admin-page">
      <h1>{t("Account settings")}</h1>
      <p>
        {session.user.name} · {session.user.email}
      </p>
      <p className="muted">{t("{count} active sessions", { count })}</p>
      <MfaForms view={await mfaView(session.user)} />
      <AccountForms />
    </div>
  );
}
