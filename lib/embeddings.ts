// lib/embeddings.ts
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const output = await hf.featureExtraction({
      model: 'sentence-transformers/all-mpnet-base-v2', // Changed back to 768 dimensions
      inputs: text,
    });

    // Convert to regular number array
    if (Array.isArray(output)) {
      const data = Array.isArray(output[0]) ? output[0] : output;
      return Array.from(data) as number[];
    }
    
    if (output && typeof output === 'object' && 'length' in output) {
      return Array.from(output as ArrayLike<number>);
    }

    throw new Error('Unexpected response format from HuggingFace');
  } catch (error: any) {
    console.error('HuggingFace embedding error:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);

    const batchEmbeddings = await Promise.all(
      batch.map(async (text) => {
        await new Promise((resolve) => setTimeout(resolve, 300)); // Slightly longer delay for larger model
        return generateEmbedding(text);
      })
    );

    embeddings.push(...batchEmbeddings);


  return embeddings;
}