export class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  debug(message: string, ...meta: unknown[]): void {
    console.log(`[DEBUG ${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
  }

  info(message: string, ...meta: unknown[]): void {
    console.log(`[INFO ${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
  }

  warn(message: string, ...meta: unknown[]): void {
    console.warn(`[WARN ${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
  }

  error(message: string, ...meta: unknown[]): void {
    console.error(`[ERROR ${new Date().toISOString()}] ${message}`, meta.length ? meta : '');
  }
}
