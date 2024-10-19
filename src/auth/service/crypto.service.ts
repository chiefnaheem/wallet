import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.randomBytes(32);
  private readonly iv = crypto.randomBytes(16);

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      Buffer.from(this.key),
      this.iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${this.iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(text: string): string {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      Buffer.from(this.key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
