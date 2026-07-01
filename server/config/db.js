import mongoose from "mongoose";

const getMongoUri = () => {
  const isProduction =
    process.env.NODE_ENV ===
    "production";

  if (
    !isProduction &&
    process.env.MONGO_URI_LOCAL
  ) {
    return {
      uri: process.env.MONGO_URI_LOCAL,
      source: "MONGO_URI_LOCAL",
    };
  }

  return {
    uri: process.env.MONGO_URI,
    source: "MONGO_URI",
  };
};

const connectDB = async () => {
  const { uri, source } =
    getMongoUri();

  if (!uri) {
    console.error(
      "MongoDB Connection Error: MONGO_URI is not set"
    );

    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(
      uri,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      `MongoDB Connected (${source}): ${conn.connection.host}`
    );
  } catch (error) {
    console.error(
      `MongoDB Connection Error: ${error.message}`
    );

    if (
      source === "MONGO_URI" &&
      process.env.NODE_ENV !==
        "production" &&
      uri.startsWith(
        "mongodb+srv://"
      )
    ) {
      console.error(
        "Local development is using an Atlas SRV URI. If your network blocks SRV DNS lookups, set MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/progress-tracker or use a non-SRV MongoDB URI for local development."
      );
    }

    process.exit(1);
  }
};

export default connectDB;
