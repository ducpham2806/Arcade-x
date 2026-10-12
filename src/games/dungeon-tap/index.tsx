import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameComponentProps } from '../../types';
import {
  EquipmentItem,
  EquipmentSlot,
  HeroAlly,
  ActiveSkill,
  TitanMonster,
  FloatingDamage,
  SlashEffect,
  DroppedLoot,
  AllyEquipmentItem,
  AllyEquipSlot,
} from './types';
import { generateMonsterForStage, getStoryChapterForStage } from './storyChapters';
import { STARTER_EQUIPMENT, generateLootItem } from './equipmentData';
import { INITIAL_SKILLS, INITIAL_ALLIES } from './skillsAndAllies';
import { generateAllyLootItem, calculateAllyItemPower } from './allyEquipmentData';
import {
  calculateHeroUpgradeCost,
  calculateAllyUpgradeCost,
  calculateSkillUpgradeCost,
  getHeroMilestoneData,
  getAllyMilestoneData,
  getAllySkillLevel,
  getAllySkillEffect,
  formatNumber,
  calculateItemPower,
  calculateItemBasePower,
  isBetterItem,
} from './utils/upgradeMath';
import { TitanArena } from './components/TitanArena';
import { SkillBar } from './components/SkillBar';
import { SwordMasterTab } from './components/SwordMasterTab';
import { HeroesTab } from './components/HeroesTab';
import { EquipmentTab } from './components/EquipmentTab';
import { StoryTab } from './components/StoryTab';
import { StatsTab } from './components/StatsTab';
import { DungeonLeaderboardModal } from './components/DungeonLeaderboardModal';
import { Swords, Users, Shield, BookOpen, Activity, Coins, Sparkles, Trophy, Flag, Zap, Calendar, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { usePlayer } from '../../context/PlayerContext';
import { SupabaseService } from '../../services/supabase';

const SAVE_KEY = 'tap_titans_dungeon_save_v2';

export const DungeonTapGame: React.FC<GameComponentProps> = ({
  bridge,
  isPaused,
  onGameOver,
}) => {
  const { setActiveModal, activeModal } = useGame();
  const { profile, recordGamePlayed } = usePlayer();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);

  // Load saved state or default
  const [stage, setStage] = useState<number>(1);
  const [maxStageReached, setMaxStageReached] = useState<number>(1);
  const [gold, setGold] = useState<number>(100);
  const [heroLevel, setHeroLevel] = useState<number>(1);
  // Max Mana scales with hero level (+5 MP per 5 levels)
  const maxMana = 100 + Math.floor(heroLevel / 5) * 5;
  const [mana, setMana] = useState<number>(100);
  const [bossTimer, setBossTimer] = useState<number>(30);
  const [isFightingBoss, setIsFightingBoss] = useState<boolean>(false);
  const [bossToast, setBossToast] = useState<string | null>(null);
  const bossToastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [equipped, setEquipped] = useState<Record<EquipmentSlot, EquipmentItem | null>>({
    ...STARTER_EQUIPMENT,
  });
  const [inventory, setInventory] = useState<EquipmentItem[]>([
    generateLootItem(1, 'weapon'),
  ]);
  const [allies, setAllies] = useState<HeroAlly[]>(INITIAL_ALLIES);
  const [skills, setSkills] = useState<ActiveSkill[]>(INITIAL_SKILLS);
  const [allyInventory, setAllyInventory] = useState<AllyEquipmentItem[]>(() => [
    generateAllyLootItem(1),
  ]);

  const [monster, setMonster] = useState<TitanMonster>(() => generateMonsterForStage(1));
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [slashes, setSlashes] = useState<SlashEffect[]>([]);
  const [loots, setLoots] = useState<DroppedLoot[]>([]);

  const [activeTab, setActiveTab] = useState<'swordMaster' | 'heroes' | 'equipment' | 'story' | 'stats'>(
    'swordMaster'
  );
  const [heroSlashing, setHeroSlashing] = useState<boolean>(false);
  const [monstersSlain, setMonstersSlain] = useState<number>(0);
  const [bossesSlain, setBossesSlain] = useState<number>(0);
  const [alliesAttacking, setAlliesAttacking] = useState<boolean>(false);
  const [autoPickup, setAutoPickup] = useState<boolean>(true);
  const [autoPickupToast, setAutoPickupToast] = useState<{
    id: number;
    text: string;
    icon: string;
    rarityColor?: string;
  } | null>(null);
  const autoPickupToastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const allyAttackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAutoPickupToast = useCallback(
    (toast: { id: number; text: string; icon: string; rarityColor?: string }) => {
      if (autoPickupToastTimerRef.current) clearTimeout(autoPickupToastTimerRef.current);
      setAutoPickupToast(toast);
      autoPickupToastTimerRef.current = setTimeout(() => {
        setAutoPickupToast(null);
      }, 2000);
    },
    []
  );

  // Load from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.stage) setStage(parsed.stage);
        if (parsed.maxStageReached) setMaxStageReached(parsed.maxStageReached);
        if (parsed.gold !== undefined) setGold(parsed.gold);
        if (parsed.heroLevel) setHeroLevel(parsed.heroLevel);
        if (parsed.equipped) setEquipped(parsed.equipped);
        if (parsed.inventory && Array.isArray(parsed.inventory)) {
          const seen = new Set<string>();
          const cleanInv: EquipmentItem[] = [];
          for (const it of parsed.inventory) {
            if (it && it.id && !seen.has(it.id)) {
              seen.add(it.id);
              cleanInv.push(it);
            }
          }
          setInventory(cleanInv);
        }

        // Merge Allies to guarantee all 3 rotating skills per ally are present
        if (parsed.allies && Array.isArray(parsed.allies)) {
          const mergedAllies = INITIAL_ALLIES.map((initAlly) => {
            const found = parsed.allies.find((a: HeroAlly) => a.id === initAlly.id);
            if (!found) return initAlly;

            const baseSkills = initAlly.skills || [initAlly.skill];
            let allySkills = baseSkills;
            if (found.skills && Array.isArray(found.skills) && found.skills.length >= 3) {
              allySkills = baseSkills.map((sk, idx) => {
                const foundSk = found.skills[idx];
                return foundSk ? { ...sk, ...foundSk } : sk;
              });
            }

            return {
              ...initAlly,
              ...found,
              skills: allySkills,
              skill: allySkills[found.currentSkillIndex || 0] || initAlly.skill,
              equippedWeapon: found.equippedWeapon || initAlly.equippedWeapon,
              equippedArmor: found.equippedArmor || initAlly.equippedArmor,
              equippedAccessory: found.equippedAccessory || initAlly.equippedAccessory,
            };
          });
          setAllies(mergedAllies);
        } else {
          setAllies(INITIAL_ALLIES);
        }

        // Merge Skills to guarantee all 7 Sword Master skills are present
        if (parsed.skills && Array.isArray(parsed.skills)) {
          const mergedSkills = INITIAL_SKILLS.map((initSkill) => {
            const found = parsed.skills.find((s: ActiveSkill) => s.id === initSkill.id);
            return found ? { ...initSkill, ...found } : initSkill;
          });
          setSkills(mergedSkills);
        } else {
          setSkills(INITIAL_SKILLS);
        }

        if (parsed.allyInventory && Array.isArray(parsed.allyInventory)) {
          const seen = new Set<string>();
          const cleanAllyInv: AllyEquipmentItem[] = [];
          for (const it of parsed.allyInventory) {
            if (it && it.id && !seen.has(it.id)) {
              seen.add(it.id);
              cleanAllyInv.push(it);
            }
          }
          setAllyInventory(cleanAllyInv);
        }
        if (parsed.monstersSlain) setMonstersSlain(parsed.monstersSlain);
        if (parsed.bossesSlain) setBossesSlain(parsed.bossesSlain);
        if (parsed.autoPickup !== undefined) setAutoPickup(parsed.autoPickup);
        setMonster(generateMonsterForStage(parsed.stage || 1));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to local storage
  const saveState = useCallback(() => {
    try {
      const seenInv = new Set<string>();
      const cleanInventory = inventory.filter((item) => {
        if (!item?.id || seenInv.has(item.id)) return false;
        seenInv.add(item.id);
        return true;
      });

      const seenAllyInv = new Set<string>();
      const cleanAllyInventory = allyInventory.filter((item) => {
        if (!item?.id || seenAllyInv.has(item.id)) return false;
        seenAllyInv.add(item.id);
        return true;
      });

      const data = {
        stage,
        maxStageReached,
        gold,
        heroLevel,
        equipped,
        inventory: cleanInventory,
        allies,
        skills,
        allyInventory: cleanAllyInventory,
        monstersSlain,
        bossesSlain,
        autoPickup,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [stage, maxStageReached, gold, heroLevel, equipped, inventory, allies, skills, allyInventory, monstersSlain, bossesSlain, autoPickup]);

  useEffect(() => {
    const timer = setInterval(saveState, 5000);
    return () => clearInterval(timer);
  }, [saveState]);

  // Safely synchronize high stage reached to PlayerContext & Leaderboard outside of render/state updaters
  const lastSyncStageRef = useRef<number>(0);
  useEffect(() => {
    if (maxStageReached > 1 && maxStageReached > lastSyncStageRef.current) {
      lastSyncStageRef.current = maxStageReached;
      try {
        recordGamePlayed('dungeon-tap', maxStageReached);
        SupabaseService.submitLeaderboardScore(
          'dungeon-tap',
          profile?.username || 'Kiếm Sĩ Vô Danh',
          maxStageReached,
          profile?.avatar || '⚔️',
          profile?.currentTitle || profile?.equippedTitle || 'Hiệp Sĩ Dungeon',
          {
            bossesSlain,
            monstersSlain,
            currentStage: stage,
            heroLevel,
          }
        );
      } catch (e) {
        console.warn('Leaderboard score submit error:', e);
      }
    }
  }, [maxStageReached, bossesSlain, monstersSlain, stage, heroLevel, profile, recordGamePlayed]);

  // Derived Combat Stats
  const heroMilestone = getHeroMilestoneData(heroLevel);
  const baseTapDmg = Math.round(10 * Math.pow(1.14, heroLevel - 1) * heroMilestone.multiplier);

  // Equipment bonuses
  let equipTapBonus = 0;
  let equipHeroBonus = 0;
  let equipCritRate = 0;
  let equipGoldBonus = 0;

  Object.values(equipped).forEach((item) => {
    if (item) {
      equipTapBonus += item.tapDmgBonus || 0;
      equipHeroBonus += item.heroDmgBonus || 0;
      equipCritRate += item.critRateBonus || 0;
      equipGoldBonus += item.goldBonus || 0;
    }
  });

  const totalTapDamage = Math.round(baseTapDmg * (1 + equipTapBonus / 100));

  let totalHeroDps = 0;
  allies.forEach((a) => {
    if (a.unlocked) {
      const weaponBonus = a.equippedWeapon?.dpsBonusPercent || 0;
      const armorBonus = a.equippedArmor?.dpsBonusPercent || 0;
      const accBonus = (a.equippedAccessory?.dpsBonusPercent || 0) + (a.equippedAccessory?.teamBuffBonusPercent || 0);
      const allyDpsWithGear = Math.round(a.currentDmg * (1 + (weaponBonus + armorBonus + accBonus) / 100));
      totalHeroDps += allyDpsWithGear;
    }
  });
  totalHeroDps = Math.round(totalHeroDps * (1 + equipHeroBonus / 100));

  // Skills active states
  const berserkSkill = skills.find((s) => s.id === 'berserker_rage');
  const isBerserkActive = (berserkSkill?.activeRemaining || 0) > 0;

  const midasSkill = skills.find((s) => s.id === 'hand_of_midas');
  const isMidasActive = (midasSkill?.activeRemaining || 0) > 0;

  const cloneSkill = skills.find((s) => s.id === 'shadow_clone');
  const isShadowCloneActive = (cloneSkill?.activeRemaining || 0) > 0;

  const bladeStormSkill = skills.find((s) => s.id === 'blade_storm');
  const isBladeStormActive = (bladeStormSkill?.activeRemaining || 0) > 0;

  const warCrySkill = skills.find((s) => s.id === 'war_cry');
  const isWarCryActive = (warCrySkill?.activeRemaining || 0) > 0;

  const radiantSkill = skills.find((s) => s.id === 'radiant_slash');
  const isArmorBreakActive = (radiantSkill?.activeRemaining || 0) > 0;

  // War Cry buff multiplies total Hero DPS by x2.5 or leveled multiplier
  if (isWarCryActive) {
    totalHeroDps = Math.round(totalHeroDps * (warCrySkill?.multiplier || 2.5));
  }

  const critRate = isBerserkActive ? 100 : Math.min(80, 5 + equipCritRate);
  const critMultiplier = isBerserkActive ? 3.5 : 2.0;
  const goldMultiplier = (1 + equipGoldBonus / 100) * (isMidasActive ? 5 : 1);

  const currentChapter = getStoryChapterForStage(stage);

  // Upgrade Hero Level
  const levelUpCost = calculateHeroUpgradeCost(heroLevel, 1);
  const nextMilestone = getHeroMilestoneData(heroLevel + 1);
  const nextTapDamage = Math.round(10 * Math.pow(1.14, heroLevel) * nextMilestone.multiplier * (1 + equipTapBonus / 100));

  const handleHeroLevelUp = (count: number) => {
    const cost = calculateHeroUpgradeCost(heroLevel, count);
    if (gold < cost || cost <= 0) return;

    const newLv = heroLevel + count;
    setGold((prev) => prev - cost);
    setHeroLevel(newLv);
    bridge.playSound('levelUp');

    // Check if unlocked new skill
    INITIAL_SKILLS.forEach((sk) => {
      if (newLv >= sk.unlockLevel && heroLevel < sk.unlockLevel) {
        bridge.playSound('powerup');
      }
    });
  };

  // Upgrade Hero Ally (Auto-scales companion skill level with ally level)
  const handleUpgradeAlly = (allyId: string, count: number = 1) => {
    const ally = allies.find((a) => a.id === allyId);
    if (!ally) return;

    let targetCount = count;
    let cost = 0;
    if (!ally.unlocked) {
      targetCount = 1;
      cost = ally.upgradeCost;
    } else {
      cost = calculateAllyUpgradeCost(ally.baseCost, ally.level, targetCount);
    }

    if (gold < cost || cost <= 0) return;

    setGold((prev) => prev - cost);
    bridge.playSound('levelUp');

    setAllies((prev) =>
      prev.map((a) => {
        if (a.id !== allyId) return a;
        const newLevel = a.unlocked ? a.level + targetCount : 1;
        const milestone = getAllyMilestoneData(newLevel);
        const newDmg = Math.round(a.baseDmg * Math.pow(1.15, newLevel) * milestone.multiplier);
        const newCost = Math.round(a.baseCost * Math.pow(1.2, newLevel));
        const newSkillLevel = getAllySkillLevel(newLevel);
        const updatedSkills = (a.skills || []).map((sk) => ({ ...sk, level: newSkillLevel }));

        return {
          ...a,
          level: newLevel,
          currentDmg: newDmg,
          upgradeCost: newCost,
          unlocked: true,
          skills: updatedSkills.length > 0 ? updatedSkills : a.skills,
          skill: a.skill
            ? {
                ...a.skill,
                level: newSkillLevel,
              }
            : undefined,
        };
      })
    );
  };

  // Upgrade Sword Master Skill (Requirement 1: Skill leveling similar to character level)
  const handleUpgradeSkill = (skillId: ActiveSkill['id'], count: number = 1) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill || heroLevel < skill.unlockLevel) return;

    const currentLevel = skill.level || 1;
    const cost = calculateSkillUpgradeCost(skill.baseUpgradeCost || 100, currentLevel, count);
    if (gold < cost || cost <= 0) return;

    setGold((prev) => prev - cost);
    bridge.playSound('levelUp');

    setSkills((prev) =>
      prev.map((s) => {
        if (s.id !== skillId) return s;
        const newLevel = currentLevel + count;
        let newMultiplier = s.multiplier;
        let newDuration = s.duration;

        if (s.id === 'heavenly_strike') {
          newMultiplier = 45 + (newLevel - 1) * 15;
        } else if (s.id === 'shadow_clone') {
          newDuration = 20 + (newLevel - 1) * 2;
        } else if (s.id === 'berserker_rage') {
          newDuration = 20 + (newLevel - 1) * 2;
        } else if (s.id === 'hand_of_midas') {
          newDuration = 20 + (newLevel - 1) * 2;
        } else if (s.id === 'blade_storm') {
          newMultiplier = 12 + (newLevel - 1) * 4;
          newDuration = 10 + (newLevel - 1) * 1;
        } else if (s.id === 'war_cry') {
          newMultiplier = 2.5 + (newLevel - 1) * 0.4;
          newDuration = 12 + (newLevel - 1) * 1;
        } else if (s.id === 'radiant_slash') {
          newMultiplier = 85 + (newLevel - 1) * 25;
        }

        return {
          ...s,
          level: newLevel,
          multiplier: newMultiplier,
          duration: newDuration,
          upgradeCost: calculateSkillUpgradeCost(s.baseUpgradeCost || 100, newLevel, 1),
        };
      })
    );
  };

  // Companion Equipment Management (3 Slots: Weapon, Armor, Accessory)
  const handleEquipAllyItem = (allyId: string, item: AllyEquipmentItem) => {
    const ally = allies.find((a) => a.id === allyId);
    if (!ally) return;

    const slotKey =
      item.slot === 'ally_weapon'
        ? 'equippedWeapon'
        : item.slot === 'ally_armor'
        ? 'equippedArmor'
        : 'equippedAccessory';
    const currentEquipped = ally[slotKey];

    setAllies((prevAllies) =>
      prevAllies.map((a) => {
        if (a.id !== allyId) return a;
        return {
          ...a,
          [slotKey]: item,
        };
      })
    );

    // Return old equipped item to ally inventory, remove newly equipped item, and guarantee unique IDs
    setAllyInventory((prevInv) => {
      const filtered = prevInv.filter((i) => i.id !== item.id);
      if (currentEquipped && currentEquipped.id !== item.id) {
        return [currentEquipped, ...filtered.filter((i) => i.id !== currentEquipped.id)];
      }
      return filtered;
    });

    bridge.playSound('craft');
  };

  const handleUpgradeAllyItem = (allyId: string, slot: AllyEquipSlot) => {
    const ally = allies.find((a) => a.id === allyId);
    if (!ally) return;
    const slotKey =
      slot === 'ally_weapon'
        ? 'equippedWeapon'
        : slot === 'ally_armor'
        ? 'equippedArmor'
        : 'equippedAccessory';
    const item = ally[slotKey];
    if (!item || gold < item.upgradeCost) return;

    setGold((prev) => prev - item.upgradeCost);
    bridge.playSound('craft');

    const upgradedItem: AllyEquipmentItem = {
      ...item,
      level: item.level + 1,
      dpsBonusPercent: Math.round(item.dpsBonusPercent * 1.25),
      skillBonusPercent: Math.round(item.skillBonusPercent * 1.22),
      cooldownReductionSec: Math.min(6, Math.round((item.cooldownReductionSec + 0.3) * 10) / 10),
      teamBuffBonusPercent: Math.round(item.teamBuffBonusPercent * 1.2),
      upgradeCost: Math.round(item.upgradeCost * 1.45),
      sellValue: Math.round(item.sellValue * 1.3),
    };

    setAllies((prevAllies) =>
      prevAllies.map((a) => {
        if (a.id !== allyId) return a;
        return {
          ...a,
          [slotKey]: upgradedItem,
        };
      })
    );
  };

  const handleSellAllyItem = (itemId: string) => {
    const item = allyInventory.find((i) => i.id === itemId);
    if (!item) return;

    setGold((prev) => prev + item.sellValue);
    setAllyInventory((prev) => prev.filter((i) => i.id !== itemId));
    bridge.playSound('coin');
  };

  const handleEquipBestAllies = () => {
    let currentAllyInv = [...allyInventory];
    let changed = false;

    const newAllies = allies.map((ally) => {
      if (!ally.unlocked) return ally;

      let newWeapon = ally.equippedWeapon;
      let newArmor = ally.equippedArmor;
      let newAccessory = ally.equippedAccessory;

      // Check weapon candidates
      const weaponCandidates = currentAllyInv.filter(
        (i) => i.slot === 'ally_weapon' && i.profession === ally.profession
      );
      if (weaponCandidates.length > 0) {
        let best = newWeapon;
        let bestPower = calculateAllyItemPower(newWeapon);
        for (const cand of weaponCandidates) {
          const p = calculateAllyItemPower(cand);
          if (p > bestPower) {
            best = cand;
            bestPower = p;
          }
        }
        if (best && best !== newWeapon) {
          changed = true;
          currentAllyInv = currentAllyInv.filter((i) => i.id !== best.id);
          if (newWeapon && !currentAllyInv.some((i) => i.id === newWeapon.id)) {
            currentAllyInv.push(newWeapon);
          }
          newWeapon = best;
        }
      }

      // Check armor candidates
      const armorCandidates = currentAllyInv.filter(
        (i) => i.slot === 'ally_armor' && i.profession === ally.profession
      );
      if (armorCandidates.length > 0) {
        let best = newArmor;
        let bestPower = calculateAllyItemPower(newArmor);
        for (const cand of armorCandidates) {
          const p = calculateAllyItemPower(cand);
          if (p > bestPower) {
            best = cand;
            bestPower = p;
          }
        }
        if (best && best !== newArmor) {
          changed = true;
          currentAllyInv = currentAllyInv.filter((i) => i.id !== best.id);
          if (newArmor && !currentAllyInv.some((i) => i.id === newArmor.id)) {
            currentAllyInv.push(newArmor);
          }
          newArmor = best;
        }
      }

      // Check accessory candidates
      const accessoryCandidates = currentAllyInv.filter(
        (i) => i.slot === 'ally_accessory' && i.profession === ally.profession
      );
      if (accessoryCandidates.length > 0) {
        let best = newAccessory;
        let bestPower = calculateAllyItemPower(newAccessory);
        for (const cand of accessoryCandidates) {
          const p = calculateAllyItemPower(cand);
          if (p > bestPower) {
            best = cand;
            bestPower = p;
          }
        }
        if (best && best !== newAccessory) {
          changed = true;
          currentAllyInv = currentAllyInv.filter((i) => i.id !== best.id);
          if (newAccessory && !currentAllyInv.some((i) => i.id === newAccessory.id)) {
            currentAllyInv.push(newAccessory);
          }
          newAccessory = best;
        }
      }

      return {
        ...ally,
        equippedWeapon: newWeapon,
        equippedArmor: newArmor,
        equippedAccessory: newAccessory,
      };
    });

    if (changed) {
      const seen = new Set<string>();
      const cleanInv = currentAllyInv.filter((i) => {
        if (!i?.id || seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
      setAllies(newAllies);
      setAllyInventory(cleanInv);
      bridge.playSound('craft');
    }
  };

  // Equipment actions
  const handleEquipItem = (item: EquipmentItem) => {
    const currentEquipped = equipped[item.slot];
    setEquipped((prev) => ({
      ...prev,
      [item.slot]: item,
    }));
    setInventory((prevInv) => {
      const filtered = prevInv.filter((i) => i.id !== item.id);
      if (currentEquipped && currentEquipped.id !== item.id) {
        return [currentEquipped, ...filtered.filter((i) => i.id !== currentEquipped.id)];
      }
      return filtered;
    });
    bridge.playSound('craft');
  };

  const handleEquipBestAll = () => {
    const slots: EquipmentSlot[] = ['weapon', 'armor', 'helmet', 'cloak', 'ring'];
    let curEquipped = { ...equipped };
    let curInventory = [...inventory];
    let changed = false;

    for (const slot of slots) {
      const current = curEquipped[slot];
      // Compare Level 1 base stats when equipping best
      const currentPower = calculateItemBasePower(current);

      const candidates = curInventory.filter((i) => i.slot === slot);
      if (candidates.length === 0) continue;

      let bestCand: EquipmentItem | null = null;
      let bestPower = currentPower;

      for (const cand of candidates) {
        const power = calculateItemBasePower(cand);
        if (power > bestPower) {
          bestPower = power;
          bestCand = cand;
        }
      }

      if (bestCand) {
        changed = true;
        curInventory = curInventory.filter((i) => i.id !== bestCand.id);
        if (current && !curInventory.some((i) => i.id === current.id)) {
          curInventory.push(current);
        }
        curEquipped[slot] = bestCand;
      }
    }

    if (changed) {
      const seen = new Set<string>();
      const cleanInv = curInventory.filter((i) => {
        if (!i?.id || seen.has(i.id)) return false;
        seen.add(i.id);
        return true;
      });
      setEquipped(curEquipped);
      setInventory(cleanInv);
      bridge.playSound('craft');
    }
  };

  const handleUpgradeItem = (item: EquipmentItem, count: number = 1) => {
    // Resolve the current live item from equipped or inventory to prevent stale reference desync
    const isEquippedSlot = equipped[item.slot]?.id === item.id;
    const currentItem = isEquippedSlot
      ? equipped[item.slot]
      : inventory.find((i) => i.id === item.id) || item;

    if (!currentItem) return;

    // Cache or preserve baseLevelStats before upgrades
    const baseLevelStats = currentItem.baseLevelStats || {
      tapDmgBonus: currentItem.tapDmgBonus || 0,
      heroDmgBonus: currentItem.heroDmgBonus || 0,
      critRateBonus: currentItem.critRateBonus || 0,
      goldBonus: currentItem.goldBonus || 0,
    };

    let tempItem: EquipmentItem = { ...currentItem, baseLevelStats };
    let totalCost = 0;
    let actualUpgrades = 0;
    const maxAffordable = count === -1 ? 9999 : count;

    for (let i = 0; i < maxAffordable; i++) {
      if (gold < totalCost + tempItem.upgradeCost) break;
      totalCost += tempItem.upgradeCost;
      actualUpgrades++;
      tempItem = {
        ...tempItem,
        level: tempItem.level + 1,
        tapDmgBonus: tempItem.tapDmgBonus ? Math.round(tempItem.tapDmgBonus * 1.25) : 0,
        heroDmgBonus: tempItem.heroDmgBonus ? Math.round(tempItem.heroDmgBonus * 1.25) : 0,
        critRateBonus: tempItem.critRateBonus ? Math.min(45, tempItem.critRateBonus + 1) : 0,
        goldBonus: tempItem.goldBonus ? Math.round(tempItem.goldBonus * 1.25) : 0,
        upgradeCost: Math.round(tempItem.upgradeCost * 1.45),
        sellValue: Math.round(tempItem.sellValue * 1.3),
        baseLevelStats,
      };
    }

    if (actualUpgrades === 0 || totalCost <= 0) return;

    setGold((prev) => Math.max(0, prev - totalCost));
    bridge.playSound('craft');

    if (isEquippedSlot) {
      setEquipped((prev) => ({ ...prev, [item.slot]: tempItem }));
    } else {
      setInventory((prev) => prev.map((i) => (i.id === item.id ? tempItem : i)));
    }
  };

  const handleSellItem = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setGold((prev) => prev + item.sellValue);
    setInventory((prev) => prev.filter((i) => i.id !== itemId));
    bridge.playSound('coin');
  };

  const handleSellAllItems = () => {
    if (inventory.length === 0) return;
    const totalSellGold = inventory.reduce((sum, item) => sum + item.sellValue, 0);
    setGold((prev) => prev + totalSellGold);
    setInventory([]);
    bridge.playSound('coin');
  };

  const handleSellAllAllyItems = () => {
    if (allyInventory.length === 0) return;
    const totalSellGold = allyInventory.reduce((sum, item) => sum + item.sellValue, 0);
    setGold((prev) => prev + totalSellGold);
    setAllyInventory([]);
    bridge.playSound('coin');
  };

  // Active Skill Cast
  const handleCastSkill = (skillId: ActiveSkill['id']) => {
    const skill = skills.find((s) => s.id === skillId);
    if (!skill || mana < skill.manaCost || skill.currentCooldown > 0) return;

    setMana((prev) => Math.max(0, prev - skill.manaCost));
    bridge.playSound('powerup');

    if (skillId === 'heavenly_strike') {
      // Massive instant damage based on leveled skill multiplier
      const strikeMult = skill.multiplier || 45;
      const strikeDmg = Math.round(totalTapDamage * strikeMult * (isBerserkActive ? 2 : 1));
      applyDamageToMonster(strikeDmg, true, true);
      bridge.playSound('combo');
    } else if (skillId === 'radiant_slash') {
      // Powerful radiant slash that inflicts armor break (+50% incoming damage)
      const radiantMult = skill.multiplier || 85;
      const radiantDmg = Math.round(totalTapDamage * radiantMult * (isBerserkActive ? 2 : 1));
      applyDamageToMonster(radiantDmg, true, true);
      bridge.playSound('parry');
    } else if (skillId === 'war_cry') {
      bridge.playSound('powerup');
    } else if (skillId === 'blade_storm') {
      bridge.playSound('laser');
    }

    setSkills((prev) =>
      prev.map((s) => {
        if (s.id !== skillId) return s;
        return {
          ...s,
          currentCooldown: s.cooldown,
          activeRemaining: s.duration,
        };
      })
    );
  };

  // Stable refs to prevent rapid tap intervals from resetting
  const monsterRef = useRef(monster);
  monsterRef.current = monster;
  const stageRef = useRef(stage);
  stageRef.current = stage;
  const totalHeroDpsRef = useRef(totalHeroDps);
  totalHeroDpsRef.current = totalHeroDps;
  const applyDamageToMonsterRef = useRef<((damage: number, isCrit: boolean, isSkill?: boolean) => void) | null>(null);
  const lootsRef = useRef(loots);
  lootsRef.current = loots;

  // Keep track of defeat in-flight to prevent re-entrant calls
  const isDefeatingRef = useRef(false);
  const bladeStormTickRef = useRef(0);

  // Process Defeated Monster
  const handleDefeatMonster = useCallback(() => {
    isDefeatingRef.current = false;
    const isBoss = monster.isBoss;
    const earnedGold = Math.round(monster.goldReward * goldMultiplier);

    setGold((prev) => prev + earnedGold);
    bridge.playSound(isBoss ? 'win' : 'coin');

    if (isBoss) {
      setBossesSlain((prev) => prev + 1);
    } else {
      setMonstersSlain((prev) => prev + 1);
    }

    // Drop Loot: 35% hero equip, 25% ally equip on normal; guaranteed on boss
    const shouldDropItem = isBoss || Math.random() < 0.35;
    const shouldDropAllyItem = isBoss || Math.random() < 0.25;
    const newLoots: DroppedLoot[] = [];

    // Subtle Coin Drop Particle
    newLoots.push({
      id: Date.now() + Math.random(),
      type: 'gold',
      amount: earnedGold,
      x: 120 + (Math.random() - 0.5) * 60,
      y: 130 + (Math.random() - 0.5) * 40,
      createdAt: Date.now(),
    });

    if (shouldDropItem) {
      const droppedEquipment = generateLootItem(stage);
      if (autoPickup) {
        setInventory((prev) => [droppedEquipment, ...prev.filter((i) => i.id !== droppedEquipment.id)]);
        bridge.playSound('craft');
        showAutoPickupToast({
          id: Date.now() + Math.random(),
          text: `Nhặt: ${droppedEquipment.name}`,
          icon: droppedEquipment.icon,
          rarityColor: droppedEquipment.rarity,
        });
      } else {
        newLoots.push({
          id: Date.now() + 1 + Math.random(),
          type: 'equipment',
          item: droppedEquipment,
          x: 140,
          y: 190,
          createdAt: Date.now(),
        });
      }
    }

    if (shouldDropAllyItem) {
      const droppedAllyItem = generateAllyLootItem(stage);
      if (autoPickup) {
        setAllyInventory((prev) => [droppedAllyItem, ...prev.filter((i) => i.id !== droppedAllyItem.id)]);
        bridge.playSound('craft');
        showAutoPickupToast({
          id: Date.now() + Math.random() + 0.5,
          text: `Nhặt (Đồng đội): ${droppedAllyItem.name}`,
          icon: droppedAllyItem.icon,
          rarityColor: droppedAllyItem.rarity,
        });
      } else {
        newLoots.push({
          id: Date.now() + 2 + Math.random(),
          type: 'ally_equipment',
          allyItem: droppedAllyItem,
          x: 155,
          y: 190,
          createdAt: Date.now(),
        });
      }
    }

    // Keep recent loots
    setLoots((prev) => [
      ...prev.filter((l) => l.type !== 'equipment' && l.type !== 'ally_equipment').slice(-2),
      ...newLoots,
    ]);

    // Boss Stage Protection: If we're at a milestone boss stage (10, 20, 30...) and farming regular mobs,
    // do NOT advance the stage. Keep farming mob active until the player slays the actual Boss!
    const isBossStage = stage % 10 === 0;
    if (isBossStage && !isBoss) {
      const farmStage = Math.max(1, stage - 1);
      const farmMonster = generateMonsterForStage(farmStage);
      farmMonster.isBoss = false;
      farmMonster.stage = stage;
      setMonster(farmMonster);
      return;
    }

    if (isBoss) {
      setIsFightingBoss(false);
    }

    // Stage progression upon normal mob or Boss victory
    const nextStage = stage + 1;
    setStage(nextStage);
    setMaxStageReached((prev) => Math.max(prev, nextStage));

    if (nextStage >= 5) {
      bridge.reportProgress('ach-dungeon-floor-5', nextStage, true);
    }

    // Spawn next monster
    const nextMonster = generateMonsterForStage(nextStage);
    setIsFightingBoss(nextMonster.isBoss);
    setMonster(nextMonster);
    setBossTimer(30);
  }, [
    monster,
    goldMultiplier,
    stage,
    bridge,
    autoPickup,
    showAutoPickupToast,
  ]);

  // Apply damage to current monster
  const applyDamageToMonster = useCallback(
    (damage: number, isCrit: boolean, isSkill: boolean = false) => {
      // Armor break active: +50% damage
      const effectiveDamage = isArmorBreakActive ? Math.round(damage * 1.5) : damage;

      setMonster((prev) => {
        if (prev.hp <= 0) return prev;
        const nextHp = Math.max(0, prev.hp - effectiveDamage);
        if (nextHp <= 0 && !isDefeatingRef.current) {
          isDefeatingRef.current = true;
          setTimeout(() => handleDefeatMonster(), 50);
        }
        return { ...prev, hp: nextHp };
      });

      // Floating damage text (limited to max 4 to prevent clutter)
      const newDmg: FloatingDamage = {
        id: Date.now() + Math.random(),
        text: isSkill
          ? `⚡ TUYỆT KỸ! -${formatNumber(effectiveDamage)}`
          : isCrit
          ? `🔥 CRIT! -${formatNumber(effectiveDamage)}`
          : `-${formatNumber(effectiveDamage)}`,
        x: 120 + (Math.random() - 0.5) * 60,
        y: 120 + (Math.random() - 0.5) * 40,
        isCrit: isCrit || isSkill,
        color: isSkill ? '#38bdf8' : isCrit ? '#f43f5e' : '#fbbf24',
        createdAt: Date.now(),
      };

      setFloatingDamages((prev) => [...prev.slice(-3), newDmg]);
    },
    [handleDefeatMonster, isArmorBreakActive]
  );
  applyDamageToMonsterRef.current = applyDamageToMonster;

  // Player Tap Attack on Monster Arena
  const handleTapArena = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPaused || monster.hp <= 0) return;

    // Visual slash animation
    setHeroSlashing(true);
    setTimeout(() => setHeroSlashing(false), 100);

    const rect = e.currentTarget.getBoundingClientRect();
    const tapX = e.clientX - rect.left;
    const tapY = e.clientY - rect.top;

    // Add clean slash trail (limit to max 2)
    const slashAngle = Math.floor(Math.random() * 60) - 30;
    setSlashes((prev) => [
      ...prev.slice(-2),
      {
        id: Date.now() + Math.random(),
        x: tapX,
        y: tapY,
        angle: slashAngle,
        color: isBerserkActive ? '#f43f5e' : '#38bdf8',
      },
    ]);

    // Calculate critical strike
    const isCrit = Math.random() * 100 < critRate;
    let dealtDamage = totalTapDamage;
    if (isCrit) {
      dealtDamage = Math.round(dealtDamage * critMultiplier);
      bridge.playSound('combo');
    } else {
      bridge.playSound('hit');
    }

    // 1. Mana Gain on Tap (User requirement: Tapping on screen restores Mana)
    const manaGain = 3;
    setMana((prev) => Math.min(maxMana, Math.round((prev + manaGain) * 10) / 10));

    // 2. Ally Assist Strike on Tap (User requirement: Allies attack when screen is tapped)
    const hasUnlockedAllies = allies.some((a) => a.unlocked);
    if (hasUnlockedAllies) {
      setAlliesAttacking(true);
      if (allyAttackTimeoutRef.current) clearTimeout(allyAttackTimeoutRef.current);
      allyAttackTimeoutRef.current = setTimeout(() => setAlliesAttacking(false), 240);

      // Allies deal coordinated assist strike based on total Hero DPS (35% of DPS per tap, min 4 dmg)
      const allyAssistDamage = Math.max(4, Math.round(Math.max(10, totalHeroDps) * 0.35));
      dealtDamage += allyAssistDamage;

      // Accelerate companion skill cooldowns on tap (0.2s bonus per tap)
      setAllies((prevAllies) =>
        prevAllies.map((a) => {
          if (!a.unlocked || !a.skill || a.skill.currentCooldown <= 0) return a;
          return {
            ...a,
            skill: {
              ...a.skill,
              currentCooldown: Math.max(0, Math.round((a.skill.currentCooldown - 0.2) * 10) / 10),
            },
          };
        })
      );
    }

    applyDamageToMonster(dealtDamage, isCrit);

    // Floating Mana particle on tap (+3 MP)
    setFloatingDamages((prev) => [
      ...prev.slice(-3),
      {
        id: Date.now() + Math.random(),
        text: `+${manaGain} MP`,
        x: Math.max(20, Math.min(260, tapX + (Math.random() - 0.5) * 30)),
        y: Math.max(40, tapY - 25),
        isCrit: false,
        color: '#38bdf8',
        createdAt: Date.now(),
      },
    ]);

    // If Midas active, tap drops extra gold directly
    if (isMidasActive) {
      const midasGold = Math.max(1, Math.round(stage * 1.5));
      setGold((prev) => prev + midasGold);
    }
  };

  // Loot Click
  const handleLootClick = (loot: DroppedLoot) => {
    if (loot.type === 'gold' && loot.amount) {
      setGold((prev) => prev + loot.amount!);
      bridge.playSound('coin');
    } else if (loot.type === 'equipment' && loot.item) {
      setInventory((prev) => [loot.item!, ...prev.filter((i) => i.id !== loot.item!.id)]);
      bridge.playSound('craft');
    } else if (loot.type === 'ally_equipment' && loot.allyItem) {
      setAllyInventory((prev) => [loot.allyItem!, ...prev.filter((i) => i.id !== loot.allyItem!.id)]);
      bridge.playSound('craft');
    }
    setLoots((prev) => prev.filter((l) => l.id !== loot.id));
  };

  // Leave Boss Fight (retreat to farm)
  const handleLeaveBoss = () => {
    setIsFightingBoss(false);
    const farmStage = Math.max(1, stage - 1);
    const farmMonster = generateMonsterForStage(farmStage);
    farmMonster.isBoss = false;
    farmMonster.stage = stage;
    setMonster(farmMonster);
    if (bossToastTimerRef.current) clearTimeout(bossToastTimerRef.current);
    setBossToast('Đã rút lui về cày vàng! Nâng cấp lực chiến rồi bấm [ĐẤU TRÙM] để tái đấu.');
    bossToastTimerRef.current = setTimeout(() => setBossToast(null), 3500);
  };

  // End current run and show Post-Game Summary
  const handleFinishRun = () => {
    bridge.playSound('win');
    const calculatedScore = Math.max(
      10,
      stage * 150 + bossesSlain * 600 + monstersSlain * 35 + Math.floor(gold / 10)
    );

    // Sync highest floor level to real-time Leaderboard
    try {
      recordGamePlayed('dungeon-tap', maxStageReached);
      SupabaseService.submitLeaderboardScore(
        'dungeon-tap',
        profile?.username || 'Kiếm Sĩ Vô Danh',
        maxStageReached,
        profile?.avatar || '⚔️',
        profile?.currentTitle || profile?.equippedTitle || 'Hiệp Sĩ Dungeon',
        {
          bossesSlain,
          monstersSlain,
          currentStage: stage,
          heroLevel,
        }
      );
    } catch (e) {
      console.warn('Leaderboard submit on finish error:', e);
    }

    if (onGameOver) {
      onGameOver(calculatedScore, {
        stage,
        bossesSlain,
        monstersSlain,
        gold,
      });
    }
  };

  // Fight Boss Button
  const handleFightBoss = () => {
    if (stage % 10 !== 0) {
      if (bossToastTimerRef.current) clearTimeout(bossToastTimerRef.current);
      const nextBossMilestone = Math.ceil(stage / 10) * 10;
      setBossToast(`Chưa đủ điều kiện! Cần đạt Tầng ${nextBossMilestone} để mở khóa Đấu Trùm (Hiện tại: Tầng ${stage})`);
      bossToastTimerRef.current = setTimeout(() => setBossToast(null), 3500);
      return;
    }
    if (isFightingBoss && monster.isBoss) return; // prevent spamming freeze

    setIsFightingBoss(true);
    const bossMonster = generateMonsterForStage(stage);
    bossMonster.isBoss = true;
    setMonster(bossMonster);
    setBossTimer(30);
  };

  // Select Stage from Story
  const handleSelectStage = (selectedStage: number) => {
    if (selectedStage > maxStageReached) return;
    setStage(selectedStage);
    const newMonster = generateMonsterForStage(selectedStage);
    setIsFightingBoss(newMonster.isBoss);
    setMonster(newMonster);
    setBossTimer(30);
    setActiveTab('swordMaster');
  };

  // Auto-Attack Game Loop
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Quick clean up of floating damage and subtle loots
      const now = Date.now();
      setFloatingDamages((prev) => prev.filter((d) => now - d.createdAt < 450));
      setLoots((prev) =>
        prev.filter((l) => {
          if (l.type === 'gold') return now - l.createdAt < 1200;
          return now - l.createdAt < 15000;
        })
      );

      // Mana Regen (+2 per second)
      setMana((prev) => Math.min(maxMana, prev + 0.2));

      // Skill Cooldowns & Durations decrement (with rounding to avoid float overflow)
      setSkills((prev) =>
        prev.map((s) => ({
          ...s,
          currentCooldown: Math.max(0, Math.round((s.currentCooldown - 0.1) * 10) / 10),
          activeRemaining: Math.max(0, Math.round((s.activeRemaining - 0.1) * 10) / 10),
        }))
      );

      // Shadow Clone auto-strikes
      if (isShadowCloneActive && monsterRef.current.hp > 0 && applyDamageToMonsterRef.current) {
        const cloneDmg = Math.max(1, Math.round(totalTapDamage * 0.8));
        applyDamageToMonsterRef.current(cloneDmg, false);
      }

      // Blade Storm rapid slashes (every 300ms)
      if (isBladeStormActive && monsterRef.current.hp > 0 && applyDamageToMonsterRef.current) {
        bladeStormTickRef.current = (bladeStormTickRef.current || 0) + 1;
        if (bladeStormTickRef.current % 3 === 0) {
          const stormMult = bladeStormSkill?.multiplier || 12;
          const stormDmg = Math.max(1, Math.round(totalTapDamage * stormMult * 0.35));
          applyDamageToMonsterRef.current(stormDmg, true, true);
        }
      }

      // Auto-Pickup safety net: collect any stray dropped items/gold
      if (autoPickup && lootsRef.current.length > 0) {
        const stray = lootsRef.current;
        let addedGold = 0;
        const newGear: EquipmentItem[] = [];
        const newAllyGear: AllyEquipmentItem[] = [];
        stray.forEach((loot) => {
          if (loot.type === 'equipment' && loot.item) newGear.push(loot.item);
          else if (loot.type === 'ally_equipment' && loot.allyItem) newAllyGear.push(loot.allyItem);
          else if (loot.type === 'gold' && loot.amount) addedGold += loot.amount;
        });
        setLoots([]);
        if (addedGold > 0) setGold((g) => g + addedGold);
        if (newGear.length > 0) {
          setInventory((inv) => {
            const newIds = new Set(newGear.map((g) => g.id));
            return [...newGear, ...inv.filter((i) => !newIds.has(i.id))];
          });
        }
        if (newAllyGear.length > 0) {
          setAllyInventory((inv) => {
            const newIds = new Set(newAllyGear.map((g) => g.id));
            return [...newAllyGear, ...inv.filter((i) => !newIds.has(i.id))];
          });
        }
      }

      // Boss Timer countdown
      if (monsterRef.current.isBoss) {
        setBossTimer((prev) => {
          if (prev <= 1) {
            setTimeout(() => {
              setIsFightingBoss(false);
              const farmStage = Math.max(1, stageRef.current - 1);
              const farmMonster = generateMonsterForStage(farmStage);
              farmMonster.isBoss = false;
              farmMonster.stage = stageRef.current;
              setMonster(farmMonster);
              if (bossToastTimerRef.current) clearTimeout(bossToastTimerRef.current);
              setBossToast('Hết giờ! Bạn chưa hạ được Trùm. Hãy nâng cấp rồi bấm [ĐẤU TRÙM]!');
              bossToastTimerRef.current = setTimeout(() => setBossToast(null), 3500);
            }, 50);
            return 30;
          }
          return Math.round((prev - 0.1) * 10) / 10;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, maxMana, isShadowCloneActive, isBladeStormActive, totalTapDamage, autoPickup]);

  // Hero Allies Passive DPS (Once per second) with active ally attack animation
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (totalHeroDpsRef.current > 0 && monsterRef.current.hp > 0 && applyDamageToMonsterRef.current) {
        setAlliesAttacking(true);
        setTimeout(() => setAlliesAttacking(false), 220);
        applyDamageToMonsterRef.current(totalHeroDpsRef.current, false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Ally Auto-Skills Loop (Requirement 2: Allies rotate through their 3 skills)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setAllies((prevAllies) => {
        let totalSkillDamage = 0;
        let manaRestored = 0;
        let goldBonus = 0;
        let timeBonus = 0;

        const updated = prevAllies.map((ally) => {
          if (!ally.unlocked) return ally;
          const allySkills = ally.skills && ally.skills.length > 0 ? ally.skills : (ally.skill ? [ally.skill] : []);
          if (allySkills.length === 0) return ally;

          const currentIndex = ally.currentSkillIndex || 0;
          const currentSkill = allySkills[currentIndex] || allySkills[0];

          // Check if equipped armor or accessory reduces cooldown
          const cdReduction =
            (ally.equippedArmor?.cooldownReductionSec || 0) +
            (ally.equippedAccessory?.cooldownReductionSec || 0);
          const effectiveMaxCd = Math.max(2.5, currentSkill.cooldown - cdReduction);
          const currentCd = currentSkill.currentCooldown !== undefined ? currentSkill.currentCooldown : (ally.skill?.currentCooldown || 0);
          const nextCd = currentCd - 0.2;

          if (nextCd <= 0) {
            // Companion auto-uses skill!
            const effect = getAllySkillEffect(
              currentSkill.baseMultiplier,
              currentSkill.level,
              currentSkill.effectType
            );

            const weaponBonus = 1 + (ally.equippedWeapon?.skillBonusPercent || 0) / 100;
            const skillDmg = Math.round(ally.currentDmg * effect.currentMult * weaponBonus);

            if (currentSkill.effectType === 'mana') {
              manaRestored += 16 + currentSkill.level * 2;
              goldBonus += Math.round(stageRef.current * (1.5 + currentSkill.level));
              bridge.playSound('powerup');
              setFloatingDamages((prev) => [
                ...prev.slice(-3),
                {
                  id: Date.now() + Math.random(),
                  text: `${currentSkill.icon} ${currentSkill.name}! +Mana`,
                  x: 120 + (Math.random() - 0.5) * 60,
                  y: 110,
                  isCrit: false,
                  color: '#22d3ee',
                  createdAt: Date.now(),
                },
              ]);
            } else if (currentSkill.effectType === 'quake') {
              timeBonus += 3;
              totalSkillDamage += Math.round(skillDmg * 0.4);
              bridge.playSound('parry');
              setFloatingDamages((prev) => [
                ...prev.slice(-3),
                {
                  id: Date.now() + Math.random(),
                  text: `${currentSkill.icon} ${currentSkill.name}! +3s Trùm`,
                  x: 120 + (Math.random() - 0.5) * 60,
                  y: 110,
                  isCrit: false,
                  color: '#38bdf8',
                  createdAt: Date.now(),
                },
              ]);
            } else if (currentSkill.effectType === 'buff') {
              manaRestored += 12;
              totalSkillDamage += Math.round(skillDmg * 0.7);
              bridge.playSound('powerup');
              setFloatingDamages((prev) => [
                ...prev.slice(-3),
                {
                  id: Date.now() + Math.random(),
                  text: `${currentSkill.icon} ${currentSkill.name}! Buff Đồng Đội`,
                  x: 120 + (Math.random() - 0.5) * 60,
                  y: 110,
                  isCrit: false,
                  color: '#eab308',
                  createdAt: Date.now(),
                },
              ]);
            } else if (currentSkill.effectType === 'cd_reduction') {
              setSkills((prevS) =>
                prevS.map((s) => ({
                  ...s,
                  currentCooldown: Math.max(0, s.currentCooldown - 2),
                }))
              );
              totalSkillDamage += Math.round(skillDmg * 0.5);
              bridge.playSound('powerup');
              setFloatingDamages((prev) => [
                ...prev.slice(-3),
                {
                  id: Date.now() + Math.random(),
                  text: `${currentSkill.icon} ${currentSkill.name}! -2s Hồi Chiêu`,
                  x: 120 + (Math.random() - 0.5) * 60,
                  y: 110,
                  isCrit: false,
                  color: '#a855f7',
                  createdAt: Date.now(),
                },
              ]);
            } else {
              totalSkillDamage += skillDmg;
              bridge.playSound('laser');
              setFloatingDamages((prev) => [
                ...prev.slice(-3),
                {
                  id: Date.now() + Math.random(),
                  text: `${currentSkill.icon} ${currentSkill.name}! -${formatNumber(skillDmg)}`,
                  x: 120 + (Math.random() - 0.5) * 60,
                  y: 110 + (Math.random() - 0.5) * 30,
                  isCrit: true,
                  color: '#c084fc',
                  createdAt: Date.now(),
                },
              ]);
            }

            // Rotate to next skill in ally's 3-skill repertoire
            const nextIndex = (currentIndex + 1) % allySkills.length;
            const nextSkillObj = allySkills[nextIndex];

            const updatedSkillsList = allySkills.map((sk, idx) => {
              if (idx === currentIndex) {
                return { ...sk, currentCooldown: effectiveMaxCd };
              }
              return sk;
            });

            return {
              ...ally,
              currentSkillIndex: nextIndex,
              skills: updatedSkillsList,
              skill: {
                ...nextSkillObj,
                currentCooldown: effectiveMaxCd,
              },
            };
          }

          const updatedSkillsList = allySkills.map((sk, idx) => {
            if (idx === currentIndex) {
              return { ...sk, currentCooldown: Math.max(0, Math.round(nextCd * 10) / 10) };
            }
            return sk;
          });

          return {
            ...ally,
            skills: updatedSkillsList,
            skill: {
              ...currentSkill,
              currentCooldown: Math.max(0, Math.round(nextCd * 10) / 10),
            },
          };
        });

        if (totalSkillDamage > 0 && monsterRef.current.hp > 0 && applyDamageToMonsterRef.current) {
          applyDamageToMonsterRef.current(totalSkillDamage, true);
        }
        if (manaRestored > 0) {
          setMana((m) => Math.min(maxMana, m + manaRestored));
        }
        if (goldBonus > 0) {
          setGold((g) => g + goldBonus);
        }
        if (timeBonus > 0 && monsterRef.current.isBoss) {
          setBossTimer((t) => Math.min(30, t + timeBonus));
        }

        return updated;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused, maxMana, bridge]);

  const unlockedAlliesCount = allies.filter((a) => a.unlocked).length;

  return (
    <div className="arcade-game-surface flex flex-col h-full w-full bg-[#070b14] text-slate-100 overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-3 py-2 bg-slate-900/90 border-b border-white/10 shrink-0">
        {/* Stage & Chapter */}
        <div className="flex items-center gap-2">
          <div className="text-xl p-1 bg-black/40 rounded-lg border border-amber-500/30">
            {currentChapter.badge}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs text-amber-300">TẦNG {formatNumber(stage)}</span>
              {monster.isBoss && (
                <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-500/50 px-1 rounded font-bold animate-pulse">
                  BOSS
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
              {currentChapter.name}
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Access: Bảng Xếp Hạng Hầm Ngục */}
          <button
            type="button"
            id="btn-dungeon-leaderboard-top"
            onClick={() => {
              try {
                bridge.playSound('click');
              } catch {}
              setIsLeaderboardOpen(true);
            }}
            title="Bảng Xếp Hạng Tầng Hầm Ngục Titan (Real-Time Leaderboard)"
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-600/30 hover:from-amber-600/50 hover:to-yellow-600/50 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/40" />
            <span className="text-[11px] hidden md:inline">BXH</span>
          </button>

          {/* Auto-Pickup Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setAutoPickup((prev) => !prev);
              bridge.playSound('powerup');
            }}
            title={autoPickup ? 'Tự động nhặt trang bị: Đang BẬT' : 'Tự động nhặt trang bị: Đang TẮT (bấm để bật)'}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 cursor-pointer ${
              autoPickup
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoPickup ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500'}`} />
            <span className="text-[11px] hidden xs:inline">Tự Nhặt: {autoPickup ? 'BẬT' : 'TẮT'}</span>
            <span className="text-[11px] xs:hidden">{autoPickup ? 'Nhặt' : 'Tắt'}</span>
          </button>

          {/* Gold Counter */}
          <div className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-500/40 px-2 sm:px-2.5 py-1 rounded-xl shadow-inner">
            <Coins className="w-4 h-4 text-yellow-300 fill-yellow-400" />
            <span className="font-black font-mono text-xs sm:text-base text-yellow-200">
              {formatNumber(gold)}
            </span>
          </div>

          {/* End Run & Show Summary Button */}
          <button
            type="button"
            onClick={handleFinishRun}
            title="Kết thúc lượt đấu và hiển thị Bảng tóm tắt kết quả (Post-Game Summary)"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xs:inline">Tổng Kết</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col max-w-2xl w-full mx-auto pb-28 sm:pb-24">
        {/* Tap Titans 2 Battle Arena (Spacious & Clean) */}
        <div className="p-2 sm:p-3 shrink-0">
          <TitanArena
            monster={monster}
            stage={stage}
            chapter={currentChapter}
            isBossRushActive={isFightingBoss}
            bossTimer={Math.ceil(bossTimer)}
            onTapArena={handleTapArena}
            onFightBoss={handleFightBoss}
            onLeaveBoss={handleLeaveBoss}
            onLootClick={handleLootClick}
            floatingDamages={floatingDamages}
            slashes={slashes}
            loots={loots}
            heroLevel={heroLevel}
            heroSlashing={heroSlashing}
            allies={allies}
            alliesAttacking={alliesAttacking}
            onOpenAlliesTab={() => setActiveTab('heroes')}
            bossToast={bossToast}
            autoPickup={autoPickup}
            autoPickupToast={autoPickupToast}
            onToggleAutoPickup={() => setAutoPickup((prev) => !prev)}
          />
        </div>

        {/* Large, Touch-Friendly External Skill Bar directly beneath the characters row */}
        <div className="px-2 sm:px-3 pb-2 shrink-0">
          <SkillBar
            skills={skills}
            heroLevel={heroLevel}
            mana={mana}
            maxMana={maxMana}
            onCastSkill={handleCastSkill}
            isBerserkActive={isBerserkActive}
            isMidasActive={isMidasActive}
            isShadowCloneActive={isShadowCloneActive}
            isWarCryActive={isWarCryActive}
            isBladeStormActive={isBladeStormActive}
            isArmorBreakActive={isArmorBreakActive}
          />
        </div>

        {/* Active Tab Body */}
        <div className="flex-1 mt-1">
          {activeTab === 'swordMaster' && (
            <SwordMasterTab
              heroLevel={heroLevel}
              tapDamage={totalTapDamage}
              nextTapDamage={nextTapDamage}
              levelUpCost={levelUpCost}
              gold={gold}
              skills={skills}
              onLevelUp={handleHeroLevelUp}
              onUpgradeSkill={handleUpgradeSkill}
            />
          )}

          {activeTab === 'heroes' && (
            <HeroesTab
              allies={allies}
              gold={gold}
              totalHeroDps={totalHeroDps}
              onUpgradeAlly={handleUpgradeAlly}
              onUpgradeAllyEquipment={handleUpgradeAllyItem}
              onOpenAllyEquipment={() => setActiveTab('equipment')}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentTab
              equipped={equipped}
              inventory={inventory}
              gold={gold}
              onEquipItem={handleEquipItem}
              onUpgradeItem={handleUpgradeItem}
              onSellItem={handleSellItem}
              onSellAllItems={handleSellAllItems}
              onEquipBestAll={handleEquipBestAll}
              allies={allies}
              allyInventory={allyInventory}
              onEquipAllyItem={handleEquipAllyItem}
              onUpgradeAllyItem={handleUpgradeAllyItem}
              onSellAllyItem={handleSellAllyItem}
              onSellAllAllyItems={handleSellAllAllyItems}
              onEquipBestAllies={handleEquipBestAllies}
            />
          )}

          {activeTab === 'story' && (
            <StoryTab
              currentStage={stage}
              maxStageReached={maxStageReached}
              onSelectStage={handleSelectStage}
            />
          )}

          {activeTab === 'stats' && (
            <StatsTab
              tapDamage={totalTapDamage}
              heroDps={totalHeroDps}
              critRate={critRate}
              critMultiplier={critMultiplier}
              goldMultiplier={goldMultiplier}
              maxStageReached={maxStageReached}
              bossesSlain={bossesSlain}
              monstersSlain={monstersSlain}
              heroLevel={heroLevel}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Bottom 5 Tabs Navigation (Tap Titans 2 Style) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-slate-950/95 border-t border-white/10 backdrop-blur-md flex items-center justify-around py-1.5 px-2 z-40">
        <button
          onClick={() => setActiveTab('swordMaster')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'swordMaster'
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Kiếm Sĩ</span>
        </button>

        <button
          onClick={() => setActiveTab('heroes')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'heroes'
              ? 'text-purple-400 bg-purple-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Đồng Đội</span>
        </button>

        <button
          onClick={() => setActiveTab('equipment')}
          className={`relative flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'equipment'
              ? 'text-cyan-400 bg-cyan-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Trang Bị</span>
          {inventory.some((item) => isBetterItem(item, equipped[item.slot])) ? (
            <span className="absolute -top-0.5 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
          ) : inventory.length > 0 ? (
            <span className="absolute -top-0.5 right-1 w-2 h-2 rounded-full bg-cyan-400" />
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'story'
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Cốt Truyện</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">Chỉ Số</span>
        </button>
      </nav>

      {/* Real-time Dungeon Titan Leaderboard Modal */}
      <DungeonLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          if (activeModal === 'leaderboard') {
            setActiveModal('none');
          }
        }}
        maxStageReached={maxStageReached}
        currentStage={stage}
        bossesSlain={bossesSlain}
        monstersSlain={monstersSlain}
        playerName={profile?.username || 'Kiếm Sĩ Vô Danh'}
        playerAvatar={profile?.avatar || '⚔️'}
        playerTitle={profile?.currentTitle || profile?.equippedTitle || 'Hiệp Sĩ Dungeon'}
        onRefreshScore={() => {
          SupabaseService.submitLeaderboardScore(
            'dungeon-tap',
            profile?.username || 'Kiếm Sĩ Vô Danh',
            maxStageReached,
            profile?.avatar || '⚔️',
            profile?.currentTitle || profile?.equippedTitle || 'Hiệp Sĩ Dungeon',
            {
              bossesSlain,
              monstersSlain,
              currentStage: stage,
              heroLevel,
            }
          );
        }}
      />
    </div>
  );
};
