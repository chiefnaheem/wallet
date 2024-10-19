// api-key.middleware.ts
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiKeyMiddleware.name);
  use(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'];
    // TODO: replace with an actual api-key saved to the db and validate
    const validApiKey = 'TEMP-KEY';

    this.logger.debug(`API Key from request: ${apiKey}`);
    this.logger.debug(`Valid API Key: ${validApiKey}`);

    if (apiKey === validApiKey) {
      next();
    } else {
      res.status(401).json({ message: 'Invalid API Key' });
    }
  }
}
