export type ProcessPayloadResult =
  | { success: true; data: string }
  | { success: false; error: string };

export const processJsonPayload = (payload: string): ProcessPayloadResult => {
  if (!payload?.trim()) {
    return {
      success: false,
      error: 'Payload must not be empty',
    };
  }

  try {
    const parsed = JSON.parse(payload);
    return {
      success: true,
      data: JSON.stringify(parsed),
    };
  } catch {
    return {
      success: false,
      error: 'Payload must be valid JSON',
    };
  }
};

export const processTextPayload = (payload: string): ProcessPayloadResult => {
  if (!payload?.trim()) {
    return {
      success: false,
      error: 'Payload must not be empty',
    };
  }

  // Strip leading BOM (if user pasted from UTF-8 file with BOM)
  const cleaned = payload.replace(/^\uFEFF/, '');

  return {
    success: true,
    data: cleaned,
  };
};
