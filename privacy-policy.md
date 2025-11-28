# Privacy Policy — Socket Inspector

**Effective Date:** November 28, 2025  
**Policy Version:** 1.1.2
**Applies to:** Socket Inspector extension for Chromium-based browsers and `socketinspector.com` (the “Site”)

---

## Overview

The Socket Inspector extension is a developer tool that runs entirely in your browser. The extension does not transmit the page’s WebSocket contents or browsing activity to Socket Inspector’s servers or to third parties. Apart from normal browser/OS processes (e.g., extension updates) that do not include your page contents, all processing happens locally. Collection/use of browsing activity is limited to providing the user‑facing debugging features described in our store listing and UI.

For the `socketinspector.com` website, we keep data collection minimal (see **Website Privacy Notice** below).

We designed the extension to meet relevant browser store policies, including the [Chrome Web Store User Data Policy](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) and its [Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use) requirements. We do not sell or share personal information (as defined under California law) or use it for targeted advertising.

---

## Scope

This policy explains how **Socket Inspector** (“Socket Inspector,” “we,” “us”), published by Trey Vigus, handles information in two contexts:

1. **Browser extension** — how information is processed locally on your device when you use the Socket Inspector DevTools panel.
2. **Website (socketinspector.com)** — what limited information is handled when you visit the Site or contact us.

If another website or service has its own privacy policy, that policy will govern there.

---

## What We Process and Why (Browser extension)

Socket Inspector helps you **inspect and manipulate WebSocket traffic** from the page you’re viewing. Processing happens locally for the following categories:

### 1) WebSocket Traffic

- **What:** WebSocket handshake URLs, connection status (`CONNECTING`, `OPEN`, `CLOSED`), and messages sent over a WebSocket connection.
- **Why:** To display and let you manipulate WebSocket traffic in the extension’s DevTools panel.
- **Storage:** **Ephemeral** (RAM); **not persisted** by the extension.
- **Transmission:** **Not transmitted** by the extension to the developer or third parties.
- **Important:** If you choose to send a message, that message is transmitted **over the site’s WebSocket connection** to the destination you select (e.g., the page’s client and/or server).

### 2) Tab IDs

- **What:** Numeric IDs for tabs you have open.
- **Why:** To route each tab’s WebSocket events to its corresponding DevTools panel.
- **Storage:** **Ephemeral** (RAM); **not persisted**.
- **Transmission:** **Not transmitted** outside your device.

### 3) Detected DevTools theme (light/dark)

- **What:** The browser DevTools theme state (light/dark).
- **Why:** To render the panel according to the user's preferred theme.
- **Storage:** **Ephemeral**; **not persisted** by the extension.
- **Transmission:** **Not transmitted** outside your device.

### 4) Extension Enabled/Disabled Preference

- **What:** Your choice to enable or disable the extension.
- **Why:** To respect your preference across sessions.
- **Storage:** Persisted **locally** via the browser’s extension storage (`storage.local`).
- **Transmission:** **Not transmitted** outside your device.

### 5) User-Supplied Messages

- **What:** Messages you compose to send to the page’s WebSocket client and/or server.
- **Why:** To test or interact with live WebSocket connections.
- **Storage:** **Ephemeral**; **not persisted** by the extension.
- **Transmission:** Only to the **destination(s) you choose** via the page’s WebSocket connection. Socket Inspector does **not** transmit these messages to the extension developer or any third-party server unless **you** direct them there.

### 6) Other User-Supplied Input (UI Interactions)

- **What:** Filter text, toggle states, button clicks, and other UI state needed to operate the DevTools panel.
- **Why:** To render and control the panel.
- **Storage:** **Ephemeral**; **not persisted**.
- **Transmission:** **Not transmitted** outside your device.

---

## Permissions & Access (Browser extension)

Socket Inspector requests only the access required to provide its features:

- **Host permissions (e.g., `*://*/*`)**
  - Socket Inspector allows the user to debug WebSocket traffic on any page
  - These host permissions allow Socket Inspector to observe WebSocket traffic on any page and display it in the DevTools panel
  - These permissions are not used to collect browsing history or transmit page contents
- **Extension storage (`storage`)**
  - The `storage` permission allows Socket Inspector to save the user's decision to enable/disable the extension

We do not use these permissions to collect browsing history, track you, or transmit page contents to our servers or any third party.

---

## How We Use and Don’t Use Data (Browser extension)

