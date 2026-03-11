const nodemailer = require("nodemailer");

/**
 * notificationService
 * Handles sending emails to the admin for order events.
 *
 * Requirements: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL in .env
 */

const createTransporter = () => {
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  // Strip surrounding whitespace AND quotes (some deployment panels wrap values in quotes)
  const smtpPass = (process.env.SMTP_PASS || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");

  // Gmail: use the built-in service preset (port 465 SSL) which is
  // allowed on virtually all cloud hosting platforms.
  // Manual port 587 / requireTLS is frequently blocked by providers.
  const host = (process.env.SMTP_HOST || "").toLowerCase();
  const user = (process.env.SMTP_USER || "").toLowerCase();
  if (host.includes("gmail") || user.endsWith("@gmail.com")) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: smtpPass,
      },
      tls: {
        servername: "smtp.gmail.com",
        rejectUnauthorized: false,
      },
      // Prefer IPv4 in hosted environments where IPv6 routes can stall.
      family: 4,
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 12000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
  });
};

let transporterCache = null;

const getTransporter = () => {
  // Always create a fresh transporter — avoids stale/broken cached connections in production.
  return createTransporter();
};

const hasSmtpConfig = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `[EMAIL] Missing SMTP environment variables: ${missing.join(", ")}. Email notifications are disabled.`,
    );
    return false;
  }

  return true;
};

const getFromAddress = () => {
  return process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
};

const hasResendConfig = () => {
  return !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL;
};

const hasEmailConfig = () => {
  return hasResendConfig() || hasSmtpConfig();
};

const sendViaResend = async (mailOptions) => {
  const timeoutMs = Number(process.env.RESEND_TIMEOUT_MS || 15000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: Array.isArray(mailOptions.to) ? mailOptions.to : [mailOptions.to],
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
      }),
      signal: controller.signal,
    });

    const bodyText = await response.text();
    let body = {};
    try {
      body = bodyText ? JSON.parse(bodyText) : {};
    } catch {
      body = { raw: bodyText };
    }

    if (!response.ok) {
      return {
        ok: false,
        error: body.message || "Resend API request failed",
        code: `RESEND_${response.status}`,
      };
    }

    return { ok: true, id: body.id };
  } catch (error) {
    if (error.name === "AbortError") {
      return { ok: false, error: "Resend timeout", code: "RESEND_TIMEOUT" };
    }
    return { ok: false, error: error.message, code: error.code };
  } finally {
    clearTimeout(timeout);
  }
};

const sendEmail = async (mailOptions, contextLabel) => {
  if (hasResendConfig()) {
    const resendResult = await sendViaResend(mailOptions);
    if (resendResult.ok) {
      console.log(`[EMAIL] ${contextLabel} sent via Resend.`);
      return { ok: true, provider: "resend", id: resendResult.id };
    }

    console.error(
      `[EMAIL] Resend failed for ${contextLabel}: ${resendResult.code || "ERROR"} ${resendResult.error}`,
    );
    if (!hasSmtpConfig()) {
      return { ok: false, provider: "resend", ...resendResult };
    }
    console.warn(`[EMAIL] Falling back to SMTP for ${contextLabel}.`);
  }

  if (!hasSmtpConfig()) {
    return { ok: false, error: "Missing email provider configuration" };
  }

  const transporter = getTransporter();
  const info = await transporter.sendMail(mailOptions);
  return {
    ok: true,
    provider: "smtp",
    messageId: info.messageId,
    accepted: info.accepted,
  };
};

// Verify transporter on startup
const verifyConnection = async () => {
  if (hasResendConfig()) {
    console.log("[EMAIL] Resend API is configured for outgoing email.");
    return;
  }

  if (!hasSmtpConfig()) return;

  const transporter = getTransporter();
  try {
    await transporter.verify();
    console.log("[EMAIL] SMTP server is ready to send messages");
    console.log(
      `[EMAIL] Config: host=${process.env.SMTP_HOST} port=${process.env.SMTP_PORT} user=${process.env.SMTP_USER}`,
    );
  } catch (error) {
    console.error("[EMAIL] SMTP verification error:", error.message);
    console.error("[EMAIL] Error code:", error.code);
    console.error(
      `[EMAIL] Config: host=${process.env.SMTP_HOST} port=${process.env.SMTP_PORT} user=${process.env.SMTP_USER} passSet=${!!(process.env.SMTP_PASS || "").trim()}`,
    );
    console.error(
      "[EMAIL] Check deployment env vars, SMTP credentials, firewall/port access, and provider security settings.",
    );
  }
};
verifyConnection();

