/**
 * TODO:
 * consider just consuming this as a getter in the UI instead
 * of sending packet
 */
export function isSocketIO(urlString: string) {
  try {
    const url = new URL(urlString);
    const isEngineIOV4 =
      url?.searchParams?.get('EIO') === '4' && url?.searchParams?.get('transport') === 'websocket';
    return isEngineIOV4;
  } catch {
    return false;
  }
}
