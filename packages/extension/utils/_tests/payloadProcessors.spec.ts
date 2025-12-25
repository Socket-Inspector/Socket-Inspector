import { describe, it, expect } from 'vitest';
import { processJsonPayload } from '../payloadProcessors';

describe('processJsonPayload', () => {
  it('should fail for empty string', () => {
    const result = processJsonPayload('');
    expect(result.success).toBe(false);
  });
  it('should pass for valid json string', () => {
    const payload = JSON.stringify({ dog: true });
    const result = processJsonPayload(payload);
    expect(result.success).toBe(true);
  });
});
