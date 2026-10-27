import type { LogLevel } from '../config/env';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  private readonly threshold: number;

  constructor(level: LogLevel = 'info') {
    this.threshold = LEVEL_PRIORITY[level];
  }

  private enabled(level: LogLevel): boolean {
    return LEVEL_PRIORITY[level] >= this.threshold;
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.enabled(level)) return;
    const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
    const write =
      level === 'warn' || level === 'error' ? console.error : console.log;
    write(line, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }
}
