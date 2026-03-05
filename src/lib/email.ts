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

const leadMagnetContent: Record<string, { subject: string; title: string }> = {
  destination: {
    subject: 'Your Charter Planning Checklist',
    title: 'Charter Planning Checklist',
  },
  boat: {
    subject: 'Your Yacht Buying Guide',
    title: 'Yacht Buying Guide',
  },
  learning: {
    subject: '10 Things to Know Before Your First Sailing Course',
    title: 'First Sailing Course Guide',
  },
  route: {
    subject: 'Your Route Map & Anchorage List',
    title: 'Route Planning Guide',
  },
  tips: {
    subject: "Your Sailor's Packing Checklist",
    title: "Sailor's Checklist",
  },
  gear: {
    subject: 'Your Equipment Comparison Table',
    title: 'Equipment Comparison',
  },
}

export async function sendLeadMagnet(params: {
  email: string
  leadMagnet?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'
  const info = leadMagnetContent[params.leadMagnet || ''] || {
    subject: 'Your Free Sailing Guide from BOATTOMORROW',
    title: 'Sailing Guide',
  }

  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@boattomorrow.com',
      to: params.email,
      subject: info.subject,
      html: `
        <h2>${info.title}</h2>
        <p>Thank you for downloading our guide! Here are some hand-picked articles to get you started:</p>
        <ul>
          <li><a href="${siteUrl}/destinations">Top Sailing Destinations</a></li>
          <li><a href="${siteUrl}/tips">Expert Sailing Tips</a></li>
          <li><a href="${siteUrl}/boats">Yacht Reviews</a></li>
        </ul>
        <p>We'll send you 2-3 more useful articles over the next week. No spam, ever.</p>
        <p>Best regards,<br/>BOATTOMORROW Team</p>
        <p style="font-size: 11px; color: #999;"><a href="${siteUrl}">Unsubscribe</a></p>
      `,
    })
  } catch (error) {
    console.error('Failed to send lead magnet:', error)
  }
}

export async function sendArticlePublished(params: {
  supplierEmail: string
  supplierName: string
  articleTitle: string
  articleSlug: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'

  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@boattomorrow.com',
      to: params.supplierEmail,
      subject: `Your article "${params.articleTitle}" is published!`,
      html: `
        <h2>Your article is live!</h2>
        <p>Hello ${params.supplierName},</p>
        <p>Your article <strong>"${params.articleTitle}"</strong> has been approved and published on BOATTOMORROW.</p>
        <p><a href="${siteUrl}/articles/${params.articleSlug}">View your article</a></p>
        <h3>Share it with your audience</h3>
        <p>We've prepared ready-made social media posts for you. Visit your
        <a href="${siteUrl}/supplier/distribution">Distribution Kit</a> to copy & paste posts for Facebook, Instagram, and LinkedIn.</p>
        <p>The more you share, the more leads you get!</p>
        <p>Best regards,<br/>BOATTOMORROW Team</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send article published email:', error)
  }
}
