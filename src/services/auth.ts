import { UserAccount, PlayerProfile, InventoryItem, Achievement, DailyQuest } from '../types';
import { StorageService, INITIAL_PLAYER_PROFILE, ALL_DEFAULT_ITEMS, DEFAULT_ACHIEVEMENTS, DEFAULT_DAILY_QUESTS } from './storage';

const AUTH_STORAGE_KEYS = {
  ACCOUNTS: 'arcadex_registered_accounts',
  CURRENT_USER: 'arcadex_current_user',
  USER_DATA_PREFIX: 'arcadex_user_data_',
};

// Simple cryptographic-like string hashing for local client credential validation
export function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  // Secondary salt pass
  let saltHash = 5381;
  const saltedStr = `arcadex_salt_${password}_2026`;
  for (let i = 0; i < saltedStr.length; i++) {
    saltHash = (saltHash * 33) ^ saltedStr.charCodeAt(i);
  }
  return `hx_${Math.abs(hash).toString(16)}_${Math.abs(saltHash).toString(16)}`;
}

export interface RegisterParams {
  username: string;
  email?: string;
  password: string;
  avatar?: string;
  keepGuestData?: boolean;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: UserAccount;
}

export class AuthService {
  /**
   * Get all registered accounts saved in local storage
   */
  public static getRegisteredAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEYS.ACCOUNTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  }

  /**
   * Save the list of registered accounts
   */
  private static saveAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch {
      // ignore
    }
  }

  /**
   * Get current authenticated user or null if guest
   */
  public static getCurrentUser(): UserAccount | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      if (data) {
        const user = JSON.parse(data);
        if (user && !user.isGuest) {
          return user;
        }
      }
    } catch {
      // fallback
    }
    return null;
  }

  /**
   * Set current authenticated session
   */
  public static setCurrentUser(user: UserAccount | null): void {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      }
    } catch {
      // ignore
    }
  }

  /**
   * Save a user's isolated game data slot (profile, inventory, achievements, etc.)
   */
  public static saveUserDataSlot(userId: string): void {
    try {
      const slotData = StorageService.exportDataBackup();
      localStorage.setItem(`${AUTH_STORAGE_KEYS.USER_DATA_PREFIX}${userId}`, slotData);
    } catch {
      // ignore
    }
  }

  /**
   * Load a user's isolated game data slot into active storage
   */
  public static loadUserDataSlot(userId: string, defaultUsername?: string, defaultAvatar?: string): boolean {
    try {
      const slotData = localStorage.getItem(`${AUTH_STORAGE_KEYS.USER_DATA_PREFIX}${userId}`);
      if (slotData) {
        return StorageService.importDataBackup(slotData);
      } else {
        // Create initial clean profile for this new user
        const newProfile: PlayerProfile = {
          ...INITIAL_PLAYER_PROFILE,
          id: userId,
          username: defaultUsername || 'Player',
          avatar: defaultAvatar || '🎮',
          createdAt: Date.now(),
        };
        StorageService.saveProfile(newProfile);
        StorageService.saveInventory(ALL_DEFAULT_ITEMS);
        StorageService.saveAchievements(DEFAULT_ACHIEVEMENTS);
        StorageService.saveDailyQuests(DEFAULT_DAILY_QUESTS);
        this.saveUserDataSlot(userId);
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Register a new user account
   */
  public static register(params: RegisterParams): AuthResult {
    const trimmedUsername = params.username.trim();
    const trimmedEmail = params.email?.trim().toLowerCase() || undefined;
    const password = params.password;

    // Validations
    if (!trimmedUsername) {
      return { success: false, error: 'Vui lòng nhập tên tài khoản!' };
    }
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return { success: false, error: 'Tên tài khoản phải từ 3 đến 20 ký tự!' };
    }
    const usernameRegex = /^[a-zA-Z0-9_.\s\u00C0-\u024F\u1E00-\u1EFF]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return { success: false, error: 'Tên tài khoản chỉ được chứa chữ, số và dấu gạch dưới!' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự!' };
    }
    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        return { success: false, error: 'Địa chỉ email không đúng định dạng!' };
      }
    }

    const accounts = this.getRegisteredAccounts();

    // Check duplicate username
    const existingName = accounts.find(
      (a) => a.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (existingName) {
      return { success: false, error: 'Tên tài khoản này đã được sử dụng. Vui lòng chọn tên khác!' };
    }

    // Check duplicate email
    if (trimmedEmail) {
      const existingEmail = accounts.find(
        (a) => a.email && a.email.toLowerCase() === trimmedEmail
      );
      if (existingEmail) {
        return { success: false, error: 'Địa chỉ email này đã được liên kết với một tài khoản khác!' };
      }
    }

    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const avatar = params.avatar || '🎮';
    const now = Date.now();

    const newAccount: UserAccount = {
      id: userId,
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash: hashPassword(password),
      avatar: avatar,
      currentTitle: 'Tân Binh Arcade',
      createdAt: now,
      lastLoginAt: now,
      isGuest: false,
    };

    // Save previous active user's slot if logged in
    const prevUser = this.getCurrentUser();
    if (prevUser && prevUser.id) {
      this.saveUserDataSlot(prevUser.id);
    }

    if (params.keepGuestData) {
      // Migrate current guest data to new user
      const currentProfile = StorageService.loadProfile();
      currentProfile.id = userId;
      currentProfile.username = trimmedUsername;
      if (params.avatar) currentProfile.avatar = params.avatar;
      StorageService.saveProfile(currentProfile);
      this.saveUserDataSlot(userId);
    } else {
      // Initialize fresh user data slot
      this.loadUserDataSlot(userId, trimmedUsername, avatar);
    }

    // Add to accounts list
    accounts.push(newAccount);
    this.saveAccounts(accounts);
    this.setCurrentUser(newAccount);

    return {
      success: true,
      user: newAccount,
    };
  }

  /**
   * Log in with username/email and password
   */
  public static login(usernameOrEmail: string, password: string): AuthResult {
    const query = usernameOrEmail.trim().toLowerCase();
    if (!query) {
      return { success: false, error: 'Vui lòng nhập tên đăng nhập hoặc email!' };
    }
    if (!password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu!' };
    }

    const accounts = this.getRegisteredAccounts();
    const account = accounts.find(
      (a) =>
        a.username.toLowerCase() === query ||
        (a.email && a.email.toLowerCase() === query)
    );

    if (!account) {
      return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại hoặc đăng ký!' };
    }

    const inputHash = hashPassword(password);
    if (account.passwordHash !== inputHash) {
      return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại!' };
    }

    // Save current active user before switching
    const prevUser = this.getCurrentUser();
    if (prevUser && prevUser.id) {
      this.saveUserDataSlot(prevUser.id);
    }

    // Update account lastLoginAt
    account.lastLoginAt = Date.now();
    this.saveAccounts(accounts);
    this.setCurrentUser(account);

    // Load account's game data slot
    this.loadUserDataSlot(account.id, account.username, account.avatar);

    return {
      success: true,
      user: account,
    };
  }

  /**
   * Log out and switch to guest mode
   */
  public static logout(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.saveUserDataSlot(currentUser.id);
    }
    this.setCurrentUser(null);
  }

  /**
   * Switch directly to another registered account
   */
  public static switchAccount(userId: string): AuthResult {
    const accounts = this.getRegisteredAccounts();
    const target = accounts.find((a) => a.id === userId);
    if (!target) {
      return { success: false, error: 'Không tìm thấy tài khoản!' };
    }

    const prevUser = this.getCurrentUser();
    if (prevUser && prevUser.id) {
      this.saveUserDataSlot(prevUser.id);
    }

    target.lastLoginAt = Date.now();
    this.saveAccounts(accounts);
    this.setCurrentUser(target);
    this.loadUserDataSlot(target.id, target.username, target.avatar);

    return { success: true, user: target };
  }

  /**
   * Delete an account from the device
   */
  public static deleteAccount(userId: string): boolean {
    let accounts = this.getRegisteredAccounts();
    accounts = accounts.filter((a) => a.id !== userId);
    this.saveAccounts(accounts);
    localStorage.removeItem(`${AUTH_STORAGE_KEYS.USER_DATA_PREFIX}${userId}`);

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      this.logout();
    }
    return true;
  }
}
