import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendLeadNotification(params: {
  supplierEmail: string
  supplierName: string
  leadName: string
  leadEmail: string
  leadMessage: string
  articleTitle?: string
}) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@boattomorrow.com',
      to: params.supplierEmail,
      subject: `New lead from BOATTOMORROW: ${params.leadName}`,
      html: `
        <h2>New inquiry on BOATTOMORROW</h2>
        <p>Hello ${params.supplierName},</p>
        <p>You have a new inquiry${params.articleTitle ? ` from the article "${params.articleTitle}"` : ''}:</p>
        <ul>
          <li><strong>Name:</strong> ${params.leadName}</li>
          <li><strong>Email:</strong> ${params.leadEmail}</li>
          <li><strong>Message:</strong> ${params.leadMessage || 'No message'}</li>
        </ul>
        <p>Log in to your dashboard to manage this lead.</p>
        <p>Best regards,<br/>BOATTOMORROW Team</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}
