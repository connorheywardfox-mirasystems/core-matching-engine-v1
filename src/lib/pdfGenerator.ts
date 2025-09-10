import jsPDF from 'jspdf';
import { Match } from '@/types';

export const generateMatchesPDF = (matches: Match[]) => {
  const pdf = new jsPDF();
  
  // Set up fonts and spacing
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  // Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Top Matches Report', margin, 30);
  
  // Timestamp and match count
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const timestamp = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${timestamp}`, margin, 45);
  pdf.text(`Total matches: ${matches.length}`, margin, 55);
  
  let yPosition = 75;
  
  matches.forEach((match, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    // Match number and score
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${index + 1}. ${match.role_title}`, margin, yPosition);
    
    // Score badge
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    const scoreText = `Score: ${match.match_score}`;
    const scoreWidth = pdf.getTextWidth(scoreText);
    pdf.text(scoreText, pageWidth - margin - scoreWidth, yPosition);
    
    yPosition += 10;
    
    // Company info
    if (match.firm_name) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Company: ${match.firm_name}`, margin, yPosition);
      if (match.firm_location) {
        pdf.text(` | Location: ${match.firm_location}`, margin + pdf.getTextWidth(`Company: ${match.firm_name}`), yPosition);
      }
      yPosition += 8;
    }
    
    // Description
    if (match.description) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const descriptionLines = pdf.splitTextToSize(match.description, contentWidth);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 5;
    }
    
    // Match reason
    if (match.match_reason) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      const reasonLines = pdf.splitTextToSize(`Match reason: ${match.match_reason}`, contentWidth);
      pdf.text(reasonLines, margin, yPosition);
      yPosition += reasonLines.length * 4;
    }
    
    // Website
    if (match.firm_website) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Website: ${match.firm_website}`, margin, yPosition);
      yPosition += 6;
    }
    
    yPosition += 8; // Space between matches
  });
  
  // Save the PDF
  const fileName = `top-matches-${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
};