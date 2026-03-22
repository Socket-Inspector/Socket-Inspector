export function isSocketIO(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const isEngineIOV4 =
      url?.searchParams?.get('EIO') === '4' && url?.searchParams?.get('transport') === 'websocket';
    return isEngineIOV4;
  } catch {
    return false;
  }
}