const sendWhatsappAlert = async (message) => {
  const adminPhone = process.env.ADMIN_PHONE;
  // We encourage using a simple HTTP API gateway for WhatsApp (like CallMeBot)
  // Example URL in .env: https://api.callmebot.com/whatsapp.php?phone=[phone]&apikey=[key]&text=[text]
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL;

  if (!gatewayUrl) {
    return;
  }

  try {
    const finalUrl = gatewayUrl
      .replace("[phone]", encodeURIComponent(adminPhone))
      .replace("[text]", encodeURIComponent(message));

    const https = require("https");
    https.get(finalUrl, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ WhatsApp alert sent successfully.");
      } else {
        console.error("❌ WhatsApp alert failed with status:", res.statusCode);
      }
    });
  } catch (err) {
    console.error("❌ Error sending WhatsApp alert:", err.message);
  }
};

const sendOrderInitiatedEmail = async (order) => {
  try {
    if (!hasEmailConfig()) return;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("[EMAIL] ADMIN_EMAIL is missing. Skipping order initiated email.");
      return;
    }

    const mailOptions = {
      from: `"UrbanDos Payments" <${getFromAddress()}>`,
      to: adminEmail,
      subject: `🆕 New Order Initiated - ₹${order.totalAmount}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #333; text-transform: uppercase;">New Order Started</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Shipping Method:</strong> ${order.shippingMethod}</p>
          <hr />
          <h3>Items:</h3>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${order.items
              .map(
                (item) => `
              <div style="display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                ${item.image ? `<img src="${item.image}" width="40" height="50" style="object-fit: cover; border-radius: 4px;" />` : ""}
                <div>
                  <p style="margin: 0; font-size: 14px;"><strong>${item.name}</strong> (${item.size})</p>
                  <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${item.quantity} - ₹${item.price * item.quantity}</p>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
          <hr />
          <h3>Customer Details:</h3>
          <p><strong>Name:</strong> ${order.customerDetails.name}</p>
          <p><strong>Phone:</strong> ${order.customerDetails.phone}</p>
          <p><strong>Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pinCode}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated notification. Payment is currently <strong>PENDING</strong>.</p>
        </div>
      `,
    };

    await sendEmail(mailOptions, "order initiated email");
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order initiated email:",
      error.code || error.message,
    );
  }
};

const sendUserClaimsPaidEmail = async (order) => {
  try {
    if (!hasEmailConfig()) return;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("[EMAIL] ADMIN_EMAIL is missing. Skipping payment-claim email.");
      return;
    }

    const waLink = `https://wa.me/${order.customerDetails.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi ${order.customerDetails.name}, your order ${order._id.toString().slice(-8)} for ₹${order.totalAmount} has been confirmed! 🚀`,
    )}`;

    const mailOptions = {
      from: `"UrbanDos Payments" <${getFromAddress()}>`,
      to: adminEmail,
      subject: `💰 Payment Confirmation Requested - ${order.customerDetails.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #27ae60; text-transform: uppercase;">User Claims Payment Made</h2>
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>User:</strong> ${order.customerDetails.name}</p>
          <p><strong>Amount:</strong> ₹${order.totalAmount}</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px; text-align: center;">
            <p style="margin-bottom: 20px;"><strong>Action Required:</strong> Verify the payment in your UPI/Bank app, then click below to notify the customer:</p>
            <a href="${waLink}" style="background-color: #25D366; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              CONFIRM VIA WHATSAPP
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">Once you confirm via WhatsApp, please remember to update the order status to <strong>SUCCESS</strong> in your database/dashboard.</p>
        </div>
      `,
    };

    await sendEmail(mailOptions, "payment-claim email");
  } catch (error) {
    console.error(
      "[EMAIL] Error sending user claims paid email:",
      error.code || error.message,
    );
  }
};

const sendOrderConfirmedEmail = async (order) => {
  try {
    if (!hasEmailConfig()) return;
    const customerEmail =
      order.customerDetails?.email || order.shippingAddress?.email;

    if (!customerEmail) {
      console.warn("⚠️ No customer email found for order:", order._id);
      return;
    }

    const mailOptions = {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `✅ Order Confirmed! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #27ae60; text-transform: uppercase;">Payment Confirmed!</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>We've verified your payment for Order <strong>#${order._id.toString().slice(-8)}</strong>. Your order is now being processed and will be shipped soon! 🚀</p>
          <hr />
          <h3>Order Summary:</h3>
          <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
          <p><strong>Shipping to:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
          <p style="font-size: 12px; color: #666;">This is an automated confirmation of your manual payment verification.</p>
        </div>
      `,
    };

    await sendEmail(mailOptions, "order confirmation email");
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order confirmation email:",
      error.code || error.message,
    );
  }
};

const sendOrderDispatchedEmail = async (order) => {
  try {
    if (!hasEmailConfig()) return;
    const customerEmail =
      order.customerDetails?.email || order.shippingAddress?.email;

    if (!customerEmail) {
      console.warn("⚠️ No customer email found for order:", order._id);
      return;
    }

    const mailOptions = {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: customerEmail,
      subject: `🚚 Your Order is being Prepared for Dispatch! #${order._id.toString().slice(-8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #f39c12; text-transform: uppercase;">Preparing For Dispatch</h2>
          <p>Hi ${order.customerDetails.name},</p>
          <p>Great news! Your order <strong>#${order._id.toString().slice(-8)}</strong> is currently being prepared for dispatch.</p>
          <p>You will receive another update once the package has physically shipped to your location.</p>
          <hr />
          <h3>Shipping to:</h3>
          <p>${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pinCode}</p>
          <hr />
          <p>Thank you for shopping with UrbanDos!</p>
        </div>
      `,
    };

    await sendEmail(mailOptions, "dispatch notification email");
  } catch (error) {
    console.error(
      "[EMAIL] Error sending order dispatch email:",
      error.code || error.message,
    );
  }
};

// Export for health-check route in server.js
const verifyEmailConfig = async () => {
  if (!hasEmailConfig()) {
    return {
      ok: false,
      error: "Missing email provider configuration",
      config: {
        host: process.env.SMTP_HOST || "(not set)",
        port: process.env.SMTP_PORT || "(not set)",
        user: process.env.SMTP_USER || "(not set)",
        adminEmail: process.env.ADMIN_EMAIL || "(not set)",
        passSet: !!(process.env.SMTP_PASS || "").trim(),
        resendKeySet: !!process.env.RESEND_API_KEY,
        resendFrom: process.env.RESEND_FROM_EMAIL || "(not set)",
      },
    };
  }

  // Just return config without verifying connection (verify() times out on cloud providers).
  // Use /api/health/email/test to actually send a test email instead.
  return {
    ok: true,
    status: "Config loaded. Use /api/health/email/test to send a test email.",
    provider: hasResendConfig() ? "resend" : "smtp",
    config: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER,
      adminEmail: process.env.ADMIN_EMAIL,
      passSet: !!(process.env.SMTP_PASS || "").trim(),
      resendKeySet: !!process.env.RESEND_API_KEY,
      resendFrom: process.env.RESEND_FROM_EMAIL || "(not set)",
    },
  };
};

const sendTestEmail = async (to) => {
  if (!hasEmailConfig()) {
    return { ok: false, error: "Missing email provider configuration" };
  }

  try {
    const target = to || process.env.ADMIN_EMAIL;

    if (!target) {
      return { ok: false, error: "Missing target email and ADMIN_EMAIL" };
    }

    const emailPromise = sendEmail(
      {
      from: `"UrbanDos" <${getFromAddress()}>`,
      to: target,
      subject: "UrbanDos SMTP Test",
      text: "SMTP test successful from deployed backend.",
      html: "<p><strong>SMTP test successful</strong> from deployed backend.</p>",
      },
      "health test email",
    );

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email send timeout (30s)")), 30000),
    );

    const result = await Promise.race([emailPromise, timeoutPromise]);
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err.message, code: err.code };
  }
};

module.exports = {
  sendOrderInitiatedEmail,
  sendUserClaimsPaidEmail,
  sendOrderConfirmedEmail,
  sendOrderDispatchedEmail,
  sendWhatsappAlert,
  verifyEmailConfig,
  sendTestEmail,
};