All data is processed locally on your device for the sole purpose of providing the extension's debugging features. This processing is necessary to deliver the functionality you request when you install and use the tool.

- **Use:** Provide the debugging features you request.
- **No telemetry/analytics:** We do **not** collect analytics, error reports, or advertising identifiers.
- **No sale/sharing:** We do **not** sell or “share” personal information.
- **No ads/tracking:** We do **not** use data for ads, profiling, or cross-site tracking.
- **No third‑party transfers (extension data)**: The extension does **not** transmit your page data to us or to any third party. If you email us for support, those messages are processed by our email/help‑desk providers as described in the Contact section below.

---

## Retention (Browser extension)

- **Ephemeral data** (WebSocket traffic, Tab IDs, UI state) exists only in memory during active use and is discarded when the page or DevTools panel is closed/refreshed.
- The **enable/disable** preference remains in `storage.local` until you change it, clear browser data, or uninstall the extension.

---

## Security (Browser extension)

- Processing is limited to your device.
- Minimal local storage (`storage.local` for a single preference).
- No extension-level network transmission of your WebSocket data.
- We rely on modern browser extension architecture and OS sandboxing for isolation.

> **Note:** Messages you elect to send will travel over the website’s WebSocket connection according to that site’s network/security posture. Review those sites’ policies before sending sensitive data.

---

## Website Privacy Notice (`socketinspector.com`)

This section explains how we handle information on `socketinspector.com` (the “Site”). For the **browser extension**, see the sections above.

### Notice at Collection (California / U.S. State Laws)

**Categories collected:** Identifiers (IP address), Internet/network activity (pages requested, referrer), and device/technical information (browser/user agent, request metadata) generated when you load pages on our Site.  
**Sensitive personal information:** **Not collected.**  
**Purposes:** Deliver Site content via our CDN/hosting provider, maintain security/anti‑abuse, measure availability, and troubleshoot incidents.  
**Sale/Sharing:** We **do not** sell or “share” personal information for cross‑context behavioral advertising.

**Retention**

- **Server logs (IP address, user agent, referrer, request metadata)** processed by our hosting/CDN (Cloudflare) are retained **no longer than 30 days**. We may retain specific log entries longer **solely** to investigate security/abuse or comply with law, after which they are deleted or aggregated.
- **Support emails and other contact communications (email address, message content, headers/metadata)** are retained **up to 12 months** for support and recordkeeping, longer only if required by law.
- **Privacy rights requests and appeals (your request, our verification, our response)** are retained **24 months** to meet record‑keeping rules.
- **Security/breach/incident records** are retained **at least 24 months** (or longer if required by applicable law).

**Your rights:** See **Your Data Rights & Controls** below; if we ever deny a request, you may **appeal** by emailing **support@socketinspector.com** with subject “Privacy Appeal.”  
**Links:** This Notice at Collection is part of our full **Privacy Policy** and is available at or before collection on the Site.

### What we collect on the Site

- **Server logs:** Our hosting/CDN provider (Cloudflare) automatically processes standard logs (e.g., IP address, user agent, referrer, date/time, pages requested) to operate, secure, and troubleshoot the Site. **Logs are retained no longer than 30 days** (see _Retention_ above).
- **Contact/support:** If you email **support@socketinspector.com**, we process your email address, message, and metadata to respond and maintain records.
- **Cookies/analytics:** We avoid non‑essential cookies. If we deploy analytics or other non‑essential cookies in the future, we will update this notice (and, where required, request your consent before setting them).

### How we use Site information

- Operate, secure, and improve the Site; respond to inquiries; comply with legal obligations.
- We **do not sell or share** personal information for cross‑context behavioral advertising. _(If we ever begin selling or sharing personal information, we will provide the required opt‑out and honor Global Privacy Control (GPC) signals.)_

### Sharing/Processors (Site)

- We use service providers (e.g., hosting, email/help desk) under contracts that limit their use of personal information. **We remain responsible for personal information handled by our service providers and require a comparable level of protection.**

### Your choices and rights (Site)

- You can reach us at **support@socketinspector.com** to request access, correction, or deletion of personal information we hold about you from Site interactions (typically support emails and limited logs). _(As an online‑only service, this email channel is a designated method for requests; we may add a web form in the future.)_
- If you are in the EEA/UK, we rely on **legitimate interests** for essential logs and **consent** for any non‑essential cookies/analytics (if used). You may withdraw consent at any time.

### Data retention (Site)

