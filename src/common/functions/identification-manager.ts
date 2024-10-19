import * as randomString from 'randomstring';

export class IdentificationManager {
  static async generateId(length = 8): Promise<string> {
    const timestamp = new Date().getTime().toString();
    const random = this.generateCodeNumeric(length);
    return `${timestamp}${random}`;
  }

  static async generateCodeAlphaNumeric(length: number): Promise<string> {
    return randomString.generate({ length, charset: 'alphanumeric' });
  }

  static async generateCodeAlpha(length: number): Promise<string> {
    return randomString.generate({ length, charset: 'alphabetic' });
  }

  static generateCodeNumeric(length: number): string {
    return randomString.generate({ length, charset: 'numeric' });
  }

  static generateRandomAlphanumeric(length: number): string {
    return randomString.generate({ length, charset: 'alphanumeric' });
  }
}
