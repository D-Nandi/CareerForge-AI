/**
 * CareerForge AI / Resumatic — PDF Export & Print Service Layer
 * Wraps html2canvas and jsPDF for client-side PDF generation.
 */

/**
 * Downloads current active resume sheet as a PDF document
 * @param {string} templateId - Active template element ID ('tpl-classic', 'tpl-modern', 'tpl-minimal')
 * @param {string} fileName - Target file name for PDF download
 * @returns {Promise<boolean>} Success status
 */
async function exportResumeToPDF(templateId = 'tpl-classic', fileName = 'Resume.pdf') {
  try {
    const targetElement = document.getElementById(templateId);
    if (!targetElement) {
      throw new Error(`Resume template element "#${templateId}" not found.`);
    }

    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
      console.warn('html2canvas or jsPDF library missing. Triggering browser print dialog fallback.');
      window.print();
      return true;
    }

    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('PDF Export Error:', err);
    window.print();
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { exportResumeToPDF };
} else {
  window.exportResumeToPDF = exportResumeToPDF;
}