For retention details, see **Notice at Collection → Retention** above. In short: **server logs no longer than 30 days**; **support emails up to 12 months**; **privacy request records 24 months**; **security/incident records at least 24 months**.

---

## Your Data Rights and Controls

This section explains your privacy choices for both the **Socket Inspector browser extension** (local-only processing) and the `socketinspector.com` website.

### Extension (local-only processing)

- **What we store:** The extension persists only your **enable/disable** preference in the browser’s `storage.local`.
- **What we don’t store:** WebSocket traffic, tab IDs, UI state, and messages you compose are processed **in memory** and are **not persisted** by the extension or sent to our servers.
- **How to control or erase extension data:**
  - Disable or **uninstall** the extension in your browser to stop all processing.
  - Clear the extension’s local data via your browser’s “Clear browsing data” or extension storage tools.
  - Use the browser’s **site access controls** to restrict where the extension can run.

### Website (socketinspector.com)

Depending on your jurisdiction, you may have the rights to **access**, **correct**, **delete**, **restrict or object to processing**, and/or **receive a portable copy** of personal information we hold from Site interactions (typically support emails and short-lived server logs). We do **not** sell or “share” personal information for cross-context behavioral advertising.

**Withdraw consent:** Where we rely on consent (for example, for non-essential cookies or optional features), you may withdraw that consent at any time. Withdrawing consent does not affect processing that has already occurred, but we will stop the relevant processing going forward.

**How to make a request:** Email `support@socketinspector.com` with the subject **“Privacy Request.”** Include:  
(i) what you’re requesting (access/correction/deletion/etc.),  
(ii) the email address you used to contact us (and any dates/topics of prior emails, if relevant), and  
(iii) your country/state of residence.

**Verification:** Because we don’t have accounts, we’ll generally verify by asking you to reply from the same email address or provide reasonable additional information. **Authorized agents** may submit requests if they provide proof of authority and we can verify the consumer.

**Response times:** We respond within the timelines required by applicable law (in many jurisdictions **within ~45 days**, with extensions where permitted).

**Non-discrimination:** We won’t deny services, charge different prices, or provide a different level/quality of service because you exercised your privacy rights.

### Appeals (U.S. state privacy laws)

If we decline your privacy request (in whole or in part), you may **appeal** our decision.

- **How to appeal:** Email `support@socketinspector.com` with subject **“Privacy Appeal.”** Include your name, the email used for the original request, the date of our decision (and any request ID), your U.S. state of residence, and why you believe our decision was incorrect.
- **Our timeline:** We will respond to your appeal **in writing within the shortest applicable statutory timeframe (generally 45–60 days)**. If an extension is permitted and reasonably necessary, we’ll notify you within the initial period with the reason.
- **If your appeal is denied:** We will tell you **how to contact your state Attorney General** to submit a complaint.
- **Channel & cost:** Appeals use the **same channel** as our rights requests. We do not charge a fee unless a request is manifestly unfounded, excessive, or repetitive as allowed by law.

### Notes on scope

- Because the **extension** processes data locally on your device and we **don’t receive** your page data, there’s usually no server-side data of yours for us to access, correct, export, or delete.
- For the **website**, our typical records are limited to support emails and short-lived request logs retained by our hosting/CDN for security and reliability.
- Additional country/state details (e.g., Canada/PIPEDA, Québec Law 25, Australia APPs, New Zealand Privacy Act, India DPDP) appear in **Regional Information** below.

---

## Children’s Privacy (Extension & Site)

Socket Inspector is a developer tool and is **not intended for children** under 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children. In India, ‘children’ means persons under 18; elsewhere, under 13 or local minimum.

---

## Changes to This Policy

We may update this policy to reflect feature or legal changes. We will update the **Effective Date** and **Policy Version** above. Material changes will be summarized in the changelog.

---

## Contact

**Publisher/Owner:** _Trey Vigus_  
**Email:** _support@socketinspector.com_

If you email us at support@socketinspector.com, we process your email address, message content, and any metadata your provider includes. We use this information only to respond to you and maintain records required by law. We store these emails in our help inbox and email systems (which may be hosted outside your country). We apply contractual and technical safeguards with those providers and do not sell or share this information for advertising. We delete or anonymize support threads when no longer needed, unless we must retain them to comply with legal obligations.

---

## Regional Information (Extension & Site)

