const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const { marked } = await import('marked');
    console.log("Reading Markdown...");
    const md = fs.readFileSync('/home/prototype/SoftRide/docs/architecture.md', 'utf8');

    console.log("Converting to HTML...");
    const content = marked.parse(md);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; line-height: 1.6; color: #333; }
          h1, h2, h3 { color: #2c3e50; }
          h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; text-align: center; }
          h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }
          pre { background: #f8f9fa; padding: 15px; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto; white-space: pre-wrap; }
          code { font-family: 'Courier New', monospace; background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
          img { max-width: 100%; height: auto; display: block; margin: 20px auto; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
          .mermaid { display: none; }
          ul, ol { margin-bottom: 20px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;

    console.log("Launching Browser...");
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // Enable local file access
    await page.goto('file:///home/prototype/SoftRide/docs/', { waitUntil: 'networkidle0' });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    console.log("Printing PDF...");
    await page.pdf({
      path: '/home/prototype/SoftRide/docs/architecture.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
    });

    await browser.close();
    console.log("✅ PDF Generated: docs/architecture.pdf");

  } catch (error) {
    console.error("PDF Generation Error:", error);
    process.exit(1);
  }
})();
