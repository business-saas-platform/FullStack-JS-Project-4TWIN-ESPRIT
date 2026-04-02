import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from "nodemailer";

// =====================================================
// TYPES
// =====================================================
type InviteEmailParams = {
  to: string;
  name: string;
  businessName: string;
  inviterEmail: string;
  inviteLink: string;

  // ✅ NEW
  role: string;
  permissions: string[];
};

type OwnerApprovedEmailParams = {
  to: string;
  name: string;
  companyName: string;
  email: string;
  tempPassword: string;
  loginUrl?: string;
};

type OwnerRejectedEmailParams = {
  to: string;
  name: string;
  companyName: string;
  reason: string;
};

type EmployeeCreatedEmailParams = {
  to: string;
  name: string;
  companyName: string;
  role: string;
  email: string;
  tempPassword: string;
  loginUrl?: string;
};

// =====================================================
// SERVICE
// =====================================================
@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT || 587),
      secure: false, // true فقط مع port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // =====================================================
  // OPTIONAL: verify SMTP config
  // =====================================================
  async verifyConnection() {
    try {
      await this.transporter.verify();
      return { ok: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `SMTP verify failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  // =====================================================
  // INVITE TEMPLATE (✅ includes role + permissions)
  // =====================================================
  private buildInviteTemplate(params: InviteEmailParams) {
    const { name, businessName, inviterEmail, inviteLink, role, permissions } =
      params;
    const year = new Date().getFullYear();

    const permsHtml =
      permissions && permissions.length
        ? `<ul style="margin:10px 0 0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7;">
             ${permissions
               .map((p) => `<li>${this.escapeHtml(p)}</li>`)
               .join("")}
           </ul>`
        : `<p style="margin:8px 0 0;font-size:14px;color:#6b7280;"><i>Aucune permission spécifique</i></p>`;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 5px 20px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(90deg,#4f46e5,#6366f1);
                       padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:22px;">Business Management Platform</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.92;">
                Team Collaboration & Financial Management
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;color:#111827;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                Bonjour ${this.escapeHtml(name)},
              </h2>

              <p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#374151;">
                <b>${this.escapeHtml(inviterEmail)}</b> vous a invité à rejoindre l’équipe de
                <b style="color:#4f46e5;">${this.escapeHtml(
                  businessName
                )}</b> sur notre plateforme.
              </p>

              <!-- ✅ role + permissions -->
              <div style="margin:16px 0 18px;padding:14px 16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                <p style="margin:0;font-size:14px;color:#111827;">
                  <b>Rôle :</b> ${this.escapeHtml(role)}
                </p>
                <p style="margin:10px 0 6px;font-size:14px;color:#111827;">
                  <b>Permissions :</b>
                </p>
                ${permsHtml}
              </div>

              <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;">
                Accédez à votre espace sécurisé pour collaborer, gérer les factures, les dépenses
                et les membres de l’entreprise.
              </p>

              <div style="text-align:center;margin:26px 0 22px;">
                <a href="${inviteLink}"
                   style="background:#4f46e5;color:#ffffff;padding:14px 26px;
                          text-decoration:none;border-radius:8px;font-weight:bold;
                          display:inline-block;font-size:14px;">
                  Accepter l'invitation
                </a>
              </div>

              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b7280;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
              </p>

              <p style="margin:0;font-size:13px;line-height:1.6;color:#4f46e5;word-break:break-all;">
                ${inviteLink}
              </p>

              <p style="margin:26px 0 0;font-size:14px;color:#374151;">
                Bienvenue dans l’équipe 🚀
              </p>
            </td>
          </tr>

          <tr><td style="height:1px;background:#e5e7eb;"></td></tr>

          <tr>
            <td style="padding:22px 30px;font-size:12px;color:#6b7280;text-align:center;">
              <p style="margin:0;">© ${year} Business Management Platform. Tous droits réservés.</p>
              <p style="margin:8px 0 0;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // =====================================================
  // OWNER APPROVED TEMPLATE (temp password)
  // =====================================================
  private buildOwnerApprovedTemplate(params: OwnerApprovedEmailParams) {
    const { name, companyName, email, tempPassword, loginUrl } = params;
    const year = new Date().getFullYear();
    const safeLoginUrl =
      loginUrl ||
      process.env.APP_LOGIN_URL ||
      "http://localhost:5173/auth/login";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscription acceptée</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 5px 20px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(90deg,#16a34a,#22c55e);
                       padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:22px;">Business Management Platform</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.92;">
                Inscription approuvée
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;color:#111827;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                Bonjour ${this.escapeHtml(name)},
              </h2>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                Votre demande d’inscription pour <b style="color:#16a34a;">${this.escapeHtml(
                  companyName
                )}</b> a été <b>acceptée</b>.
              </p>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                Voici vos informations de connexion :
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#111827;">
                    <b>Email:</b> ${this.escapeHtml(email)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#111827;">
                    <b>Mot de passe temporaire:</b> ${this.escapeHtml(tempPassword)}
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#b91c1c;">
                <b>Important :</b> vous devez changer ce mot de passe lors de votre première connexion.
              </p>

              <div style="text-align:center;margin:26px 0 10px;">
                <a href="${safeLoginUrl}"
                   style="background:#16a34a;color:#ffffff;padding:14px 26px;
                          text-decoration:none;border-radius:8px;font-weight:bold;
                          display:inline-block;font-size:14px;">
                  Se connecter
                </a>
              </div>

              <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
                Si le bouton ne fonctionne pas : ${safeLoginUrl}
              </p>
            </td>
          </tr>

          <tr><td style="height:1px;background:#e5e7eb;"></td></tr>

          <tr>
            <td style="padding:22px 30px;font-size:12px;color:#6b7280;text-align:center;">
              <p style="margin:0;">© ${year} Business Management Platform. Tous droits réservés.</p>
              <p style="margin:8px 0 0;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // =====================================================
  // OWNER REJECTED TEMPLATE
  // =====================================================
  private buildOwnerRejectedTemplate(params: OwnerRejectedEmailParams) {
    const { name, companyName, reason } = params;
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Inscription refusée</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 5px 20px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(90deg,#b91c1c,#ef4444);
                       padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:22px;">Business Management Platform</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.92;">
                Inscription refusée
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;color:#111827;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                Bonjour ${this.escapeHtml(name)},
              </h2>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                Votre demande d’inscription pour <b style="color:#b91c1c;">${this.escapeHtml(
                  companyName
                )}</b> a été <b>refusée</b>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#9a3412;">
                    <b>Raison :</b> ${this.escapeHtml(reason)}
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:14px;line-height:1.7;color:#374151;">
                Vous pouvez corriger vos informations et soumettre une nouvelle demande.
              </p>
            </td>
          </tr>

          <tr><td style="height:1px;background:#e5e7eb;"></td></tr>

          <tr>
            <td style="padding:22px 30px;font-size:12px;color:#6b7280;text-align:center;">
              <p style="margin:0;">© ${year} Business Management Platform. Tous droits réservés.</p>
              <p style="margin:8px 0 0;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // =====================================================
  // EMPLOYEE CREATED TEMPLATE (temp password + role)
  // =====================================================
  private buildEmployeeCreatedTemplate(params: EmployeeCreatedEmailParams) {
    const { name, companyName, role, email, tempPassword, loginUrl } = params;
    const year = new Date().getFullYear();
    const safeLoginUrl =
      loginUrl ||
      process.env.APP_LOGIN_URL ||
      "http://localhost:5173/auth/login";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compte créé</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;
                      box-shadow:0 5px 20px rgba(0,0,0,0.06);">

          <tr>
            <td style="background:linear-gradient(90deg,#0ea5e9,#38bdf8);
                       padding:30px;text-align:center;color:white;">
              <h1 style="margin:0;font-size:22px;">Business Management Platform</h1>
              <p style="margin:6px 0 0;font-size:14px;opacity:0.92;">
                Votre compte a été créé
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 30px;color:#111827;">
              <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                Bonjour ${this.escapeHtml(name)},
              </h2>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                Un compte a été créé pour vous chez <b style="color:#0ea5e9;">${this.escapeHtml(
                  companyName
                )}</b>.
              </p>

              <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#374151;">
                <b>Rôle :</b> ${this.escapeHtml(role)}
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#111827;">
                    <b>Email:</b> ${this.escapeHtml(email)}
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;font-size:14px;color:#111827;">
                    <b>Mot de passe temporaire:</b> ${this.escapeHtml(tempPassword)}
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#b91c1c;">
                <b>Important :</b> vous devez changer ce mot de passe lors de votre première connexion.
              </p>

              <div style="text-align:center;margin:26px 0 10px;">
                <a href="${safeLoginUrl}"
                   style="background:#0ea5e9;color:#ffffff;padding:14px 26px;
                          text-decoration:none;border-radius:8px;font-weight:bold;
                          display:inline-block;font-size:14px;">
                  Se connecter
                </a>
              </div>

              <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;text-align:center;">
                Si le bouton ne fonctionne pas : ${safeLoginUrl}
              </p>
            </td>
          </tr>

          <tr><td style="height:1px;background:#e5e7eb;"></td></tr>

          <tr>
            <td style="padding:22px 30px;font-size:12px;color:#6b7280;text-align:center;">
              <p style="margin:0;">© ${year} Business Management Platform. Tous droits réservés.</p>
              <p style="margin:8px 0 0;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // =====================================================
  // ESCAPE HTML (security)
  // =====================================================
  private escapeHtml(input: string) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =====================================================
  // SENDERS
  // =====================================================
  async sendInviteEmail(params: InviteEmailParams) {
    try {
      const html = this.buildInviteTemplate(params);

      await this.transporter.sendMail({
        from: `"Business SaaS" <${process.env.MAIL_USER}>`,
        to: params.to,
        subject: `Invitation à rejoindre ${params.businessName}`,
        html,
      });

      return { ok: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Invite email failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  async sendOwnerApprovedEmail(params: OwnerApprovedEmailParams) {
    try {
      const html = this.buildOwnerApprovedTemplate(params);

      await this.transporter.sendMail({
        from: `"Business SaaS" <${process.env.MAIL_USER}>`,
        to: params.to,
        subject: `Inscription acceptée - ${params.companyName}`,
        html,
      });

      return { ok: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Owner approved email failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  async sendOwnerRejectedEmail(params: OwnerRejectedEmailParams) {
    try {
      const html = this.buildOwnerRejectedTemplate(params);

      await this.transporter.sendMail({
        from: `"Business SaaS" <${process.env.MAIL_USER}>`,
        to: params.to,
        subject: `Inscription refusée - ${params.companyName}`,
        html,
      });

      return { ok: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Owner rejected email failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  async sendEmployeeCreatedEmail(params: EmployeeCreatedEmailParams) {
    try {
      const html = this.buildEmployeeCreatedTemplate(params);

      await this.transporter.sendMail({
        from: `"Business SaaS" <${process.env.MAIL_USER}>`,
        to: params.to,
        subject: `Votre compte (${params.role}) - ${params.companyName}`,
        html,
      });

      return { ok: true };
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Employee created email failed: ${err?.message || "Unknown error"}`
      );
    }
  }
}