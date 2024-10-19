import * as bcrypt from 'bcryptjs';

export class PasswordManager {
  /**
   * @param password string
   * @description -> hash or encode string
   * @returns string
   */
  static async hash(plainString: string): Promise<string> {
    // const hashedString = await argon.hash(plainString, { saltLength: 10 });

    // return hashedString;

    return await bcrypt.hashSync(plainString, 10);
  }

  // comparePassword = (text: string, hashedText: string) => {
  //   return bcrypt.compareSync(text, hashedText);
  // };

  // hashPassword = (text: string) => {
  //   return bcrypt.hashSync(text, 10);
  // };

  /**
   * @param password string
   * @description -> decode and compare hashed string with plain string
   */
  static async compare(
    hashedString: string,
    plainString: string,
  ): Promise<boolean> {
    // const isMatch = await argon.verify(hashedString, plainString, {
    //   saltLength: 10,
    // });
    // return isMatch;
    return await bcrypt.compareSync(plainString, hashedString);
  }

  /**
   * @param length number
   * @description -> generate random string depending on provided length
   * @returns string
   */
  static async generate(length: number): Promise<string> {
    const charSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // final result string
    let result = '';

    // save character length to variable
    const characterLength = charSet.length;
    for (let i = 0; i < length; i++) {
      result += charSet.charAt(Math.floor(Math.random() * characterLength));
    }

    return result;
  }
}
