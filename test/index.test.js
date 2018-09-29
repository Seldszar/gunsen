const stream = require("stream");
const winston = require("winston");
const gunsen = require("../lib");

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
  test("should expose additional methods", () => {
    expect(typeof createLogger().child).toBe("function");
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
