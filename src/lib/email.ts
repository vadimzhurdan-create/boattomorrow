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

// --- Nurturing Series ---

const nurturingEmails: Record<number, { subject: string; html: (siteUrl: string, category?: string | null) => string }> = {
  1: {
    subject: 'More sailing guides picked for you',
    html: (siteUrl, category) => `
      <h2>More from BOATTOMORROW</h2>
      <p>Here are a few more articles we think you'll enjoy:</p>
      <ul>
        <li><a href="${siteUrl}/${category || 'destinations'}">Browse ${category || 'destination'} guides</a></li>
        <li><a href="${siteUrl}/tips">Expert sailing tips</a></li>
        <li><a href="${siteUrl}/routes">Sailing routes & itineraries</a></li>
      </ul>
      <p>Found something you like? Every article has a quick inquiry form if you want to hear from a verified supplier.</p>
      <p>Best regards,<br/>BOATTOMORROW Team</p>
      <p style="font-size: 11px; color: #999;"><a href="${siteUrl}">Unsubscribe</a></p>
    `,
  },
  2: {
    subject: 'Want personalized sailing offers?',
    html: (siteUrl) => `
      <h2>Get personalized offers</h2>
      <p>We work with verified charter companies, boat manufacturers, and sailing schools across the Mediterranean, Caribbean, and beyond.</p>
      <p>Tell us what you're looking for, and we'll connect you with the right supplier — no obligation, no cost.</p>
      <p><a href="${siteUrl}/suppliers" style="display:inline-block;background:#E8500A;color:white;padding:12px 24px;text-decoration:none;font-weight:bold;">Browse Verified Suppliers</a></p>
      <p>Best regards,<br/>BOATTOMORROW Team</p>
      <p style="font-size: 11px; color: #999;"><a href="${siteUrl}">Unsubscribe</a></p>
    `,
  },
  3: {
    subject: 'Your sailing plan starts here',
    html: (siteUrl) => `
      <h2>Ready to make it happen?</h2>
      <p>Whether it's a week in Croatia, a sailing course in Greece, or your dream yacht — our verified suppliers are ready to help.</p>
      <p><strong>How it works:</strong></p>
      <ol>
        <li>Pick a destination or supplier</li>
        <li>Fill out a 30-second inquiry form</li>
        <li>Get a personalized offer within 24 hours</li>
      </ol>
      <p><a href="${siteUrl}/destinations" style="display:inline-block;background:#E8500A;color:white;padding:12px 24px;text-decoration:none;font-weight:bold;">Explore Destinations</a></p>
      <p>Best regards,<br/>BOATTOMORROW Team</p>
      <p style="font-size: 11px; color: #999;"><a href="${siteUrl}">Unsubscribe</a></p>
    `,
  },
}

export async function sendNurturingEmail(params: {
  email: string
  step: number
  categorySlug?: string | null
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'
  const template = nurturingEmails[params.step]
  if (!template) return

  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@boattomorrow.com',
      to: params.email,
      subject: template.subject,
      html: template.html(siteUrl, params.categorySlug),
    })
  } catch (error) {
    console.error(`Failed to send nurturing email step ${params.step}:`, error)
  }
}

// --- Monthly Report ---

export async function sendMonthlyReport(params: {
  supplierEmail: string
  supplierName: string
  monthName: string
  views: number
  leads: number
  prevViews: number
  prevLeads: number
  articleCount: number
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://boattomorrow.com'
  const viewsDelta = params.prevViews > 0
    ? Math.round(((params.views - params.prevViews) / params.prevViews) * 100)
    : 0
  const leadsDelta = params.prevLeads > 0
    ? Math.round(((params.leads - params.prevLeads) / params.prevLeads) * 100)
    : 0

  const viewsArrow = viewsDelta >= 0 ? '↑' : '↓'
  const leadsArrow = leadsDelta >= 0 ? '↑' : '↓'

  try {
    const resend = getResend()
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@boattomorrow.com',
      to: params.supplierEmail,
      subject: `BOATTOMORROW: Your ${params.monthName} Performance Report`,
      html: `
        <h2>Monthly Performance Report</h2>
        <p>Hello ${params.supplierName},</p>
        <p>Here's how your content performed in <strong>${params.monthName}</strong>:</p>
        <table style="border-collapse:collapse;width:100%;max-width:400px;margin:20px 0;">
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px 0;color:#777;">Article Views</td>
            <td style="padding:12px 0;font-size:24px;font-weight:bold;text-align:right;">${params.views.toLocaleString()}</td>
            <td style="padding:12px 0 12px 8px;color:${viewsDelta >= 0 ? '#22c55e' : '#ef4444'};font-size:14px;">${viewsArrow} ${Math.abs(viewsDelta)}%</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px 0;color:#777;">Leads Generated</td>
            <td style="padding:12px 0;font-size:24px;font-weight:bold;text-align:right;">${params.leads}</td>
            <td style="padding:12px 0 12px 8px;color:${leadsDelta >= 0 ? '#22c55e' : '#ef4444'};font-size:14px;">${leadsArrow} ${Math.abs(leadsDelta)}%</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#777;">Published Articles</td>
            <td style="padding:12px 0;font-size:24px;font-weight:bold;text-align:right;">${params.articleCount}</td>
            <td></td>
          </tr>
        </table>
        <p>Want to increase your reach? <a href="${siteUrl}/supplier/quiz">Create a new article</a> to attract more leads.</p>
        <p><a href="${siteUrl}/supplier/dashboard" style="display:inline-block;background:#E8500A;color:white;padding:12px 24px;text-decoration:none;font-weight:bold;">View Full Dashboard</a></p>
        <p>Best regards,<br/>BOATTOMORROW Team</p>
      `,
    })
  } catch (error) {
    console.error('Failed to send monthly report:', error)
  }
}

// --- Article Published ---

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
