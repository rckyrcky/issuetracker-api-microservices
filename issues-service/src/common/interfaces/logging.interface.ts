export type LogData = { service: string; method: string; error: unknown };

export default interface ILoggingService {
  /**
   * Logs info
   * @param message
   * @param data
   */
  info(
    message: string,
    data?: Omit<LogData, 'error'> & Record<string, unknown>,
  ): void;

  /**
   * Logs warning
   * @param message
   * @param data
   */
  warning(
    message: string,
    data?: Omit<LogData, 'error'> & Record<string, unknown>,
  ): void;

  /**
   * Logs error
   * @param message
   * @param data
   */
  error(message: string, data?: LogData & Record<string, unknown>): void;
}
