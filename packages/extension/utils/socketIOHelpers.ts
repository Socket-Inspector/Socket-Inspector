export const isSocketIOConnection = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url?.searchParams?.get("EIO") === "4" && url?.searchParams?.get("transport") === "websocket";
  } catch {
    return false;
  }
};

export const parseSocketIOPacket = (encodedPacket: string) => {
  return {};
};
