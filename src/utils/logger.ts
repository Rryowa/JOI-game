type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private buffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 200;

  private log(level: LogLevel, module: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    this.buffer.push(entry);
    if (this.buffer.length > this.MAX_BUFFER_SIZE) {
      this.buffer.shift();
    }

    const consoleFn = level === 'debug' ? console.log : console[level] || console.log;
    consoleFn(`[${entry.timestamp}] [${level.toUpperCase()}] [${module}] ${message}`, data || '');
  }

  info(module: string, message: string, data?: any) { this.log('info', module, message, data); }
  warn(module: string, message: string, data?: any) { this.log('warn', module, message, data); }
  error(module: string, message: string, data?: any) { this.log('error', module, message, data); }
  debug(module: string, message: string, data?: any) { this.log('debug', module, message, data); }

  getLogsAsText(): string {
    return this.buffer
      .map(e => `[${e.timestamp}] [${e.level.toUpperCase()}] [${e.module}] ${e.message} ${e.data ? JSON.stringify(e.data) : ''}`)
      .join("\n");
  }

  downloadLogs() {
    const blob = new Blob([this.getLogsAsText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `joi-how-debug-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const logger = new Logger();
