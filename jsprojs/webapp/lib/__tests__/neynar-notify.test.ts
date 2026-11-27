import { beforeEach, describe, expect, it, vi } from 'vitest';

const publish = vi.fn();
vi.mock('@neynar/nodejs-sdk', () => ({
  Configuration: class {},
  NeynarAPIClient: class {
    publishFrameNotifications = publish;
  },
}));

const notification = { title: 't', body: 'b', target_url: 'https://www.socratic.bot/farcaster?day=1', uuid: 'u' };

describe('sendNotification', () => {
  beforeEach(() => {
    vi.resetModules();
    publish.mockReset();
    process.env.NEYNAR_API_KEY = 'test-key';
  });

  it("reports Neynar's own counts instead of assuming every target was delivered", async () => {
    publish.mockResolvedValue({ campaign_id: 'c', success_count: 1, failure_count: 1, not_attempted_count: 3, retryable_fids: [9] });
    const { sendNotification } = await import('@/lib/server/neynar');
    expect(await sendNotification([1, 2, 3, 4, 5, 9], notification)).toEqual({
      success: 1,
      failure: 1,
      notAttempted: 3,
      retryable: 1,
    });
    expect(publish).toHaveBeenCalledWith({ targetFids: [1, 2, 3, 4, 5, 9], notification });
  });

  it('never calls Neynar with an empty target list (that would notify everyone)', async () => {
    const { sendNotification } = await import('@/lib/server/neynar');
    expect(await sendNotification([], notification)).toEqual({ success: 0, failure: 0, notAttempted: 0, retryable: 0 });
    expect(publish).not.toHaveBeenCalled();
  });
});

describe('describeNeynarError', () => {
  it('keeps the status and message, and nothing from the request', async () => {
    const { describeNeynarError } = await import('@/lib/server/neynar');
    const error = {
      message: 'Request failed with status code 400',
      config: { headers: { 'x-api-key': 'secret-key' } },
      response: { status: 400, data: { message: 'target_url_mismatch' } },
    };
    const text = describeNeynarError(error);
    expect(text).toBe('400: target_url_mismatch');
    expect(text).not.toContain('secret-key');
  });
});
