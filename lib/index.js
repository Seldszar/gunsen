const isPlainObject = require("lodash.isplainobject");

/**
 * Wraps a logger which appends metadata when logging a message.
 * @param {*} logger the logger
 * @param {Object} [metadata={}] metadata to append when logging a message
 * @return {*} the wrapped logger.
 */
function Logger(logger, metadata = {}) {
  return new Proxy(logger, {
    get(target, property) {
      if (property === "metadata") {
        return metadata;
      }

      if (property === "child") {
        return meta => {
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
