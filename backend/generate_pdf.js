const markdownpdf = require("markdown-pdf");
const fs = require("fs");

const options = {
    cssPath: null,
    paperFormat: 'A4'
};

console.log("Generating PDF...");

fs.readFile("/home/prototype/SoftRide/docs/architecture_pdf.md", 'utf8', (err, data) => {
    if (err) {
        console.error("Read Error:", err);
        process.exit(1);
    }

    markdownpdf(options)
        .from.string(data)
        .to("/home/prototype/SoftRide/docs/architecture.pdf", function () {
            console.log("PDF Created Successfully at docs/architecture.pdf!");
        });
});
