import winston, { format } from 'winston';

const {
  combine,
  colorize,
  timestamp,
  align,
  printf,
  errors,
  json,
  prettyPrint,
} = format;

/**
 * ----------------------------------
 * Formatter
 * ----------------------------------
 */
const outputLogFormatter = ({
  level,
  message,
  timestamp,
  service,
  method,
  path,
  ...meta
}: winston.Logform.TransformableInfo) => {
  const metaStr = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';
  return `[${timestamp as string}] [${level}] ${service ? `[${service as string}]` : ''} ${
    method ? `[${method as string}]` : ''
  } ${path ? `[${path as string}]` : ''}: ${message as string} ${metaStr}`;
};

const baseFormatter = [
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  align(),
  printf(outputLogFormatter),
];

const infoOnlyFilter = winston.format((info) => {
  return info.level === 'info' ? info : false;
});

const consoleFormat = combine(colorize({ all: true }), ...baseFormatter);

const errorFileFormat = combine(...baseFormatter);

const auditFileFormat = combine(infoOnlyFilter(), ...baseFormatter);

const prodFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  json(),
  prettyPrint(),
);

/**
 * ----------------------------------
 * Transport
 * ----------------------------------
 */
const localTransport = [
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: errorFileFormat,
  }),
  new winston.transports.File({
    filename: 'logs/audit.log',
    format: auditFileFormat,
  }),
  new winston.transports.Console({ format: consoleFormat }),
];

const prodTransport = [new winston.transports.Console({ format: prodFormat })];

/**
 * ----------------------------------
 * Helper
 * ----------------------------------
 */
export const WINSTON = Symbol('Winston');

export function winstonLogger(appStatus: string) {
  return winston.createLogger({
    level: 'info',
    transports: appStatus === 'local' ? localTransport : prodTransport,
  });
}
