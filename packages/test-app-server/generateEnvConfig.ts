export type EnvConfig = {
  port: number;
  openDelay?: number;
  messageDelay?: number;
};

export const generateEnvConfig = (): EnvConfig => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 6844;

  const openDelay: number | undefined = process.env.OPEN_DELAY
    ? parseInt(process.env.OPEN_DELAY, 10)
    : undefined;

  const messageDelay: number | undefined = process.env.MESSAGE_DELAY
    ? parseInt(process.env.MESSAGE_DELAY, 10)
    : undefined;

  return {
    port,
    openDelay,
    messageDelay,
  };
};
