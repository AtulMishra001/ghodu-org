import "server-only";
import mongoose from "mongoose";
import { env } from "./env";

// One Mongoose connection per server process. In dev, hot reloads would
// otherwise open a new connection on every edit, so it's kept on globalThis.
const g = globalThis as typeof globalThis & { _mongoose?: Promise<typeof mongoose> };

export function connectDB() {
  g._mongoose ??= mongoose
    .connect(env("MONGODB_URI"), {
      // Uses the database named in the URI (…mongodb.net/<db>), or MONGODB_DB if set.
      dbName: process.env.MONGODB_DB || undefined,
      maxPoolSize: 10,
      bufferCommands: false, // fail fast instead of queueing queries while disconnected
    })
    .catch((err) => {
      g._mongoose = undefined; // let the next request retry
      throw err;
    });
  return g._mongoose;
}
