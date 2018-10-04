# Gunsen

> Lacerate attackers with two razorsharp warfans.

Wrapper for Winston appending metadata to messages.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Author](#author)
- [License](#license)

## Installation

```bash
npm install gunsen --save
```

## Usage

```javascript
const gunsen = require("gunsen");
const winston = require("winston");

const logger = new gunsen.Logger(
  winston.createLogger({
    format: winston.format.simple(),
    transports: [new winston.transports.Console()],
  }),
);

// Creates a sub-logger with the given metadata
const sub = logger.child({ username: "Seldszar" });

// Outputs: "error: I don't have metadata."
logger.error("I don't have metadata.");

// Outputs: "info: Hello from this user! {"username":"Seldszar"}"
sub.info("Hello from this user!");

// Outputs: "warn: I can also do that! {"date":1529682533839,"username":"Seldszar"}"
sub.log({ level: "warn", message: "I can also do that!", date: Date.now() });
```

# API

See the detailed [API Reference](API.md).

## Author

Alexandre Breteau - [@0xSeldszar](https://twitter.com/0xSeldszar)

## License

MIT © [Alexandre Breteau](https://seldszar.fr)
