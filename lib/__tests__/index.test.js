const stream = require("stream");
const winston = require("winston");
const gunsen = require("../");

function createLogger(write) {
  return new gunsen.Logger(
    winston.createLogger({
      transports: [
        new winston.transports.Stream({
          stream: new stream.Writable({ write, objectMode: true }),
        }),
      ],
    }),
  );
}

describe("Logger()", () => {
  test("should instanciate with an embedded logger", () => {
    const logger = new gunsen.Logger();

    expect(typeof logger.child).toBe("function");
    expect(typeof logger.exitOnError).toBe("boolean");
  });

  test("should expose original properties", () => {
    const logger = createLogger();

    expect(typeof logger.level).toBe("string");
    expect(typeof logger.exitOnError).toBe("boolean");
  });

  test("should expose additional properties", () => {
    const logger = createLogger();

    expect(typeof logger.child).toBe("function");
    expect(typeof logger.metadata).toBe("object");
  });

  test("should add metadata", () => {
    const logger = createLogger(data => {
      expect(data.level).toBe("info");
      expect(data.message).toBe("Hello!");
      expect(data.username).toBe("Seldszar");
    });

    logger.child({ username: "Seldszar" }).info("Hello!");
  });

  test("should merge metadata", () => {
    const logger = createLogger(data => {
      expect(data.level).toBe("info");
      expect(data.message).toBe("Hello!");
      expect(data.username).toBe("Seldszar");
      expect(data.success).toBe(true);
    });

    logger.child({ username: "Seldszar" }).info("Hello!", { success: true });
  });

  test("should replace metadata with same keys", () => {
    const logger = createLogger(data => {
      expect(data.level).toBe("info");
      expect(data.message).toBe("Hello!");
      expect(data.username).toBe("Oof");
    });

    logger.child({ username: "Seldszar" }).info("Hello!", { username: "Oof" });
  });
});
