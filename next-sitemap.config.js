/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://boattomorrow.com',
  generateRobotsTxt: true,
  exclude: ['/supplier/*', '/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/supplier', '/admin', '/api'] },
    ],
  },
}
