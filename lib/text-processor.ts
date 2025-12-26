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

// lib/text-processor.ts
export function chunkText(text: string, maxChunkSize = 700, overlap = 70): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmedPara = paragraph.trim();

    // If the paragraph itself is too large, split it by sentences
    if (trimmedPara.length > maxChunkSize) {
      // Save current chunk if exists
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Split large paragraph by sentences
      const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          const words = currentChunk.split(/\s+/);
          const overlapWords = words.slice(-overlap);
          currentChunk = overlapWords.join(' ') + ' ';
        }

        // If single sentence is still too large, split by words
        if (sentence.length > maxChunkSize) {
          const words = sentence.split(/\s+/);
          for (const word of words) {
            if (currentChunk.length + word.length + 1 > maxChunkSize && currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }
            currentChunk += word + ' ';
          }
        } else {
          currentChunk += sentence + ' ';
        }
      }
    } else {
      // Normal paragraph handling
      if (currentChunk.length + trimmedPara.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        const words = currentChunk.split(/\s+/);
        const overlapWords = words.slice(-overlap);
        currentChunk = overlapWords.join(' ') + ' ';
      }

      currentChunk += trimmedPara + '\n\n';
    }
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