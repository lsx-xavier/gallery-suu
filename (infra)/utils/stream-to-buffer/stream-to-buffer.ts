import { Readable } from 'stream';

/**
 * Converte um Readable Stream em um Buffer
 * @param stream - O stream a ser convertido
 * @returns Um Promise que resolve para um Buffer
 */
export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};
