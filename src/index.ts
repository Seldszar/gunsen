import isPlainObject from "lodash.isplainobject";
import * as winston from "winston";

/**
 * The logger metadata.
 */
export type LoggerMetadata = Record<string, any>;

/**
 * The logger.
 */
export type Logger = winston.Logger & {
  /**
   * Metadata associated with the actual logger.
   */
  metadata: LoggerMetadata;

  /**
   * Creates a new logger and inherits new metadata.
   * @param meta the metadata to inherit
   */
  child(meta: LoggerMetadata): Logger;
};

/**
 * Creates a new wrapper which appends metadata when logging a message.
 * @param logger the logger
 * @param metadata metadata to append when logging a message
 */
export function Logger(
  logger?: winston.Logger | winston.LoggerOptions,
  metadata?: LoggerMetadata,
): void;
export function Logger(
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
    get(target: winston.Logger, property: string): any {
      if (property === "metadata") {
        /**
         * The current metadata.
         */
        return metadata;
      }

      if (property === "child") {
        /**
         * Creates a sub-logger.
         * @param meta the metadata to merge
         */
        return function child(meta: LoggerMetadata): Logger {
          return new Logger(logger, { ...metadata, ...meta });
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
