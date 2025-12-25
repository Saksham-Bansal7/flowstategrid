// lib/text-processor.ts
export async function extractTextFromPDF(buffer: Buffer) {
  try {
    // Use pdf-parse-fork which is a maintained fork that works better
    const pdfParse = (await import('pdf-parse-fork')).default;
    const data = await pdfParse(buffer);
    
    return {
      text: data.text,
      pageCount: data.numpages,
    };
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    throw error;
  }
}

export async function extractTextFromImage(buffer: Buffer) {
  throw new Error('Image OCR is not supported yet. Please use PDF or text files.');
}

export function chunkText(text: string, maxChunkSize = 512, overlap = 50): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();

    if (currentChunk.length + trimmedPara.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());

      const words = currentChunk.split(/\s+/);
      const overlapWords = words.slice(-overlap);
      currentChunk = overlapWords.join(' ') + ' ';
    }

    currentChunk += trimmedPara + '\n\n';
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

export function detectQuestions(text: string): boolean {
  const questionPatterns = [
    /Q\d+[.:)]/i,
    /Question\s+\d+/i,
    /^\d+\./m,
    /^\([a-z]\)/im,
    /\?$/m,
  ];

  return questionPatterns.some((pattern) => pattern.test(text));
}

export function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}