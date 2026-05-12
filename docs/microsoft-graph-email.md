# Microsoft Graph Email Backend

The contact form on this prototype doesn't use Nodemailer or a
generic SMTP relay. It uses Azure AD's client credentials flow to
get a Microsoft Graph token, then calls Graph's `sendMail` endpoint
to dispatch the email through a real Microsoft 365 mailbox.

This is more setup than SMTP, but produces a more robust outcome
for any team that already runs on Microsoft 365.

## Why Graph instead of SMTP

| | SMTP / Nodemailer | Microsoft Graph |
|---|---|---|
| Credentials | Username + app password | Azure AD client secret |
| Rotation | Manual change in code/env | Rotate in Azure portal |
| Sender domain | Whatever SMTP allows | The company's real domain |
| Deliverability | Depends on relay reputation | Same as any internal email |
| Audit trail | None — fire and forget | Sent items saved in Outlook |
| MFA / Conditional Access | Often blocks SMTP login | Bypassed by service principal |
| Scopes | All-or-nothing | `Mail.Send` only |

For a team already on Microsoft 365, Graph is the right answer.
The setup cost is paid once; the operational benefits are recurring.

## Setup overview

Three things have to be true before a single line of code runs:

1. **Azure AD app registration exists** — created in the Azure
   portal, has `Mail.Send` application permission granted (admin
   consent required), and has a client secret.
2. **The sender mailbox is real** — a licensed Microsoft 365
   mailbox in the same tenant. The app sends *as* this mailbox.
3. **Three secrets are in env**:
   - `AZURE_TENANT_ID` — directory ID
   - `AZURE_CLIENT_ID` — application ID of the app registration
   - `AZURE_CLIENT_SECRET` — the secret value (not the secret ID)
   - `SENDER_EMAIL` — the mailbox address (e.g. `noreply@example.com`)
   - `RECIPIENT_EMAIL` — where the form sends to

## The token flow

The Microsoft Graph SDK handles this for you, but it's worth
understanding what it does:

1. Construct a `ClientSecretCredential` with the three Azure values.
2. Request a token for scope `https://graph.microsoft.com/.default`.
3. Cache the token (the SDK does this) until it expires.
4. Use the token as a Bearer in calls to `https://graph.microsoft.com/v1.0/...`.

The "client credentials" flow means: no user, no browser, no consent
prompt. The app authenticates as itself, using the secret. This is
why the Azure permission is type "Application" (not "Delegated") —
no user is in the loop.

## The send call

Once authenticated, the actual send is one POST to:

```
POST https://graph.microsoft.com/v1.0/users/{sender}/sendMail
```

…with a JSON body containing the message. The email shape is
documented in Microsoft's
[sendMail reference](https://learn.microsoft.com/graph/api/user-sendmail).

The full pattern, with input validation and a styled HTML body, is
in [`../snippets/api-contact-graph.ts`](../snippets/api-contact-graph.ts).

## HTML email body — gotchas

The Graph API will deliver whatever HTML you give it, but Outlook
and Gmail both render email HTML with a **much** smaller subset of
modern CSS than a browser. A few rules that bite:

- **No `<style>` blocks rely on cascade.** Outlook strips most of
  it. Inline every style with `style="..."` attributes if you want
  it to render reliably.
- **No flexbox.** Use `<table>` for layout. Yes, in 2026.
- **Line-heights are unreliable.** Set them on every element that
  needs them, not via cascade.
- **Background images often fail.** Especially in Outlook desktop.
  Use solid colors or hosted images via `<img>`.
- **Web fonts work in Apple Mail and Gmail web; not in Outlook
  desktop.** Provide a fallback stack.

The snippet uses a defensive subset that renders correctly in
modern Outlook + Gmail. For a richer template, look at
[MJML](https://mjml.io) — a markup language that compiles to
email-safe HTML.

## Failure modes

| Failure | Cause | Response |
|---|---|---|
| Token request returns 401 | Bad client secret, or secret expired | Rotate the secret in Azure, update env, redeploy |
| Token request returns 403 | Missing or unconsented `Mail.Send` permission | Re-grant in Azure, ask an admin to consent |
| sendMail returns 403 | Sender mailbox doesn't exist or isn't licensed | Verify the sender mailbox in Microsoft 365 admin |
| sendMail returns 429 | Tenant-level rate limit | Backoff and retry; for a contact form this should never realistically hit |
| sendMail returns 200 but email never arrives | Tenant policies blocking external recipient, or recipient's spam filter | Check Microsoft 365 message trace, then recipient's quarantine |
| Form submits but page hangs | Function timeout (Vercel default 10s) | Move to Vercel's longer-timeout tier, or accept the form synchronously and queue the send |

## What this pattern is not

- **Not the right choice for non-Microsoft tenants.** If your team
  uses Google Workspace, use the Gmail API equivalent. If you use
  neither, SMTP is fine.
- **Not free.** Microsoft Graph requires a Microsoft 365 license
  for the sender mailbox. SMTP relays like SendGrid have a free
  tier.
- **Not a replacement for transactional email tooling.** For
  password resets, receipts, etc. at scale, use Postmark / Resend
  / SendGrid / SES. Graph is for low-volume, identity-bound mail.
