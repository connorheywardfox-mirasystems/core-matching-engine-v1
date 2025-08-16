import * as pdfjsLib from 'pdfjs-dist';

// Configure worker with multiple fallback options
const setupWorker = () => {
  try {
    // First try: Use the npm package worker
    const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('Using npm worker:', workerSrc);
  } catch (error) {
    console.warn('Failed to load npm worker, trying CDN...', error);
    try {
      // Second try: Use CDN with known stable version
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      console.log('Using CDN worker');
    } catch (cdnError) {
      console.warn('CDN worker failed, using unpkg...', cdnError);
      // Third try: Use unpkg as final fallback
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      console.log('Using unpkg worker');
    }
  }
};

// Initialize worker
setupWorker();

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('=== PDF EXTRACTION START ===');
    console.log('File name:', file.name);
    console.log('File type:', file.type);
    console.log('File size:', file.size, 'bytes');
    
    // Check if worker is properly configured
    console.log('PDF.js worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('✓ ArrayBuffer created, size:', arrayBuffer.byteLength, 'bytes');
    
    console.log('Attempting to load PDF document...');
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      verbosity: 1
    });
    
    // Add progress tracking
    loadingTask.onProgress = (progress: any) => {
      console.log('PDF loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
    };
    
    const pdf = await loadingTask.promise;
    console.log('✓ PDF loaded successfully!');
    console.log('Number of pages:', pdf.numPages);
    
    if (pdf.numPages === 0) {
      throw new Error('PDF has no pages');
    }
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`--- Processing page ${pageNum}/${pdf.numPages} ---`);
        const page = await pdf.getPage(pageNum);
        console.log('✓ Page loaded');
        
        const textContent = await page.getTextContent();
        console.log('✓ Text content extracted, items:', textContent.items.length);
        
        const pageText = textContent.items
          .map((item: any) => {
            const text = item.str || '';
            return text;
          })
          .filter(str => str.trim())
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        fullText += pageText + ' ';
        console.log(`✓ Page ${pageNum} processed: ${pageText.length} characters`);
        
        if (pageText.length === 0) {
          console.warn(`⚠ Page ${pageNum} contains no readable text`);
        }
        
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    const finalText = fullText.trim();
    console.log('=== PDF EXTRACTION COMPLETE ===');
    console.log('Total characters extracted:', finalText.length);
    
    if (finalText.length === 0) {
      throw new Error('No readable text found in PDF - the document may be image-based or corrupted');
    }
    
    console.log('Sample text (first 200 chars):', finalText.substring(0, 200));
    return finalText;
    
  } catch (error) {
    console.error('=== PDF EXTRACTION FAILED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    // Provide more specific error messages
    if (error.message.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file - the file may be corrupted or not a valid PDF');
    }
    if (error.message.includes('worker')) {
      throw new Error('PDF processing failed - worker script could not be loaded');
    }
    if (error.message.includes('network')) {
      throw new Error('Network error while processing PDF - please check your connection');
    }
    
    // Re-throw the original error if it's already descriptive
    if (error.message.length > 20) {
      throw error;
    }
    
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}