import isPlainObject from "lodash.isplainobject";
import winston from "winston";

/**
 * A logger metadata.
 */
export type LoggerMetadata = Record<string, any>;

/**
 * A logger.
 */
export type Logger = winston.Logger & {
  /**
   * Metadata associated with the logger.
   */
  readonly metadata: LoggerMetadata;

  /**
   * Creates a new logger and inherits new metadata.
   * @param meta the metadata to inherit
   */
  child(meta: LoggerMetadata): Logger;
};

/**
 * A logger constructor.
 */
export interface LoggerConstructor {
  /**
   * Creates a new wrapper which appends metadata when logging a message.
   * @param logger the logger
   * @param metadata metadata to append when logging a message
   */
  (logger?: winston.Logger | winston.LoggerOptions, metadata?: LoggerMetadata): Logger;

  /**
   * Creates a new wrapper which appends metadata when logging a message.
   * @param logger the logger
   * @param metadata metadata to append when logging a message
   */
  new (logger?: winston.Logger | winston.LoggerOptions, metadata?: LoggerMetadata): Logger;
}

/**
 * Creates a new wrapper which appends metadata when logging a message.
 * @param logger the logger
 * @param metadata metadata to append when logging a message
 */
export function createLogger(
  logger?: winston.Logger | winston.LoggerOptions,
  metadata?: LoggerMetadata,
): Logger {
  if (logger == null || isPlainObject(logger)) {
    logger = winston.createLogger(logger);
  }

  if (metadata == null) {
    metadata = {};
  }

  const proxy = new Proxy(logger, {
    get(target, property): any {
      if (property === "metadata") {
        return metadata;
      }

      if (property === "child") {
        return function child(meta: any): Logger {
          return createLogger(logger, { ...metadata, ...meta });
        };
      }

      if (property === "log" || property in target.levels) {
        return (...args: any[]): any => {
          const meta = args[args.length - 1];

          if (isPlainObject(meta)) {
            args[args.length - 1] = { ...metadata, ...meta };
          } else {
            args.push(metadata);
          }

          return target[property].apply(target, args);
        };
      }

      return target[property];
    },
  });

  return proxy as Logger;
}

export const Logger = createLogger as LoggerConstructor;
