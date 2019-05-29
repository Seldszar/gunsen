import * as stream from "stream";
import * as winston from "winston";

import * as gunsen from "..";

function createLogger(write?: (data: winston.LogEntry) => void): gunsen.Logger {
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

describe("Logger()", (): void => {
  test("should instanciate with an embedded logger", (): void => {
    const logger = new gunsen.Logger();

    expect(typeof logger.child).toBe("function");
    expect(typeof logger.exitOnError).toBe("boolean");
  });

  test("should expose original properties", (): void => {
    const logger = createLogger();

    expect(typeof logger.level).toBe("string");
    expect(typeof logger.exitOnError).toBe("boolean");
  });

  test("should expose additional properties", (): void => {
    const logger = createLogger();

    expect(typeof logger.child).toBe("function");
    expect(typeof logger.metadata).toBe("object");
  });

  test("should add metadata", (): void => {
    const logger = createLogger(
      (data: winston.LogEntry): void => {
        expect(data.level).toBe("info");
        expect(data.message).toBe("Hello!");
        expect(data.username).toBe("Seldszar");
      },
    );

    logger.child({ username: "Seldszar" }).info("Hello!");
  });

  test("should merge metadata", (): void => {
    const logger = createLogger(
      (data: winston.LogEntry): void => {
        expect(data.level).toBe("info");
        expect(data.message).toBe("Hello!");
        expect(data.username).toBe("Seldszar");
        expect(data.success).toBe(true);
      },
    );

    logger.child({ username: "Seldszar" }).info("Hello!", { success: true });
  });

  test("should replace metadata with same keys", (): void => {
    const logger = createLogger(
      (data: winston.LogEntry): void => {
        expect(data.level).toBe("info");
        expect(data.message).toBe("Hello!");
        expect(data.username).toBe("Oof");
      },
    );

    logger.child({ username: "Seldszar" }).info("Hello!", { username: "Oof" });
  });
});
