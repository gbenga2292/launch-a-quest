import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Waybill, CompanySettings, Site } from "@/types/asset";

interface PDFGenerationOptions {
  waybill: Waybill;
  companySettings?: CompanySettings;
  sites: Site[];
  type: 'waybill' | 'return';
}

export const generateProfessionalPDF = ({ waybill, companySettings, sites, type }: PDFGenerationOptions) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Set Times New Roman font
  pdf.setFont('times', 'normal');
  
  const site = sites.find(s => s.id === waybill.siteId);
  const fromLocation = 'DCEL Warehouse';
  const toLocation = site?.name || 'Client Site';
  
  // Function to render header (logo, title, waybill no/date/driver/vehicle left-aligned)
  const renderHeader = () => {
    let headerY = 5;
    
    // Company Logo or placeholder circle (top-left)
    const logoWidth = 85;
    const logoHeight = 30;
    const logoY = headerY; // No offset for minimal top space
    if (companySettings?.logo) {
      try {
        pdf.addImage(companySettings.logo, 'PNG', 20, logoY, logoWidth, logoHeight);
      } catch (error) {
        console.warn('Could not load company logo:', error);
        // Fallback circle
        pdf.setFillColor(200, 200, 200);
        pdf.circle(37.5, logoY + 15, 15, 'F');
        pdf.setFontSize(9);
        pdf.setFont('times', 'bold');
        pdf.text('DCEL', 30, logoY + 20);
      }
    } else {
      // Simple circle placeholder
      pdf.setFillColor(200, 200, 200);
      pdf.circle(37.5, logoY + 15, 15, 'F');
      pdf.setFontSize(9);
      pdf.setFont('times', 'bold');
      pdf.text('DCEL', 30, logoY + 20);
    }
    

    // Title below, centered
    headerY += 45; // Space after logo/company row (adjusted for smaller logo)
    pdf.setFontSize(24);
    pdf.setFont('times', 'bold');
    const title = type === 'return' ? 'RETURNS' : 'WAYBILL';
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, headerY);
    
    headerY += 20;
    
    pdf.setFontSize(12);
    pdf.setFont('times', 'bold');

    // Waybill No (left-aligned, bold)
    pdf.text(`Waybill No: ${waybill.id}`, 20, headerY);
    headerY += 8;

    // Date (left-aligned, bold)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const day = waybill.issueDate.getDate();
    const monthYear = waybill.issueDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const dateText = `${getOrdinal(day)} ${monthYear}`;
    pdf.text(`Date: ${dateText}`, 20, headerY);
    headerY += 8;

    // Driver Name (left-aligned, bold)
    pdf.text(`Driver Name: ${waybill.driverName}`, 20, headerY);
    headerY += 8;

    // Vehicle (left-aligned, bold)
    if (waybill.vehicle) {
      pdf.text(`Vehicle: ${waybill.vehicle}`, 20, headerY);
      headerY += 8;
    }
    
    headerY += 5;
    
    return headerY;
  };

  // Function to render footer (on every page bottom)
  const renderFooter = () => {
    const footerY = pageHeight - 30;
    
    // Signed (left-aligned)
    pdf.setFontSize(12);
    pdf.setFont('times', 'bold');
    pdf.text('Signed', 20, footerY);
    
    // Underline (left-aligned, 100mm wide)
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, footerY + 2, 120, footerY + 2);
    
    // Company name below (left-aligned, together as footer)
    pdf.setFontSize(12);
    pdf.setFont('times', 'italic');
    pdf.text(companySettings?.companyName || 'Dewatering Construction Ltd', 20, footerY + 8);
  };

  let yPos = renderHeader();

  // Subtitle (centered, only on first page, multi-line if needed)
  const safeService = waybill.service || 'dewatering';
  const capitalizedService = safeService.charAt(0).toUpperCase() + safeService.slice(1);
  const firstPageSubtitle = type === 'return'
    ? `Materials Returns for ${capitalizedService} from ${toLocation} to ${fromLocation}`
    : `Materials Waybill for ${capitalizedService} from ${fromLocation} to ${toLocation}`;
  
  const splitFirstSubtitle = pdf.splitTextToSize(firstPageSubtitle, pageWidth - 40);
  pdf.setFontSize(14);
  pdf.setFont('times', 'bold');
  const maxSubtitleWidth = Math.max(...splitFirstSubtitle.map(line => pdf.getTextWidth(line)));
  const subtitleX = (pageWidth - maxSubtitleWidth) / 2;
  pdf.text(splitFirstSubtitle, subtitleX, yPos);
  pdf.setFontSize(12);
  pdf.setFont('times', 'normal');
  yPos += splitFirstSubtitle.length * 6 + 10;

  // Render footer on first page
  renderFooter();

  // Items List (normal font)
  pdf.setFont('times', 'normal');
  if (waybill.items.length === 0) {
    // For no items, add "No items listed" after subtitle, before footer (but footer fixed, so place above footer space)
    const noItemsY = pageHeight - 50;
    pdf.text('No items listed', 20, noItemsY);
  } else {
    let currentY = yPos;

    pdf.setFontSize(12);
    pdf.setFont('times', 'normal');
    waybill.items.forEach((item, index) => {
      if (currentY > pageHeight - 80) {
        pdf.addPage();
        renderHeader();
        currentY = yPos;
      }
      const safeStatus = item.status || 'outstanding';
      const itemText = type === 'return' 
        ? `${index + 1}. ${item.assetName} (${item.quantity})`
        : `${index + 1}. ${item.assetName} (${item.quantity})`;
      pdf.text(itemText, 20, currentY);
      currentY += 8;
    });

    // Render footer on the last page
    renderFooter();
  }
  
  // Return the PDF instance for external handling (save/print)
  const fileName = `${type === 'return' ? 'Return' : 'Waybill'}_for_${waybill.service}_${toLocation.replace(/\s+/g, '_')}.pdf`;
  return { pdf, fileName };
};
