
import winston from "winston"
import path from "path";

const logsDir = path.join(__dirname, "../../logs")

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'app-service' },
  transports: [
    
    new winston.transports.File({ filename: path.join(logsDir, "error.log"), level: 'error' }),
    
    new winston.transports.File({ filename: path.join(logsDir, "combined.log") }),
  ],
},

);

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  }));
  
}

export default logger