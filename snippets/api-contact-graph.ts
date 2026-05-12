/**
 * Contact-form API route that sends email via Microsoft Graph
 * ============================================================
 *
 * A POST /api/contact endpoint that receives a contact form
 * submission and dispatches it as an email through a Microsoft 365
 * mailbox using Azure AD's client_credentials flow.
 *
 * Why Graph over SMTP:
 *   - No SMTP credentials in env — only an Azure AD client secret,
 *     rotatable in the Azure portal without changing code.
 *   - Mail goes through your real M365 tenant; deliverability is
 *     the same as any internal email from the company domain.
 *   - Sent items are saved to the sender's Outlook — built-in
 *     audit trail.
 *   - Bypasses MFA / Conditional Access policies that often block
 *     password-based SMTP login.
 *
 * Required environment variables:
 *   AZURE_TENANT_ID       Directory (tenant) ID
 *   AZURE_CLIENT_ID       Application (client) ID
 *   AZURE_CLIENT_SECRET   Client secret VALUE (not the secret ID)
 *   SENDER_EMAIL          Mailbox the email is sent FROM
 *   RECIPIENT_EMAIL       Mailbox the form delivers TO
 *
 * Required Azure AD app permission:
 *   Microsoft Graph → Application → Mail.Send
 *   (with admin consent granted)
 *
 * Used in: app/api/contact/route.ts
 */

import { NextResponse } from "next/server";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

// ── Azure AD client_credentials flow ──────────────────────────
const credential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!,
);

// ── Graph SDK client with the AD credential as auth provider ──
const getGraphClient = () =>
  Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken(
          "https://graph.microsoft.com/.default",
        );
        done(null, token.token);
      } catch (err) {
        done(err as Error, null);
      }
    },
  });

// ── Map service-key → human-readable tier label ───────────────
// Adjust to your offering. Keys must match the form's <option> values.
const TIER_LABELS: Record<string, string> = {
  basic: "Basic Tier (€XXX)",
  premium: "Premium Tier (€XXX)",
  business: "Business Tier (€XXX)",
  consultation: "Free consultation",
};

// ── POST handler ──────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { name, email, phone, service, message } = await request.json();

    // ── Validation ──────────────────────────────────────────
    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const sender = process.env.SENDER_EMAIL!;
    const recipient = process.env.RECIPIENT_EMAIL!;
    if (!sender || !recipient) {
      throw new Error("SENDER_EMAIL or RECIPIENT_EMAIL not configured");
    }

    // ── Build the email body ────────────────────────────────
    // Use a defensive HTML subset that renders correctly across
    // Outlook desktop, Outlook web, Gmail, and Apple Mail.
    // Inline styles only — Outlook strips most <style> rules.
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e3a8a; color: #fff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 20px;">New Contact Form Submission</h1>
        </div>
        <div style="background: #f9fafb; padding: 24px;">
          <p style="margin: 0 0 8px;"><strong>Name:</strong></p>
          <p style="margin: 0 0 16px; padding: 8px 12px; background: #fff;">${escapeHtml(name)}</p>

          <p style="margin: 0 0 8px;"><strong>Email:</strong></p>
          <p style="margin: 0 0 16px; padding: 8px 12px; background: #fff;">
            <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
          </p>

          <p style="margin: 0 0 8px;"><strong>Phone:</strong></p>
          <p style="margin: 0 0 16px; padding: 8px 12px; background: #fff;">
            <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a>
          </p>

          <p style="margin: 0 0 8px;"><strong>Service tier:</strong></p>
          <p style="margin: 0 0 16px; padding: 8px 12px; background: #fff;">
            ${escapeHtml(TIER_LABELS[service] || service)}
          </p>

          <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
          <p style="margin: 0 0 16px; padding: 8px 12px; background: #fff; white-space: pre-wrap;">
            ${escapeHtml(message)}
          </p>

          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
            Submitted ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
          </p>
        </div>
      </div>
    `;

    // ── Compose the Graph sendMail request ──────────────────
    const mail = {
      message: {
        subject: `Contact form: ${TIER_LABELS[service] || service}`,
        body: { contentType: "HTML", content: htmlBody },
        toRecipients: [{ emailAddress: { address: recipient } }],
        from: { emailAddress: { address: sender } },
      },
      saveToSentItems: true,
    };

    // ── Send via Graph ──────────────────────────────────────
    const client = getGraphClient();
    await client.api(`/users/${sender}/sendMail`).post(mail);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send email", detail: error.message },
      { status: 500 },
    );
  }
}

// ── Tiny HTML-escape helper to prevent injection in the body ──
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
