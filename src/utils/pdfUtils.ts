import * as pdfjsLib from 'pdfjs-dist';

// Set worker path with fallback options
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
} catch {
  // Fallback to a stable version if version detection fails
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF text extraction for:', file.name);
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 0 // Reduce console noise
    }).promise;
    
    console.log('PDF loaded successfully, pages:', pdf.numPages);
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdf.numPages}`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .filter(str => str.trim())
        .join(' ')
        .replace(/\s+/g, ' ') // Clean up multiple spaces
        .trim();
      
      fullText += pageText + ' ';
      console.log(`Page ${pageNum} extracted ${pageText.length} characters`);
    }
    
    const finalText = fullText.trim();
    console.log('PDF extraction complete, total characters:', finalText.length);
    return finalText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF');
  }
}