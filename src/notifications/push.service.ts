import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, Messaging, MulticastMessage } from 'firebase-admin/messaging';
import { Environment } from '../common/configuration/environment.interface.js';

export interface PushMessage {
  title: string;
  body: string;
  /** String-only payload delivered to the app (deep links). */
  data?: Record<string, string>;
  /**
   * "order_alarm" uses the loud custom sound + high priority channel so the
   * cashier hears new orders even when the app is in the background.
   */
  sound?: 'default' | 'order_alarm';
}

export const CUSTOMERS_TOPIC = 'customers';
const FCM_BATCH = 500;
const INVALID_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
]);

/**
 * Thin wrapper over Firebase Cloud Messaging. When FIREBASE_* credentials are
 * not configured every method is a logged no-op, so the API keeps working in
 * development and tests.
 */
@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private messaging?: Messaging;

  constructor(private readonly config: ConfigService<Environment, true>) {}

  onModuleInit() {
    const fb = this.config.get('firebase', { infer: true });
    try {
      let credentials: { projectId?: string; clientEmail?: string; privateKey?: string } | undefined;
      if (fb.serviceAccountPath) {
        const json = JSON.parse(readFileSync(fb.serviceAccountPath, 'utf8'));
        credentials = { projectId: json.project_id, clientEmail: json.client_email, privateKey: json.private_key };
      } else if (fb.projectId && fb.clientEmail && fb.privateKey) {
        credentials = { projectId: fb.projectId, clientEmail: fb.clientEmail, privateKey: fb.privateKey };
      }

      if (!credentials) {
        this.logger.warn('Firebase is not configured (FIREBASE_*); push notifications are disabled.');
        return;
      }

      const app: App =
        getApps().find((a) => a.name === 'takefive') ??
        initializeApp({ credential: cert(credentials) }, 'takefive');
      this.messaging = getMessaging(app);
      this.logger.log('Firebase Cloud Messaging is enabled');
    } catch (err: any) {
      this.logger.error(`Firebase initialisation failed: ${err.message}`);
    }
  }

  get isEnabled() {
    return !!this.messaging;
  }

  private platformOptions(msg: PushMessage) {
    const alarm = msg.sound === 'order_alarm';
    return {
      android: {
        priority: 'high' as const,
        notification: {
          channelId: alarm ? 'new_orders' : 'general',
          sound: alarm ? 'order_alarm' : 'default',
        },
      },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: {
          aps: {
            sound: alarm ? 'order_alarm.caf' : 'default',
            ...(alarm && { 'interruption-level': 'time-sensitive' }),
          },
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: { requireInteraction: alarm },
      },
    };
  }

  /** Sends to specific devices; returns tokens FCM reported as dead. */
  async sendToTokens(tokens: string[], msg: PushMessage): Promise<string[]> {
    const unique = [...new Set(tokens)].filter(Boolean);
    if (!unique.length) return [];
    if (!this.messaging) {
      this.logger.debug(`[push disabled] -> ${unique.length} device(s): ${msg.title}`);
      return [];
    }

    const invalid: string[] = [];
    for (let i = 0; i < unique.length; i += FCM_BATCH) {
      const batch = unique.slice(i, i + FCM_BATCH);
      const message: MulticastMessage = {
        tokens: batch,
        notification: { title: msg.title, body: msg.body },
        data: msg.data,
        ...this.platformOptions(msg),
      };
      try {
        const res = await this.messaging.sendEachForMulticast(message);
        res.responses.forEach((r, idx) => {
          if (!r.success && r.error && INVALID_TOKEN_CODES.has(r.error.code)) invalid.push(batch[idx]);
        });
      } catch (err: any) {
        this.logger.error(`FCM multicast failed: ${err.message}`);
      }
    }
    return invalid;
  }

  async sendToTopic(topic: string, msg: PushMessage): Promise<void> {
    if (!this.messaging) {
      this.logger.debug(`[push disabled] -> topic ${topic}: ${msg.title}`);
      return;
    }
    try {
      await this.messaging.send({
        topic,
        notification: { title: msg.title, body: msg.body },
        data: msg.data,
        ...this.platformOptions(msg),
      });
    } catch (err: any) {
      this.logger.error(`FCM topic send failed: ${err.message}`);
    }
  }

  async subscribe(tokens: string[], topic: string) {
    if (!this.messaging || !tokens.length) return;
    try {
      await this.messaging.subscribeToTopic(tokens, topic);
    } catch (err: any) {
      this.logger.error(`FCM subscribe failed: ${err.message}`);
    }
  }

  async unsubscribe(tokens: string[], topic: string) {
    if (!this.messaging || !tokens.length) return;
    try {
      await this.messaging.unsubscribeFromTopic(tokens, topic);
    } catch (err: any) {
      this.logger.error(`FCM unsubscribe failed: ${err.message}`);
    }
  }
}
