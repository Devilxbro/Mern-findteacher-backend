import env from "../../env.json";

type EnvKeys = "local" | "development" | "production";

interface EnvConfig {
  PORT: number;
  API_URL: string;
  DEBUG: boolean;
  MONGO_URI: string;
  JWT_SECRET: string; // Fix: type should be string
}

const envConfig = (): EnvConfig => {
  const nodeEnv = (process.env.NODE_ENV ?? "local") as EnvKeys;

  const config = env[nodeEnv] as EnvConfig;

  // Optional: sanity check
  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in env.json for " + nodeEnv);
  }

  return config;
};

export default envConfig;
