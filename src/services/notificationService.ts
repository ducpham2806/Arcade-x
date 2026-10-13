/**
 * Browser-based Notification Service (Notification API)
 * Handles native system notifications for daily quests, challenges, and PvP matches
 * with automatic fallback and in-app sound/banner triggers.
 */

export interface AppNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
  onClick?: () => void;
}

export class NotificationService {
  private static readonly PERMISSION_KEY = 'arcadex_notifications_permission_requested';
  private static readonly SETTINGS_ENABLED_KEY = 'arcadex_notifications_enabled';

  /**
   * Check if the browser environment supports the Notification API
   */
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current permission state: 'granted' | 'denied' | 'default' | 'unsupported'
   */
  public static getPermission(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Check if notifications are enabled by user settings
   */
  public static isEnabledInSettings(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(this.SETTINGS_ENABLED_KEY);
    return stored === null ? true : stored === 'true';
  }

  /**
   * Toggle notifications enabled in user settings
   */
  public static setEnabledInSettings(enabled: boolean): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.SETTINGS_ENABLED_KEY, enabled ? 'true' : 'false');
  }

  /**
   * Request permission from the user
   */
  public static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notification API is not supported in this browser environment.');
      return false;
    }

    try {
      if (Notification.permission === 'granted') {
        this.setEnabledInSettings(true);
        return true;
      }

      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        localStorage.setItem(this.PERMISSION_KEY, 'true');
        const granted = permission === 'granted';
        this.setEnabledInSettings(granted);
        return granted;
      }

      return false;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return false;
    }
  }

  /**
   * Dispatch a browser notification
   */
  public static send(options: AppNotificationOptions): Notification | null {
    if (!this.isSupported() || !this.isEnabledInSettings()) {
      return null;
    }

    if (Notification.permission !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        silent: options.silent ?? false,
        data: options.data,
      });

      notification.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        notification.close();
      };

      // Auto close after 6 seconds
      setTimeout(() => {
        try {
          notification.close();
        } catch {
          // Ignore
        }
      }, 6000);

      return notification;
    } catch (err) {
      console.warn('Failed to display browser notification:', err);
      return null;
    }
  }

  /**
   * Notification Trigger: Daily Quest Completed
   */
  public static notifyQuestCompleted(questTitle: string, rewardSummary: string = 'Nhận thưởng ngay!'): void {
    this.send({
      title: '🎯 Nhiệm Vụ Hoàn Thành!',
      body: `Bạn vừa hoàn thành nhiệm vụ "${questTitle}". ${rewardSummary}`,
      tag: 'quest-completed',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'quests' } }));
      },
    });
  }

  /**
   * Notification Trigger: New Daily Challenge Available
   */
  public static notifyNewDailyChallenge(gameTitle: string, rewardCoins: number = 200): void {
    this.send({
      title: '⚡ Thử Thách Ngày Mới!',
      body: `Thử thách mới cho ${gameTitle} đã sẵn sàng! Chinh phục mục tiêu để nhận +${rewardCoins} Coins.`,
      tag: 'new-daily-challenge',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'dailyChallenges' } }));
      },
    });
  }

  /**
   * Notification Trigger: PvP Match Found
   */
  public static notifyMatchFound(opponentName: string, gameTitle: string = 'Cờ Tướng'): void {
    this.send({
      title: `⚔️ Đã Tìm Thấy Đối Thủ - ${gameTitle}!`,
      body: `Bạn sẽ thi đấu với ${opponentName}. Trận đấu bắt đầu ngay bây giờ!`,
      tag: 'match-found',
      onClick: () => {
        window.focus();
      },
    });
  }

  /**
   * Notification Trigger: Direct Friend Challenge Received
   */
  public static notifyChallengeAvailable(challengerName: string, gameTitle: string = 'Cờ Tướng'): void {
    this.send({
      title: `⚔️ Lời Thách Đấu Mới Từ ${challengerName}!`,
      body: `${challengerName} muốn đấu 1v1 trong game ${gameTitle}. Bấm để xem lời mời!`,
      tag: 'friend-challenge',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'friends' } }));
      },
    });
  }

  /**
   * Notification Trigger: Gift Received / Check-in Reward Claimed
   */
  public static notifyGiftReceived(giftTitle: string, rewardDetails: string): void {
    this.send({
      title: `🎁 Nhận Quà Thành Công!`,
      body: `Bạn đã nhận phần thưởng "${giftTitle}": ${rewardDetails}. Đăng nhập mỗi ngày để nhận thêm quà hấp dẫn!`,
      tag: 'gift-received',
      onClick: () => {
        window.dispatchEvent(new CustomEvent('arcadex:open_modal', { detail: { modal: 'dailyLogin' } }));
      },
    });
  }
}

