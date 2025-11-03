// WhatsApp Business API Integration for Chain AI Notifications
// Sends real-time alerts when critical supply chain disruptions occur

/**
 * WhatsApp Notification Service Options:
 * 
 * Option 1: Twilio WhatsApp API (Recommended - Easiest Setup)
 * Option 2: Meta WhatsApp Business API (More complex, official)
 * Option 3: WhatsApp Business Platform (Enterprise)
 */

// OPTION 1: Twilio WhatsApp API (Quick Start)
// Sign up: https://www.twilio.com/whatsapp
// Cost: Pay-as-you-go ($0.005-$0.01 per message)

interface WhatsAppNotification {
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  location: string;
  cargoType: string;
  affectedPeople: number;
  estimatedCost: number;
  timeline: string;
  approvalRequired: boolean;
}

/**
 * Send WhatsApp notification via Twilio
 */
export async function sendWhatsAppNotification(
  notification: WhatsAppNotification
): Promise<boolean> {
  // Twilio credentials (add to .env file)
  const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || '';
  const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || '';
  const TWILIO_WHATSAPP_NUMBER = import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Twilio sandbox
  const YOUR_WHATSAPP_NUMBER = import.meta.env.VITE_YOUR_WHATSAPP_NUMBER || ''; // Format: whatsapp:+1234567890

  if (!YOUR_WHATSAPP_NUMBER) {
    console.warn('[WhatsApp] No recipient number configured');
    return false;
  }

  // Format notification message
  const message = formatWhatsAppMessage(notification);

  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Base64 encode credentials for Basic Auth
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: YOUR_WHATSAPP_NUMBER,
        Body: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[WhatsApp] Failed to send notification:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] ✓ Notification sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Error sending notification:', error);
    return false;
  }
}

/**
 * Format notification message for WhatsApp
 */
function formatWhatsAppMessage(notification: WhatsAppNotification): string {
  const emoji = notification.severity === 'HIGH' ? '🚨' : notification.severity === 'MEDIUM' ? '⚠️' : 'ℹ️';
  
  let message = `${emoji} *Chain AI Alert - ${notification.severity} Priority*\n\n`;
  message += `📍 *Location:* ${notification.location}\n`;
  message += `📦 *Cargo:* ${notification.cargoType}\n`;
  message += `👥 *Affected People:* ${notification.affectedPeople.toLocaleString()}\n`;
  message += `💰 *Estimated Cost:* $${notification.estimatedCost.toLocaleString()}\n`;
  message += `⏱️ *Timeline:* ${notification.timeline}\n\n`;

  if (notification.approvalRequired) {
    message += `✋ *APPROVAL REQUIRED*\n`;
    message += `Cost exceeds $10,000 threshold. Review and approve in Chain AI dashboard.\n\n`;
  }

  message += `🔗 Review full analysis: [Your Dashboard URL]\n`;
  message += `\n_Sent by Chain AI Emergency Response System_`;

  return message;
}

/**
 * Send WhatsApp notification when approval is required
 */
export async function notifyApprovalRequired(
  severity: string,
  location: string,
  cargoType: string,
  affectedPeople: number,
  cost: number,
  timeline: string
): Promise<boolean> {
  return sendWhatsAppNotification({
    severity: severity as 'HIGH' | 'MEDIUM' | 'LOW',
    location,
    cargoType,
    affectedPeople,
    estimatedCost: cost,
    timeline,
    approvalRequired: true,
  });
}

/**
 * Send WhatsApp notification for critical disruptions
 */
export async function notifyCriticalDisruption(
  severity: string,
  location: string,
  cargoType: string,
  affectedPeople: number
): Promise<boolean> {
  // Only send for HIGH severity
  if (severity !== 'HIGH') return false;

  return sendWhatsAppNotification({
    severity: 'HIGH',
    location,
    cargoType,
    affectedPeople,
    estimatedCost: 0,
    timeline: 'Unknown',
    approvalRequired: false,
  });
}

// ALTERNATIVE: Direct WhatsApp Web Link (No API needed, opens WhatsApp)
export function openWhatsAppWithMessage(
  phoneNumber: string,
  notification: WhatsAppNotification
): void {
  const message = formatWhatsAppMessage(notification);
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  window.open(url, '_blank');
}
