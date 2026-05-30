/**
 * Future Ready Customer Support Service Modules
 * Email integration via EmailJS and SMS integration via Twilio
 */

// EmailJS Integration Template
export const sendSupportEmail = async (supportRequest) => {
  const { name, email, message } = supportRequest;
  
  console.log("📨 Sending support ticket email via EmailJS...", { name, email, message });
  
  // In production, configure EmailJS credentials in .env:
  const SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_support";
  const TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_ticket";
  const PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "YOUR_EMAILJS_PUBLIC_KEY";

  if (PUBLIC_KEY === "YOUR_EMAILJS_PUBLIC_KEY") {
    // Graceful Simulated mode for development
    console.log("ℹ️ Running in email simulation mode. Support request received successfully!");
    return { success: true, message: "Simulated support email sent successfully" };
  }

  try {
    // Dynamic import to avoid loading external SDKs unnecessarily in development
    const emailjs = await import('@emailjs/browser');
    const result = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      {
        from_name: name,
        reply_to: email,
        message: message,
      },
      PUBLIC_KEY
    );
    console.log("✅ Email sent successfully via EmailJS:", result.text);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Failed to send support email via EmailJS:", error);
    return { success: false, error };
  }
};

// Twilio SMS Integration Template (Normally dispatched via backend endpoint for security keys isolation)
export const sendSupportSMS = async (smsRequest) => {
  const { phoneNumber, text } = smsRequest;
  
  console.log("📱 Sending support SMS notification via Twilio API...", { phoneNumber, text });
  
  // Twilio client credentials (backend configuration recommended)
  const ACCOUNT_SID = process.env.REACT_APP_TWILIO_ACCOUNT_SID || "ACxxxxxx";
  const AUTH_TOKEN = process.env.REACT_APP_TWILIO_AUTH_TOKEN || "token_xxxx";

  if (ACCOUNT_SID === "ACxxxxxx") {
    console.log("ℹ️ Running in SMS simulation mode. Notification sent successfully!");
    return { success: true, message: "Simulated SMS notification sent successfully" };
  }

  try {
    // Twilio SMS normally sent via Backend endpoint to safeguard Auth Token
    const response = await fetch('/api/support/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, text }),
    });
    const data = await response.json();
    console.log("✅ SMS successfully sent:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Failed to dispatch Twilio SMS:", error);
    return { success: false, error };
  }
};
