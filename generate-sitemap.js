/**
 * Sitemap Generator for KIVO Learning Platform
 *
 * This script generates a comprehensive sitemap.xml for SEO optimization
 * Run: node generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DOMAIN = 'https://kivolearning.com';
const OUTPUT_FILE = path.join(__dirname, 'public', 'sitemap.xml');

// Define all routes with priority and change frequency
const routes = [
  // Homepage (Highest Priority)
  { path: '/', priority: 1.0, changefreq: 'daily', lastmod: getCurrentDate() },

  // Core Feature Pages (Very High Priority)
  { path: '/ai-tutor', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/predictive-learning', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/emotional-ai', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/ai-study-buddy', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/worksheet-generator', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/educational-games', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/parent-moments', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/auto-grading', priority: 0.9, changefreq: 'weekly', lastmod: getCurrentDate() },

  // User Role Pages (High Priority)
  { path: '/for-students', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/for-parents', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/for-teachers', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/for-schools', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/homeschool', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Grade Level Pages
  { path: '/pre-k-learning', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/elementary-k-5', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/middle-school-6-8', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/high-school-9-12', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Subject Pages
  { path: '/math-learning', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/reading-comprehension', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/science-learning', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/life-skills', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Main App Sections
  { path: '/games', priority: 0.8, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/assessments', priority: 0.8, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/worksheets', priority: 0.8, changefreq: 'weekly', lastmod: getCurrentDate() },
  { path: '/progress', priority: 0.7, changefreq: 'daily', lastmod: getCurrentDate() },

  // Authentication & Account
  { path: '/login', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/signup', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/pricing', priority: 0.8, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Information Pages
  { path: '/about', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/contact', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/faq', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/help', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Legal & Trust Pages
  { path: '/privacy', priority: 0.5, changefreq: 'yearly', lastmod: getCurrentDate() },
  { path: '/terms', priority: 0.5, changefreq: 'yearly', lastmod: getCurrentDate() },
  { path: '/security', priority: 0.6, changefreq: 'yearly', lastmod: getCurrentDate() },

  // Blog Pages (would be dynamically generated in production)
  { path: '/blog', priority: 0.7, changefreq: 'daily', lastmod: getCurrentDate() },
  { path: '/blog/how-ai-predicts-learning-gaps', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/blog/emotional-intelligence-in-education', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/blog/gamification-that-works', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/blog/reduce-teacher-grading-time', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/blog/whole-child-development', priority: 0.6, changefreq: 'monthly', lastmod: getCurrentDate() },

  // Comparison Pages (High SEO Value)
  { path: '/vs-khan-academy', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/vs-ixl', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
  { path: '/vs-prodigy', priority: 0.7, changefreq: 'monthly', lastmod: getCurrentDate() },
];

// Helper function to get current date in ISO format
function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

// Generate sitemap XML
function generateSitemap() {
  console.log('🚀 Generating sitemap.xml for KIVO Learning...\n');

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n\n';

  // Add each route
  routes.forEach((route) => {
    xml += '  <url>\n';
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n\n';
  });

  xml += '</urlset>';

  // Write to file
  fs.writeFileSync(OUTPUT_FILE, xml);

  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📁 Location: ${OUTPUT_FILE}`);
  console.log(`📊 Total URLs: ${routes.length}\n`);

  // Print statistics
  const stats = {
    'Priority 1.0': routes.filter(r => r.priority === 1.0).length,
    'Priority 0.9': routes.filter(r => r.priority === 0.9).length,
    'Priority 0.8': routes.filter(r => r.priority === 0.8).length,
    'Priority 0.7': routes.filter(r => r.priority === 0.7).length,
    'Priority 0.6': routes.filter(r => r.priority === 0.6).length,
    'Priority 0.5': routes.filter(r => r.priority === 0.5).length,
  };

  console.log('📈 Sitemap Statistics:');
  Object.entries(stats).forEach(([key, value]) => {
    if (value > 0) {
      console.log(`   ${key}: ${value} pages`);
    }
  });

  console.log('\n💡 Next Steps:');
  console.log('   1. Upload sitemap.xml to your production server');
  console.log('   2. Submit to Google Search Console: https://search.google.com/search-console');
  console.log('   3. Submit to Bing Webmaster Tools: https://www.bing.com/webmasters');
  console.log('   4. Add sitemap URL to robots.txt: Sitemap: https://kivolearning.com/sitemap.xml');
  console.log('\n🎉 SEO optimization ready to boost KIVO Learning!\n');
}

// Additional helper: Generate robots.txt if needed
function generateRobotsTxt() {
  const robotsTxt = `# robots.txt for KIVO Learning - AI-Powered Education Platform
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /settings/

Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.gif$
Allow: /*.svg$

Sitemap: ${DOMAIN}/sitemap.xml

# Crawl delay (optional, adjust if needed)
# Crawl-delay: 1
`;

  const robotsFile = path.join(__dirname, 'public', 'robots.txt');
  fs.writeFileSync(robotsFile, robotsTxt);
  console.log(`✅ robots.txt also generated at: ${robotsFile}\n`);
}

// Run the generator
try {
  generateSitemap();
  // Uncomment to also generate robots.txt
  // generateRobotsTxt();
} catch (error) {
  console.error('❌ Error generating sitemap:', error.message);
  process.exit(1);
}
