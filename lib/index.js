const isPlainObject = require("lodash.isplainobject");
const winston = require("winston");

/**
 * A wrapper which appends metadata when logging a message.
 * @constructor
 * @param {*} logger the logger
 * @param {Object} [metadata={}] metadata to append when logging a message
 */
function Logger(logger, metadata = {}) {
  if (logger == null || isPlainObject(logger)) {
    logger = winston.createLogger(logger);
  }

  return new Proxy(logger, {
    get(target, property) {
      if (property === "metadata") {
        /**
         * The current metadata.
         * @memberof Logger
         * @type {Object}
         */
        return metadata;
      }

      if (property === "child") {
        /**
         * Creates a sub-logger.
         * @memberof Logger
         * @param {Object} meta the metadata to merge
         * @return {*} the sub-logger.
         */
        return function child(meta) {
          return new Logger(logger, Object.assign({}, metadata, meta));
        };
      }

      if (property === "log" || property in target.levels) {
        return (...args) => {
          const meta = args[args.length - 1];

          if (isPlainObject(meta)) {
            args[args.length - 1] = Object.assign({}, metadata, meta);
          } else {
            args.push(metadata);
          }

          return target[property].apply(target, args);
        };
      }

      return target[property];
    },
  });
}

exports.Logger = Logger;
