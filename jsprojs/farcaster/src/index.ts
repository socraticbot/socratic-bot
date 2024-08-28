import express from 'express';
import { CastWithInteractions } from '@standard-crypto/farcaster-js-neynar/v1';

import * as chat from './services/chatserver';
import { neynar } from './services/neynar';

import { config } from './config';

const seen = new Set<string>();
const conversationIds = new Map<string, string>();

const ONE_DAY_MS = 1_000 * 60 * 60 * 24;

async function handleNotification(notification: any): Promise<void> {
  console.log('Got notification', notification);
  let castHash: string | undefined;
  try {
    // Check if valid
    if (
      // notification.type !== 'cast-mention' &&
      // notification.type !== 'cast-reply' &&
      +notification.author.fid === config.FID ||
      config.BANNED_USER_IDS.includes(+notification.author.fid) ||
      !notification.text ||
      !notification.hash
    ) {
      console.log('Cannot process notification', notification);
      return;
    }

    castHash = notification.hash as string;
    // Get thread hash
    const threadHash = notification.thread_hash || notification.hash;
    // Check if we've seen this notification
    // TODO: Store in a datastore to avoid getting OOMkilled
    if (seen.has(notification.hash)) {
      return;
    }
    seen.add(notification.hash);

    // if (new Date(notification.event_timestamp).getTime() < Date.now() - ONE_DAY_MS) {
    //   return;
    // }

    // Get response
    const conversationId = conversationIds.get(threadHash);
    let response: string;
    if (!conversationId) {
      const conversation = await chat.createConversation(notification.text);
      conversationIds.set(threadHash, conversation.conversation_id);
      response = conversation.message;
    } else {
      response = await chat.sendMessage(conversationId, notification.text);
    }

    response = response.trim();
    response = response.slice(0, 320);

    if (response.length <= 320) {
      await publishCast(response, notification.hash);
    } else {
      await publishCast(
        'I tried to generate a reply under 320 characters but failed. So sorry, try again later!',
        castHash,
      );
    }
  } catch (error) {
    console.log(error instanceof Error ? error.message : error);
    if (castHash) {
      const errorMessage = error instanceof Error ? error.message : error;
      if (`${errorMessage}`.includes('127.0.0.1:27017')) {
        return;
      }
      await publishCast(
        `So sorry, I experienced an error, try again later: ${
          error instanceof Error ? error.message : error
        }`.substring(0, 320),
        castHash,
      );
    }
  }
}

async function publishCast(text: string, replyTo: string) {
  console.log('Publishing cast', text);
  const cast = await neynar.v2.publishCast(config.NEYNAR_SIGNER_UUID, text, {
    replyTo: replyTo,
  });
  return cast.hash;
}

const app = express();
app.use(express.json());
app.use('/webhook', async (req, res) => {
  console.log(req.method, req.body);

  try {
    await handleNotification(req.body.data);
    res.status(200).end();
  } catch (error) {
    console.error('Error handling notification', error);
    res.status(500).end();
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
