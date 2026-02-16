import { createReadStream } from 'fs'
import crc32 from 'crc-32'
import { createHash, Hash } from 'crypto'

// Supported algorithms
type ChecksumAlgorithm = 'crc32' | 'md5' | 'sha1' | 'sha256' | 'sha512'

/**
 * Calculates the checksum of a given file.
 * @param filePath - The path of the file
 * @param algorithm - The hash algorithm
 * @returns {Promise<string>} The calculated checksum.
 */
export const calculateChecksum = async(filePath: string, algorithm: ChecksumAlgorithm): Promise<string> => {
    let strategy: ChecksumStrategy;

    switch (algorithm) {
        case 'crc32':
            strategy = new CRC32Strategy();
            break
        case 'sha1':
        case 'sha256':
        case 'sha512':
        case 'md5':
            strategy = new NodeChecksumStrategy(algorithm);
            break
        default: strategy = new CRC32Strategy();
    }

    return await new Promise((resolve, reject) => {
        const s = createReadStream(filePath);
        s.on('data', (chunk) => strategy.update(chunk as any));
        s.on('end', () => resolve(strategy.digest().toString()));
        s.on('error', reject)
    });
}

interface ChecksumStrategy {
    readonly name: ChecksumAlgorithm;
    update(chunk: Buffer): void;
    digest(): number | string;
}

class NodeChecksumStrategy implements ChecksumStrategy {
    readonly name: ChecksumAlgorithm;
    private hash: Hash;

    constructor(algorithm: Exclude<ChecksumAlgorithm, 'crc32'>) {
        this.name = algorithm;
        this.hash = createHash(algorithm);
    }

    update(chunk: Buffer): void {
        this.hash.update(chunk as any);
    }

    digest(): string {
        return this.hash.digest('hex');
    }
}

class CRC32Strategy implements ChecksumStrategy {
    readonly name: ChecksumAlgorithm = 'crc32';
    private checksum = 0;

    update(chunk: Buffer): void {
        this.checksum = crc32.buf(chunk as any, this.checksum);
    }

    digest(): number {
        return this.checksum >>> 0;
    }
}