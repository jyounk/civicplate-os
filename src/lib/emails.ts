import resend from './resend';

export async function sendOrderConfirmationEmail({
  to,
  orderId,
  plateText,
  cityName,
}: {
  to: string;
  orderId: string;
  plateText: string;
  cityName: string;
}) {
  await resend.emails.send({
    from: 'CivicPlate OS <onboarding@resend.dev>',
    to,
    subject: 'Your plate order has been received!',
    html: `
      <h2>Thanks for your order!</h2>
      <p>Your custom plate request for <strong>${plateText}</strong> has been received by ${cityName}.</p>
      <p>Order ID: <strong>${orderId}</strong></p>
      <p>You will receive another email once your order has been reviewed.</p>
    `,
  });
}

export async function sendOrderStatusEmail({
  to,
  orderId,
  plateText,
  cityName,
  status,
}: {
  to: string;
  orderId: string;
  plateText: string;
  cityName: string;
  status: 'APPROVED' | 'REJECTED';
}) {
  const approved = status === 'APPROVED';
  await resend.emails.send({
    from: 'CivicPlate OS <onboarding@resend.dev>',
    to,
    subject: approved ? 'Your plate order has been approved!' : 'Update on your plate order',
    html: `
      <h2>${approved ? 'Great news!' : 'Order Update'}</h2>
      <p>Your plate order for <strong>${plateText}</strong> with ${cityName} has been <strong>${approved ? 'approved' : 'rejected'}</strong>.</p>
      <p>Order ID: <strong>${orderId}</strong></p>
      ${approved ? '<p>Your plate is being processed and will be mailed to you soon.</p>' : '<p>Please contact your city office if you have questions.</p>'}
    `,
  });
}