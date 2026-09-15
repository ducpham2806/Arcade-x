/**
 * Haptic Feedback Service
 * Provides responsive tactile feedback via the Web Vibration API (navigator.vibrate)
 * for high-impact interactions like fruit slicing, chest opening, and claiming rewards.
 */

const HAPTICS_STORAGE_KEY = 'arcadex_haptics_enabled';

class HapticService {
  private enabled: boolean = true;
  private supported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.supported = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
      try {
        const stored = localStorage.getItem(HAPTICS_STORAGE_KEY);
        if (stored !== null) {
          this.enabled = stored === 'true';
        } else {
          this.enabled = true;
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  public isSupported(): boolean {
    return this.supported;
  }

  public isEnabled(): boolean {
    return this.enabled && this.supported;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    try {
      localStorage.setItem(HAPTICS_STORAGE_KEY, enabled ? 'true' : 'false');
    } catch {
      // ignore
    }
    if (enabled && this.supported) {
      this.vibrate(20);
    }
  }

  public toggle(): boolean {
    const next = !this.enabled;
    this.setEnabled(next);
    return next;
  }

  /**
   * Internal safe vibration trigger
   */
  public vibrate(pattern: number | number[]): boolean {
    if (!this.enabled || !this.supported) return false;
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        return navigator.vibrate(pattern);
      }
    } catch {
      // Silently catch browser policy restrictions or user-activation errors
    }
    return false;
  }

  /**
   * Crisp, punchy tactile pulse for slicing normal fruits or items
   */
  public slice(): void {
    this.vibrate(18);
  }

  /**
   * Energetic double pulse for special fruits (Freeze, Frenzy, Golden Fruit)
   */
  public sliceSpecial(): void {
    this.vibrate([25, 20, 35]);
  }

  /**
   * Heavy rumble for hitting a bomb or taking damage
   */
  public bomb(): void {
    this.vibrate([60, 40, 80]);
  }

  /**
   * Dynamic ascending vibration for combo milestones
   */
  public combo(streak: number = 3): void {
    if (streak >= 7) {
      this.vibrate([30, 25, 45, 25, 60]);
    } else {
      this.vibrate([20, 25, 30]);
    }
  }

  /**
   * Suspense build-up and grand pop when opening any chest
   */
  public openChest(): void {
    this.vibrate([30, 40, 50, 40, 90]);
  }

  /**
   * High-tier chest unlock (Legendary / Mythic)
   */
  public chestLegendary(): void {
    this.vibrate([40, 30, 60, 30, 80, 40, 120]);
  }

  /**
   * Celebratory rhythmic pulses for claiming daily rewards, quest loot, or streak bonuses
   */
  public claimReward(): void {
    this.vibrate([25, 35, 45]);
  }

  /**
   * Triumphant fanfare vibration for player Level Up
   */
  public levelUp(): void {
    this.vibrate([40, 30, 60, 30, 100]);
  }

  /**
   * Satisfying metallic clash vibration for item crafting or recipe discovery
   */
  public craft(): void {
    this.vibrate([35, 25, 45]);
  }

  /**
   * Subtle tick for button taps, inventory equips, or UI selections
   */
  public light(): void {
    this.vibrate(10);
  }

  public tap(): void {
    this.light();
  }

  /**
   * Medium tactile click
   */
  public medium(): void {
    this.vibrate(25);
  }

  /**
   * Heavier shockpulse for game over or critical impacts
   */
  public heavy(): void {
    this.vibrate(50);
  }

  /**
   * Rejection or error buzz
   */
  public error(): void {
    this.vibrate([40, 50, 40]);
  }

  public success(): void {
    this.vibrate([30, 40, 50]);
  }

  /**
   * Test pattern for settings confirmation
   */
  public test(): void {
    this.vibrate([30, 30, 60]);
  }
}

export const hapticService = new HapticService();
