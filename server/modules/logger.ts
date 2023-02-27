import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// TODO: Add OpenTelemetry Logger implementation, posponed due to experimental feature (https://opentelemetry.io/docs/reference/specification/logs/)
export function getServiceLogger(serviceName: string) {
  // info file transport
  const transportINFO = new DailyRotateFile({
    level: "info",
    filename: `./data/logs/${serviceName}-%DATE%.log`,
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "5",
  });

  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      format.label({ label: `${serviceName || "your-service-name"}` }),
      format.errors({ stack: false }),
      format.splat(),
      format.json()
    ),
    // defaultMeta: { service: serviceName || "your-service-name" },
    transports: [
      transportINFO,
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.printf(
            (info) =>
              `${info.timestamp} [${info.label}] ${info.level}: ${info.message} `
          )
        ),
      }),
    ],
  });
}
