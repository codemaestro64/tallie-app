import pino, { LoggerOptions } from "pino"
import { NodeEnv } from "../types";
import { env } from "../env"

const getLoggerOptions = (): LoggerOptions => {
  if (env.NODE_ENV === NodeEnv.Production) {
    return {
      level: env.LOG_LEVEL
    };
  }

  return {
    level: env.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
      },
    },
  };
};

const logger = pino(getLoggerOptions());

export default logger;
