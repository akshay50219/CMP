const PDFDocument = require('pdfkit');

/**
 * Generate academic-style conference program PDF
 */
const generateProgramPDF = (papers, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50
  });

  doc.pipe(res);

  // Title Page
  doc
    .fontSize(20)
    .text('Conference Program', { align: 'center' })
    .moveDown(1);

  doc
    .fontSize(12)
    .text('Accepted Papers', { align: 'center' })
    .moveDown(2);

  papers.forEach((paper, index) => {
    doc
      .fontSize(14)
      .text(`${index + 1}. ${paper.title}`, { underline: true })
      .moveDown(0.5);

    const authorLine = paper.authors
      .map(a => `${a.name} (${a.affiliation || 'N/A'})`)
      .join(', ');

    doc
      .fontSize(11)
      .text(authorLine)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .text(paper.abstract, {
        align: 'justify'
      })
      .moveDown(1.5);

    doc.moveDown(1);
  });

  doc.end();
};

module.exports = generateProgramPDF;