**United States (state privacy laws)**: We do not “sell” or “share” personal information for cross‑context behavioral advertising and we do not use personal information for targeted ads. If we ever begin selling or sharing personal information, we will provide a “Do Not Sell or Share My Personal Information” control and honor browser Global Privacy Control (GPC) signals as required. Today, because we do not sell or share personal information, there is no opt‑out to exercise. For support emails, you may request access, correction, or deletion by contacting us at support@socketinspector.com

**Australia (Privacy Act 1988 (Cth))**: We comply with the Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs) to the extent applicable. We collect and use only the minimal information necessary to operate the extension and provide user support. Any support-related data you send (e.g., emails) is processed solely to respond to your request and is not shared with third parties for marketing or analytics. Note: Under the Privacy Act 1988 (Cth), many small businesses with an annual turnover below AUD 3 million are ordinarily exempt unless specific conditions apply (for example, health service providers or entities trading in personal information). If the Act applies to us, we will fully comply with the APPs and the Notifiable Data Breaches (NDB) scheme, including assessing any eligible breach within roughly 30 days and notifying affected individuals and the Office of the Australian Information Commissioner (OAIC) where required.

**New Zealand**: We comply with the Privacy Act 2020. You have rights to access and correct personal information we hold (e.g., support emails). We notify the Privacy Commissioner and affected individuals as soon as practicable for notifiable breaches; the Commissioner’s guidance expects notification within ~72 hours where practicable. To complain, see the Privacy Commissioner website. We designate a Privacy Officer responsible for our NZ Privacy Act 2020 compliance: _Privacy Officer (Socket Inspector) — support@socketinspector.com_

**Canada**:
We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and relevant provincial laws, including Québec’s Law 25.

- **Federal (PIPEDA)**: When we use service providers (for example, for email hosting), transfers are considered for processing and treated as a use, not a disclosure. We remain accountable for your personal information and apply contractual and technical safeguards to protect it. We maintain a record of every breach of security safeguards for 24 months and report and notify any breach that presents a real risk of significant harm as soon as feasible after becoming aware of it.
- **Québec (Law 25)**: We assess privacy risks when using service providers located outside Québec and maintain a record of confidentiality incidents. If an incident poses a risk of serious injury, we promptly notify the Commission d’accès à l’information (CAI) and affected individuals. We designate a privacy contact responsible for Law 25 compliance (support@socketinspector.com).

**India (DPDP Act 2023)**: We comply with the Digital Personal Data Protection Act, 2023 and applicable rules. Children: Socket Inspector is not intended for persons under 18 in India. Grievances: Indian users can contact our Grievance Contact at support@socketinspector.com. We provide readily available means of grievance redressal and will handle requests for access, correction, or erasure in line with the Act and implementing rules. Cross‑border transfers: The Act permits cross‑border transfers except to countries that may be restricted by government notification; if restrictions are issued, we will update this policy. Breach notice (DPDP Act): If a personal data breach affects any personal data we hold (e.g., support emails), we will give intimation to the Data Protection Board of India and each affected individual in the form and manner prescribed under Section 8(6) of the DPDP Act.

**UK and EEA (GDPR / UK GDPR)**

- **Controller:** Trey Vigus is the data controller for the personal information collected via socketinspector.com and support channels.
- **Legal Basis for Processing:** We process your personal data based on the following legal grounds:
  - _Performance of a Contract:_ To provide the Socket Inspector extension functionality and deliver the website content you request.
  - _Legitimate Interests:_ To secure our website (server logs), prevent fraud, and respond to your support inquiries.
  - _Consent:_ If we request specific permission for non-essential cookies or optional features (currently none). You can withdraw this consent at any time, for example by changing your cookie settings or contacting us at support@socketinspector.com
- **Your Rights:** Under the UK GDPR and EU GDPR, you have the right to **access**, **rectify**, **erase**, **restrict processing**, **object to processing**, and receive a **portable** copy of your data.
- **How to Exercise Rights:** Contact us at support@socketinspector.com. We will respond within one month.
- **Right to Complain:** You have the right to lodge a complaint with a supervisory authority. In the UK, this is the **Information Commissioner’s Office (ICO)** (ico.org.uk). In the EEA, you may contact your local Data Protection Authority.
- **International Transfers:** We are located in the United States. If you are accessing the Site or Extension from the UK or EEA, please note that your personal data (such as support emails or website connection logs) may be transferred to and processed in the United States. We rely on mechanisms such as Adequacy Decisions (where applicable) or Standard Contractual Clauses (SCCs) to ensure your data remains protected.
- **Automated Decision Making:** We do not use automated decision-making or profiling that produces legal or similarly significant effects concerning you.
