// @ts-nocheck — generated JavaScript bundle; typed source is checked separately.

// supabase/functions/cosmic-verify/index.ts
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

// src/games/cosmic-defense/data/campaign.json
var campaign_default = [
  {
    id: 1,
    planet: 1,
    stage: 1,
    difficulty: 0,
    duration: 90,
    objective: "kills",
    target: 24,
    parScore: 5100,
    recommended: 0,
    waves: [
      {
        t: 3,
        count: 3,
        formation: 1,
        path: 1,
        lane: 5,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 11,
        count: 4,
        formation: 2,
        path: 1,
        lane: 5,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 19,
        count: 5,
        formation: 3,
        path: 1,
        lane: 5,
        enemy: "scout",
        delay: 0.35,
        drop: "plasma"
      },
      {
        t: 33,
        count: 4,
        formation: 2,
        path: 2,
        lane: 2,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 41,
        count: 4,
        formation: 2,
        path: 2,
        lane: 8,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 50,
        count: 6,
        formation: 1,
        path: 3,
        lane: 5,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 65,
        count: 5,
        formation: 3,
        path: 3,
        lane: 5,
        enemy: "scout",
        delay: 0.35
      },
      {
        t: 74,
        count: 8,
        formation: 1,
        path: 1,
        lane: 5,
        enemy: "scout",
        delay: 0.35
      }
    ]
  },
  {
    id: 2,
    planet: 1,
    stage: 2,
    difficulty: 3,
    duration: 90,
    objective: "survive",
    target: 1,
    parScore: 5400,
    recommended: 1,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 42.9,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 3,
    planet: 1,
    stage: 3,
    difficulty: 6,
    duration: 93,
    objective: "collect",
    target: 6,
    parScore: 5700,
    recommended: 1,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 42.9,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 4,
    planet: 1,
    stage: 4,
    difficulty: 8,
    duration: 93,
    objective: "kills",
    target: 36,
    parScore: 6e3,
    recommended: 2,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 42.9,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 5,
    planet: 1,
    stage: 5,
    difficulty: 10,
    duration: 93,
    objective: "mini",
    target: 1,
    parScore: 6300,
    recommended: 2,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 41.85,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 42.9,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 6,
    planet: 1,
    stage: 6,
    difficulty: 7,
    duration: 96,
    objective: "escort",
    target: 1,
    parScore: 6600,
    recommended: 2,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 7,
    planet: 1,
    stage: 7,
    difficulty: 10,
    duration: 96,
    objective: "generators",
    target: 3,
    parScore: 6900,
    recommended: 3,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 8,
    planet: 1,
    stage: 8,
    difficulty: 12,
    duration: 96,
    objective: "score",
    target: 5e3,
    parScore: 7200,
    recommended: 3,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 62.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 9,
    planet: 1,
    stage: 9,
    difficulty: 15,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 7500,
    recommended: 4,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.65,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 16.3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 42.9,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 49.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 102.75,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 109.4,
        enemy: "scout",
        count: 3,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 122.7,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 129.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 136,
        enemy: "scout",
        count: 3,
        path: 1,
        formation: 3,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 10,
    planet: 1,
    stage: 10,
    difficulty: 14,
    duration: 90,
    objective: "boss",
    target: 1,
    parScore: 26e3,
    recommended: 4,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 29.6,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 56.2,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 11,
    planet: 2,
    stage: 1,
    difficulty: 9,
    duration: 93,
    objective: "kills",
    target: 30,
    parScore: 6400,
    recommended: 5,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 12,
    planet: 2,
    stage: 2,
    difficulty: 12,
    duration: 93,
    objective: "survive",
    target: 1,
    parScore: 6700,
    recommended: 5,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 13,
    planet: 2,
    stage: 3,
    difficulty: 15,
    duration: 96,
    objective: "collect",
    target: 7,
    parScore: 7e3,
    recommended: 6,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 14,
    planet: 2,
    stage: 4,
    difficulty: 17,
    duration: 96,
    objective: "kills",
    target: 42,
    parScore: 7300,
    recommended: 6,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 15,
    planet: 2,
    stage: 5,
    difficulty: 19,
    duration: 96,
    objective: "mini",
    target: 1,
    parScore: 7600,
    recommended: 7,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 43.2,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 16,
    planet: 2,
    stage: 6,
    difficulty: 16,
    duration: 99,
    objective: "escort",
    target: 1,
    parScore: 7900,
    recommended: 8,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 17,
    planet: 2,
    stage: 7,
    difficulty: 19,
    duration: 99,
    objective: "generators",
    target: 3,
    parScore: 8200,
    recommended: 8,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 18,
    planet: 2,
    stage: 8,
    difficulty: 21,
    duration: 99,
    objective: "score",
    target: 6e3,
    parScore: 8500,
    recommended: 9,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 19,
    planet: 2,
    stage: 9,
    difficulty: 24,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 8800,
    recommended: 9,
    waves: [
      {
        t: 3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 9.3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 15.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 11,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "gnat",
        count: 4,
        path: 2,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "scout",
        count: 4,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 110.1,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 122.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 129,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 135.3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 20,
    planet: 2,
    stage: 10,
    difficulty: 23,
    duration: 95,
    objective: "boss",
    target: 1,
    parScore: 27e3,
    recommended: 10,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 21,
    planet: 3,
    stage: 1,
    difficulty: 17,
    duration: 96,
    objective: "kills",
    target: 36,
    parScore: 7700,
    recommended: 11,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "scout",
        count: 4,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 22,
    planet: 3,
    stage: 2,
    difficulty: 20,
    duration: 96,
    objective: "survive",
    target: 1,
    parScore: 8e3,
    recommended: 11,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 23,
    planet: 3,
    stage: 3,
    difficulty: 23,
    duration: 99,
    objective: "collect",
    target: 8,
    parScore: 8300,
    recommended: 12,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 24,
    planet: 3,
    stage: 4,
    difficulty: 25,
    duration: 99,
    objective: "kills",
    target: 48,
    parScore: 8600,
    recommended: 12,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 2,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 25,
    planet: 3,
    stage: 5,
    difficulty: 27,
    duration: 99,
    objective: "mini",
    target: 1,
    parScore: 8900,
    recommended: 13,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 44.550000000000004,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 26,
    planet: 3,
    stage: 6,
    difficulty: 24,
    duration: 102,
    objective: "escort",
    target: 1,
    parScore: 9200,
    recommended: 14,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 27,
    planet: 3,
    stage: 7,
    difficulty: 27,
    duration: 102,
    objective: "generators",
    target: 3,
    parScore: 9500,
    recommended: 14,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 28,
    planet: 3,
    stage: 8,
    difficulty: 29,
    duration: 102,
    objective: "score",
    target: 7e3,
    parScore: 9800,
    recommended: 15,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 29,
    planet: 3,
    stage: 9,
    difficulty: 32,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 10100,
    recommended: 15,
    waves: [
      {
        t: 3,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.95,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.9,
        enemy: "gnat",
        count: 4,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 26.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 32.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 38.7,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "gnat",
        count: 4,
        path: 4,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 56.55,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "gnat",
        count: 4,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 98.2,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 104.15,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 110.1,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 122,
        enemy: "gnat",
        count: 4,
        path: 1,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 127.95,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 133.9,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 139.85,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 30,
    planet: 3,
    stage: 10,
    difficulty: 31,
    duration: 100,
    objective: "boss",
    target: 1,
    parScore: 28e3,
    recommended: 16,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 26.8,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 50.6,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "scout",
        count: 4,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 31,
    planet: 4,
    stage: 1,
    difficulty: 26,
    duration: 99,
    objective: "kills",
    target: 42,
    parScore: 9e3,
    recommended: 17,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 5,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "scout",
        count: 5,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 32,
    planet: 4,
    stage: 2,
    difficulty: 29,
    duration: 99,
    objective: "survive",
    target: 1,
    parScore: 9300,
    recommended: 17,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 33,
    planet: 4,
    stage: 3,
    difficulty: 32,
    duration: 102,
    objective: "collect",
    target: 9,
    parScore: 9600,
    recommended: 18,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 34,
    planet: 4,
    stage: 4,
    difficulty: 34,
    duration: 102,
    objective: "kills",
    target: 54,
    parScore: 9900,
    recommended: 18,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 35,
    planet: 4,
    stage: 5,
    difficulty: 36,
    duration: 102,
    objective: "mini",
    target: 1,
    parScore: 10200,
    recommended: 19,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 45.9,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 36,
    planet: 4,
    stage: 6,
    difficulty: 33,
    duration: 105,
    objective: "escort",
    target: 1,
    parScore: 10500,
    recommended: 20,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 98.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 37,
    planet: 4,
    stage: 7,
    difficulty: 36,
    duration: 105,
    objective: "generators",
    target: 3,
    parScore: 10800,
    recommended: 20,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 98.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 38,
    planet: 4,
    stage: 8,
    difficulty: 38,
    duration: 105,
    objective: "score",
    target: 8e3,
    parScore: 11100,
    recommended: 21,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 98.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 39,
    planet: 4,
    stage: 9,
    difficulty: 41,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 11400,
    recommended: 21,
    waves: [
      {
        t: 3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 14.2,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 19.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 98.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 109.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 120.6,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 126.2,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 131.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 137.4,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 40,
    planet: 4,
    stage: 10,
    difficulty: 40,
    duration: 100,
    objective: "boss",
    target: 1,
    parScore: 29e3,
    recommended: 22,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 25.4,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 41,
    planet: 5,
    stage: 1,
    difficulty: 34,
    duration: 102,
    objective: "kills",
    target: 48,
    parScore: 10300,
    recommended: 23,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 1,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 81.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 42,
    planet: 5,
    stage: 2,
    difficulty: 37,
    duration: 102,
    objective: "survive",
    target: 1,
    parScore: 10600,
    recommended: 23,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 81.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 43,
    planet: 5,
    stage: 3,
    difficulty: 40,
    duration: 105,
    objective: "collect",
    target: 10,
    parScore: 10900,
    recommended: 24,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 44,
    planet: 5,
    stage: 4,
    difficulty: 42,
    duration: 105,
    objective: "kills",
    target: 60,
    parScore: 11200,
    recommended: 24,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 45,
    planet: 5,
    stage: 5,
    difficulty: 44,
    duration: 105,
    objective: "mini",
    target: 1,
    parScore: 11500,
    recommended: 25,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 47.25,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 46,
    planet: 5,
    stage: 6,
    difficulty: 41,
    duration: 108,
    objective: "escort",
    target: 1,
    parScore: 11800,
    recommended: 26,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 102.75,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 47,
    planet: 5,
    stage: 7,
    difficulty: 44,
    duration: 108,
    objective: "generators",
    target: 3,
    parScore: 12100,
    recommended: 26,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 102.75,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 48,
    planet: 5,
    stage: 8,
    difficulty: 46,
    duration: 108,
    objective: "score",
    target: 9e3,
    parScore: 12400,
    recommended: 27,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "gnat",
        count: 5,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 102.75,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 49,
    planet: 5,
    stage: 9,
    difficulty: 49,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 12700,
    recommended: 27,
    waves: [
      {
        t: 3,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 8.25,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "gnat",
        count: 5,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 18.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 29.25,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 39.75,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 50.25,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 81.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 102.75,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "gnat",
        count: 5,
        path: 1,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 123.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 129,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 134.25,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 139.5,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 144.75,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 50,
    planet: 5,
    stage: 10,
    difficulty: 48,
    duration: 100,
    objective: "boss",
    target: 1,
    parScore: 3e4,
    recommended: 28,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "scout",
        count: 5,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 51,
    planet: 6,
    stage: 1,
    difficulty: 43,
    duration: 105,
    objective: "kills",
    target: 54,
    parScore: 11600,
    recommended: 29,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 52,
    planet: 6,
    stage: 2,
    difficulty: 46,
    duration: 105,
    objective: "survive",
    target: 1,
    parScore: 11900,
    recommended: 29,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 53,
    planet: 6,
    stage: 3,
    difficulty: 49,
    duration: 108,
    objective: "collect",
    target: 11,
    parScore: 12200,
    recommended: 30,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 54,
    planet: 6,
    stage: 4,
    difficulty: 51,
    duration: 108,
    objective: "kills",
    target: 66,
    parScore: 12500,
    recommended: 30,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 55,
    planet: 6,
    stage: 5,
    difficulty: 53,
    duration: 108,
    objective: "mini",
    target: 1,
    parScore: 12800,
    recommended: 31,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 48.6,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 56,
    planet: 6,
    stage: 6,
    difficulty: 50,
    duration: 111,
    objective: "escort",
    target: 1,
    parScore: 13100,
    recommended: 32,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 2,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 105.9,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 57,
    planet: 6,
    stage: 7,
    difficulty: 53,
    duration: 111,
    objective: "generators",
    target: 3,
    parScore: 13400,
    recommended: 32,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 15,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 105.9,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 58,
    planet: 6,
    stage: 8,
    difficulty: 55,
    duration: 111,
    objective: "score",
    target: 1e4,
    parScore: 13700,
    recommended: 33,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 15,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 105.9,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 59,
    planet: 6,
    stage: 9,
    difficulty: 58,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 14e3,
    recommended: 33,
    waves: [
      {
        t: 3,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.8,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 17.7,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 37.3,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 42.2,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "scout",
        count: 6,
        path: 15,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 81.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 86.3,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 96.1,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 105.9,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "scout",
        count: 6,
        path: 5,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 120.6,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 125.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 130.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 135.3,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 1,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 60,
    planet: 6,
    stage: 10,
    difficulty: 57,
    duration: 105,
    objective: "boss",
    target: 1,
    parScore: 31e3,
    recommended: 34,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      }
    ]
  },
  {
    id: 61,
    planet: 7,
    stage: 1,
    difficulty: 51,
    duration: 108,
    objective: "kills",
    target: 60,
    parScore: 12900,
    recommended: 35,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 1,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 62,
    planet: 7,
    stage: 2,
    difficulty: 54,
    duration: 108,
    objective: "survive",
    target: 1,
    parScore: 13200,
    recommended: 35,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 63,
    planet: 7,
    stage: 3,
    difficulty: 57,
    duration: 111,
    objective: "collect",
    target: 12,
    parScore: 13500,
    recommended: 36,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 64,
    planet: 7,
    stage: 4,
    difficulty: 59,
    duration: 111,
    objective: "kills",
    target: 72,
    parScore: 13800,
    recommended: 36,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 60,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 65.5,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 65,
    planet: 7,
    stage: 5,
    difficulty: 61,
    duration: 111,
    objective: "mini",
    target: 1,
    parScore: 14100,
    recommended: 37,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 49.95,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 66,
    planet: 7,
    stage: 6,
    difficulty: 58,
    duration: 114,
    objective: "escort",
    target: 1,
    parScore: 14400,
    recommended: 38,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 107.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 67,
    planet: 7,
    stage: 7,
    difficulty: 61,
    duration: 114,
    objective: "generators",
    target: 3,
    parScore: 14700,
    recommended: 38,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 107.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 68,
    planet: 7,
    stage: 8,
    difficulty: 63,
    duration: 114,
    objective: "score",
    target: 11e3,
    parScore: 15e3,
    recommended: 39,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 62.15,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 66.7,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 107.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 69,
    planet: 7,
    stage: 9,
    difficulty: 66,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 15300,
    recommended: 39,
    waves: [
      {
        t: 3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.55,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 12.1,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 16.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 25.75,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 30.3,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 34.85,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 43.95,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 48.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 84.9,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 89.45,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 98.55,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 107.65,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 112.2,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 121.3,
        enemy: "gnat",
        count: 6,
        path: 9,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 125.85,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 130.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 134.95,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 139.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 144.05,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 70,
    planet: 7,
    stage: 10,
    difficulty: 65,
    duration: 105,
    objective: "boss",
    target: 1,
    parScore: 32e3,
    recommended: 40,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 39.4,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 75.8,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      }
    ]
  },
  {
    id: 71,
    planet: 8,
    stage: 1,
    difficulty: 60,
    duration: 111,
    objective: "kills",
    target: 66,
    parScore: 14200,
    recommended: 41,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 5,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 72,
    planet: 8,
    stage: 2,
    difficulty: 63,
    duration: 111,
    objective: "survive",
    target: 1,
    parScore: 14500,
    recommended: 41,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 73,
    planet: 8,
    stage: 3,
    difficulty: 66,
    duration: 114,
    objective: "collect",
    target: 13,
    parScore: 14800,
    recommended: 42,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 74,
    planet: 8,
    stage: 4,
    difficulty: 68,
    duration: 114,
    objective: "kills",
    target: 78,
    parScore: 15100,
    recommended: 42,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 75,
    planet: 8,
    stage: 5,
    difficulty: 70,
    duration: 114,
    objective: "mini",
    target: 1,
    parScore: 15400,
    recommended: 43,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 51.300000000000004,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 76,
    planet: 8,
    stage: 6,
    difficulty: 67,
    duration: 117,
    objective: "escort",
    target: 1,
    parScore: 15700,
    recommended: 44,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 11,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 77,
    planet: 8,
    stage: 7,
    difficulty: 70,
    duration: 117,
    objective: "generators",
    target: 3,
    parScore: 16e3,
    recommended: 44,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 78,
    planet: 8,
    stage: 8,
    difficulty: 72,
    duration: 117,
    objective: "score",
    target: 12e3,
    parScore: 16300,
    recommended: 45,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 17,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 61.8,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 79,
    planet: 8,
    stage: 9,
    difficulty: 75,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 16600,
    recommended: 45,
    waves: [
      {
        t: 3,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 7.2,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 11.4,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 15.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "larva",
        count: 2,
        path: 17,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 28.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 32.4,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 40.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 49.2,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 57.6,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 74.4,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 78.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 82.8,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 91.2,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 99.6,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 112.2,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 120.6,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 124.8,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 129,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 133.2,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 137.4,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 80,
    planet: 8,
    stage: 10,
    difficulty: 74,
    duration: 110,
    objective: "boss",
    target: 1,
    parScore: 33e3,
    recommended: 46,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 19.8,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 36.6,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 53.4,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 103.8,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 81,
    planet: 9,
    stage: 1,
    difficulty: 68,
    duration: 114,
    objective: "kills",
    target: 72,
    parScore: 15500,
    recommended: 47,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 5,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 91.55,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 82,
    planet: 9,
    stage: 2,
    difficulty: 71,
    duration: 114,
    objective: "survive",
    target: 1,
    parScore: 15800,
    recommended: 47,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 91.55,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 83,
    planet: 9,
    stage: 3,
    difficulty: 74,
    duration: 117,
    objective: "collect",
    target: 14,
    parScore: 16100,
    recommended: 48,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 84,
    planet: 9,
    stage: 4,
    difficulty: 76,
    duration: 117,
    objective: "kills",
    target: 84,
    parScore: 16400,
    recommended: 48,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 85,
    planet: 9,
    stage: 5,
    difficulty: 78,
    duration: 117,
    objective: "mini",
    target: 1,
    parScore: 16700,
    recommended: 49,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 52.65,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 86,
    planet: 9,
    stage: 6,
    difficulty: 75,
    duration: 120,
    objective: "escort",
    target: 1,
    parScore: 17e3,
    recommended: 49,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 114.65,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 87,
    planet: 9,
    stage: 7,
    difficulty: 78,
    duration: 120,
    objective: "generators",
    target: 3,
    parScore: 17300,
    recommended: 50,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 5,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 114.65,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 88,
    planet: 9,
    stage: 8,
    difficulty: 80,
    duration: 120,
    objective: "score",
    target: 13e3,
    parScore: 17600,
    recommended: 50,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 60.75,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 5,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 114.65,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      }
    ]
  },
  {
    id: 89,
    planet: 9,
    stage: 9,
    difficulty: 83,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 17900,
    recommended: 51,
    waves: [
      {
        t: 3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.85,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10.7,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 14.55,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 26.1,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 29.95,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 37.65,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49.2,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 53.05,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 56.9,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 72.3,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 76.15,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 7,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 83.85,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 87.7,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 91.55,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 99.25,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 103.1,
        enemy: "scout",
        count: 7,
        path: 5,
        formation: 3,
        lane: 7,
        delay: 0.3
      },
      {
        t: 106.95,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 110.8,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 122.35,
        enemy: "larva",
        count: 2,
        path: 3,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 126.2,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 130.05,
        enemy: "prism",
        count: 2,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0.3
      },
      {
        t: 133.9,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 137.75,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 2,
        delay: 0.3
      }
    ]
  },
  {
    id: 90,
    planet: 9,
    stage: 10,
    difficulty: 82,
    duration: 115,
    objective: "boss",
    target: 1,
    parScore: 34e3,
    recommended: 51,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 18.4,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 33.8,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 64.6,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      }
    ]
  },
  {
    id: 91,
    planet: 10,
    stage: 1,
    difficulty: 77,
    duration: 117,
    objective: "kills",
    target: 78,
    parScore: 16800,
    recommended: 52,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 1,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 92,
    planet: 10,
    stage: 2,
    difficulty: 80,
    duration: 117,
    objective: "survive",
    target: 1,
    parScore: 17100,
    recommended: 52,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 1,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 1,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 93,
    planet: 10,
    stage: 3,
    difficulty: 83,
    duration: 120,
    objective: "collect",
    target: 15,
    parScore: 17400,
    recommended: 53,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 94,
    planet: 10,
    stage: 4,
    difficulty: 85,
    duration: 120,
    objective: "kills",
    target: 90,
    parScore: 17700,
    recommended: 53,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 10.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 16,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 21.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 32.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 43.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 49,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 54.5,
        enemy: "scout",
        count: 6,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 60,
        enemy: "scout",
        count: 3,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 95,
    planet: 10,
    stage: 5,
    difficulty: 87,
    duration: 120,
    objective: "mini",
    target: 1,
    parScore: 18e3,
    recommended: 54,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 54,
        enemy: "commander",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 96,
    planet: 10,
    stage: 6,
    difficulty: 84,
    duration: 120,
    objective: "escort",
    target: 1,
    parScore: 18300,
    recommended: 54,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 2,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 4,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 97,
    planet: 10,
    stage: 7,
    difficulty: 87,
    duration: 120,
    objective: "generators",
    target: 3,
    parScore: 18600,
    recommended: 55,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 8,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 33,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 7,
        delay: 0
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 58,
        enemy: "generator",
        count: 1,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 98,
    planet: 10,
    stage: 8,
    difficulty: 89,
    duration: 120,
    objective: "score",
    target: 14e3,
    parScore: 18900,
    recommended: 55,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 62.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 66,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      }
    ]
  },
  {
    id: 99,
    planet: 10,
    stage: 9,
    difficulty: 92,
    duration: 150,
    objective: "survive",
    target: 1,
    parScore: 19200,
    recommended: 56,
    waves: [
      {
        t: 3,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 6.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 10,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 3,
        lane: 4,
        delay: 0.3,
        drop: "plasma"
      },
      {
        t: 13.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "beetle",
        count: 1,
        path: 7,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 24,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 27.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 34.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 38,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 41.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 48.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 52,
        enemy: "scout",
        count: 7,
        path: 5,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 55.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "gnat",
        count: 7,
        path: 9,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 73,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 3,
        lane: 8,
        delay: 0.3
      },
      {
        t: 76.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 80,
        enemy: "mantis",
        count: 1,
        path: 7,
        formation: 2,
        lane: 3,
        delay: 0.3
      },
      {
        t: 83.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 3,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 90.5,
        enemy: "wraith",
        count: 1,
        path: 16,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 97.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 8,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 2,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 104.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 108,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 4,
        delay: 0.3
      },
      {
        t: 111.5,
        enemy: "wasp",
        count: 2,
        path: 7,
        formation: 2,
        lane: 5,
        delay: 0.3
      },
      {
        t: 122,
        enemy: "moth",
        count: 1,
        path: 3,
        formation: 2,
        lane: 8,
        delay: 0.3
      },
      {
        t: 125.5,
        enemy: "hornet",
        count: 2,
        path: 10,
        formation: 3,
        lane: 2,
        delay: 0.3
      },
      {
        t: 129,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 3,
        delay: 0.3
      },
      {
        t: 132.5,
        enemy: "cicada",
        count: 2,
        path: 7,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 136,
        enemy: "minelayer",
        count: 1,
        path: 14,
        formation: 3,
        lane: 5,
        delay: 0.3
      },
      {
        t: 139.5,
        enemy: "drone",
        count: 2,
        path: 7,
        formation: 1,
        lane: 6,
        delay: 0.3
      }
    ]
  },
  {
    id: 100,
    planet: 10,
    stage: 10,
    difficulty: 91,
    duration: 170,
    objective: "boss",
    target: 1,
    parScore: 35e3,
    recommended: 56,
    waves: [
      {
        t: 3,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 2,
        delay: 0.3
      },
      {
        t: 17,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 6,
        delay: 0.3
      },
      {
        t: 31,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 3,
        delay: 0.3
      },
      {
        t: 59,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 4,
        delay: 0.3
      },
      {
        t: 87,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 1,
        lane: 5,
        delay: 0.3
      },
      {
        t: 101,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 2,
        lane: 2,
        delay: 0.3
      },
      {
        t: 115,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 6,
        delay: 0.3
      },
      {
        t: 157,
        enemy: "scout",
        count: 7,
        path: 3,
        formation: 3,
        lane: 4,
        delay: 0.3
      }
    ]
  }
];

// src/games/cosmic-defense/content.ts
var LEVELS = campaign_default;
var MUTATORS = {
  glass: {
    name: "Glass Cannon",
    bonus: 0.6,
    description: "1 HP, kh\xF4ng h\u1ED3i m\xE1u"
  },
  swarm: { name: "Swarm", bonus: 0.3, description: "Enemy th\xEAm 50%" },
  fast: {
    name: "Fast Forward",
    bonus: 0.25,
    description: "T\u1ED1c \u0111\u1ED9 enemy/\u0111\u1EA1n \xD71,2"
  },
  iron: { name: "Iron Hide", bonus: 0.25, description: "M\xE1u enemy \xD71,5" },
  blackout: { name: "Blackout", bonus: 0.2, description: "Thu h\u1EB9p t\u1EA7m nh\xECn" },
  dry: { name: "Dry Run", bonus: 0.3, description: "Ch\u1EC9 r\u01A1i Nanobot" },
  pacifist: {
    name: "Pacifist Lite",
    bonus: 0.2,
    description: "Kh\xF4ng d\xF9ng item b\u1EA5m"
  },
  remix: {
    name: "Boss Remix",
    bonus: 0.25,
    description: "\u0110\u1ED5i th\u1EE9 t\u1EF1 pattern boss"
  }
};
var ITEM_NAMES = {
  plasma: "Plasma Spread",
  missile: "Homing Missile",
  bomb: "Nova Bomb",
  laser: "Laser Lance",
  shield: "Energy Shield",
  nano: "Repair Nanobot",
  phase: "Phase Cloak",
  magnet: "Star Magnet",
  overdrive: "Overdrive Core",
  amp: "Quantum Amplifier",
  star: "Star Core"
};
var BOSS_HP = [
  1200,
  2e3,
  3e3,
  4200,
  5600,
  7200,
  9e3,
  11e3,
  13500,
  2e4
];
function levelFor(id) {
  return LEVELS[Math.max(0, Math.min(99, Math.trunc(id) - 1))];
}

// src/games/cosmic-defense/engine.ts
var MAX_FRAMES = 36e3;
var EMPTY_UPGRADES = {
  cannon: 0,
  hull: 0,
  reactor: 0,
  magnet: 0,
  thrusters: 0,
  core: 0
};
var STATS = {
  scout: [3, 100, 6, 96],
  gnat: [2, 100, 4, 86],
  drone: [6, 200, 9, 95],
  wasp: [10, 300, 9, 90],
  moth: [15, 300, 12, 52],
  hornet: [8, 200, 7, 96],
  larva: [12, 300, 9, 58],
  larva_small: [4, 50, 5, 70],
  beetle: [40, 600, 15, 30],
  mantis: [24, 600, 13, 43],
  cicada: [12, 400, 9, 45],
  minelayer: [14, 400, 10, 43],
  wraith: [18, 400, 9, 63],
  commander: [150, 2500, 20, 22],
  generator: [55, 800, 12, 60],
  meteor: [6, 50, 8, 55],
  prism: [8, 200, 8, 80]
};
var ACTIVE = ["bomb", "laser", "phase", "overdrive"];
var ITEMS = [
  "plasma",
  "missile",
  "bomb",
  "laser",
  "shield",
  "nano",
  "phase",
  "magnet",
  "overdrive",
  "amp"
];
var q = (v) => Math.round(v * 256) / 256;
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function random(s, drop = false) {
  const key = drop ? "dropRng" : "rng";
  s[key] = Math.imul(s[key], 1664525) + 1013904223 >>> 0;
  return (s[key] >>> 8) / 16777216;
}
var has = (s, m) => s.config.mutators.includes(m);
var difficulty = (s) => s.config.mode === "endless" ? Math.min(110, 50 + s.frame / 1200) : levelFor(
  s.config.mode === "rush" ? (s.bossesKilled + 1) * 10 : s.config.level
).difficulty + (s.config.mode === "ngplus" ? 10 : 0);
var planet = (s) => s.config.mode === "rush" ? Math.min(10, s.bossesKilled + 1) : levelFor(s.config.level).planet;
var speed = (s) => (1 + 4e-3 * difficulty(s)) * (has(s, "fast") ? 1.2 : 1);
var caps = (s) => {
  const band = Math.min(4, Math.floor(difficulty(s) / 20));
  return {
    enemies: [6, 9, 12, 15, 18][band],
    bullets: [40, 70, 110, 160, 220][band],
    tele: [72, 66, 60, 54, 48][band],
    bulletSpeed: [96, 115, 134, 154, 176][band]
  };
};
function message(s, text) {
  s.message = text;
  s.messageUntil = s.frame + 120;
}
function startingHp(integrity, hull) {
  return integrity >= 80 ? hull >= 5 ? 5 : 4 : integrity >= 60 ? 4 : integrity >= 40 ? 3 : 2;
}
function createSimulation(config) {
  const standard = ["daily", "weekly", "endless", "rush"].includes(config.mode), u = standard ? Object.fromEntries(
    Object.keys(EMPTY_UPGRADES).map((k) => [
      k,
      config.mode === "daily" || config.mode === "weekly" ? 5 : ["cannon", "hull", "reactor", "magnet"].includes(k) ? 7 : 6
    ])
  ) : { ...config.upgrades };
  config = {
    ...config,
    upgrades: u,
    integrity: standard || config.mode === "practice" ? 100 : config.integrity,
    boosters: standard || config.mode === "practice" ? [] : [...config.boosters],
    mutators: [...config.mutators]
  };
  const hp = hasConfig(config, "glass") ? 1 : startingHp(config.integrity, u.hull);
  const s = {
    config,
    frame: 0,
    rng: config.seed >>> 0,
    dropRng: (config.seed ^ 2654435769) >>> 0,
    nextId: 1,
    x: 90,
    y: 268,
    targetX: 90,
    targetY: 268,
    hp,
    maxHp: u.hull >= 5 ? 5 : 4,
    weapon: 1,
    missile: 0,
    shield: 0,
    shieldRecharge: 0,
    shieldOwned: false,
    invincible: 0,
    laser: 0,
    cloak: 0,
    overdrive: 0,
    magnet: 0,
    amp: 0,
    itemLevels: {},
    slots: Array(u.reactor >= 10 ? 3 : 2).fill(null),
    slotUsed: Array(u.reactor >= 10 ? 3 : 2).fill(-1),
    revive: config.boosters.includes("revive"),
    lastStand: false,
    status: "playing",
    score: 0,
    combo: 0,
    maxCombo: 0,
    lastKill: -999,
    hits: 0,
    bossHits: 0,
    lastHit: -999,
    kills: 0,
    spawned: 0,
    collected: 0,
    itemsCollected: 0,
    used: 0,
    escortHp: 12,
    generators: 0,
    waveIndex: 0,
    waveSpawn: 0,
    nextSpawn: 0,
    boss: null,
    bossesKilled: 0,
    miniKilled: false,
    bullets: [],
    enemies: [],
    pickups: [],
    hazards: [],
    effects: [],
    replay: [],
    previousMask: 0,
    fire: 0,
    missileFire: 0,
    lastHazard: 0,
    lastSupply: 0,
    lastHeavy: -999,
    dashCooldown: 0,
    message: "K\xE9o \u0111\u1EC3 bay \xB7 T\u1EF1 \u0111\u1ED9ng b\u1EAFn",
    messageUntil: 420,
    telemetry: []
  };
  for (const b of config.boosters) {
    if (b === "shield" || b === "missile") pickup(s, b);
    if (b === "weapon") s.weapon = 3;
    if (b === "bomb" || b === "overdrive") pickup(s, b);
    if (b === "magnet") s.magnet = 900;
    if (b === "amp") s.amp = 1800;
  }
  if (u.reactor >= 5 && !s.slots.some(Boolean)) s.slots[0] = "bomb";
  if (config.level === 2 && config.mode === "campaign") s.slots[0] = "bomb";
  if (config.ship === "bulwark") {
    s.shield = 1;
    s.shieldOwned = true;
  }
  if (config.mode === "practice" && levelFor(config.level).stage === 10) {
    makeBoss(s, planet(s));
    const b = s.boss;
    b.phase = clamp(config.practicePhase || 1, 1, b.planet === 10 ? 4 : 3);
    b.hp = b.maxHp * (1 - (b.phase - 1) / (b.planet === 10 ? 4 : 3)) - 0.01;
    b.transition = 0;
  }
  return s;
}
function hasConfig(c, k) {
  return c.mutators.includes(k);
}
function addEffect(s, x, y, kind) {
  if (s.effects.length < 80) s.effects.push({ x, y, kind, born: s.frame });
}
function score(s, base) {
  s.score += Math.floor(
    base * Math.min(3, 1 + Math.floor(s.combo / 5) * 0.1) * (s.amp > 0 ? 2 : 1)
  );
}
function pickup(s, kind) {
  const old = s.itemLevels[kind] || 0, mastery = s.config.upgrades.core >= (["plasma", "missile", "bomb", "laser"].includes(kind) ? 3 : ["shield", "nano", "phase"].includes(kind) ? 6 : 9) ? 2 : 1;
  s.itemLevels[kind] = Math.min(3, Math.max(mastery, old + 1));
  const lvl = s.itemLevels[kind];
  if (kind === "star") {
    s.collected++;
    score(s, 25);
    return;
  }
  s.itemsCollected++;
  score(s, 150);
  addEffect(s, s.x, s.y, "item_pickup");
  message(s, ITEM_NAMES[kind]);
  if (ACTIVE.includes(kind)) {
    let i = s.slots.indexOf(kind);
    if (i < 0) i = s.slots.indexOf(null);
    if (i < 0) i = s.slotUsed.indexOf(Math.min(...s.slotUsed));
    s.slots[i] = kind;
    return;
  }
  if (kind === "plasma") {
    s.weapon = Math.min(5, s.weapon + 1);
    if (s.weapon === 5) score(s, 150);
  }
  if (kind === "missile") s.missile = Math.min(3, s.missile + 1);
  if (kind === "shield") {
    s.shieldOwned = true;
    s.shield = lvl >= 2 ? 2 : 1;
  }
  if (kind === "nano" && !has(s, "glass")) {
    if (s.hp === s.maxHp) score(s, 500);
    else s.hp = Math.min(s.maxHp, s.hp + 1);
    if (lvl >= 2) s.invincible = Math.max(s.invincible, 180);
  }
  if (kind === "magnet") s.magnet = (lvl === 1 ? 10 : 15) * 60;
  if (kind === "amp") s.amp = (lvl === 1 ? 12 : 18) * 60;
}
function useSlot(s, index) {
  const kind = s.slots[index];
  if (!kind || s.status !== "playing" || has(s, "pacifist") || s.boss?.planet === 6 && s.boss.phase === 2 && s.frame % 720 < 180)
    return;
  const lvl = s.itemLevels[kind] || 1, mult = 1 + 0.03 * s.config.upgrades.reactor;
  s.slots[index] = null;
  s.slotUsed[index] = s.frame;
  s.used++;
  if (kind === "bomb") {
    s.bullets = s.bullets.filter((b) => b.player);
    for (const e of s.enemies) e.hp -= lvl >= 2 ? 250 : 150;
    if (s.boss && s.boss.transition <= s.frame) {
      s.boss.hp -= (lvl >= 2 ? 250 : 150) * (s.boss.weak > s.frame ? 2 : 1);
      for (const p of s.boss.parts) p.hp -= 150;
    }
    addEffect(s, s.x, s.y, "explode_m");
    message(s, "NOVA BOMB");
  }
  if (kind === "laser") s.laser = Math.round((lvl >= 2 ? 6 : 4) * 60 * mult);
  if (kind === "phase") s.cloak = Math.round((lvl >= 2 ? 4.5 : 3) * 60 * mult);
  if (kind === "overdrive")
    s.overdrive = Math.round((lvl >= 2 ? 8 : 6) * 60 * mult);
}
function revive(s) {
  if (s.status !== "revive" || !s.revive) return;
  s.revive = false;
  s.hp = 2;
  s.invincible = 180;
  s.bullets = s.bullets.filter((b) => b.player);
  s.status = "playing";
  s.replay.push([s.frame, Math.round(s.x), Math.round(s.y), 16]);
}
function damage(s, n = 1, boss = false) {
  if (s.invincible > 0 || s.cloak > 0 || s.status !== "playing") return;
  if (s.shield > 0) {
    s.shield--;
    s.shieldRecharge = 1200;
    s.invincible = 40;
    return;
  }
  const loss = Math.min(s.hp, n);
  s.hp -= loss;
  s.hits += loss;
  if (boss) s.bossHits += loss;
  if (s.frame - s.lastHit <= 300) s.weapon = Math.max(1, s.weapon - 1);
  s.lastHit = s.frame;
  s.combo = 0;
  s.invincible = 90;
  s.telemetry.push({ frame: s.frame, wave: s.waveIndex, x: s.x, y: s.y });
  s.bullets = s.bullets.filter(
    (b) => b.player || Math.hypot(b.x - s.x, b.y - s.y) > 22
  );
  addEffect(s, s.x, s.y, "explode_s");
  message(s, s.hp > 0 ? "LUMI: C\u1EA9n th\u1EADn!" : "T\xE0u b\u1ECB h\u1EA1");
  if (s.config.mode === "practice") {
    s.hp = s.maxHp;
    return;
  }
  if (s.hp === 1 && s.config.upgrades.hull >= 10 && !s.lastStand) {
    s.lastStand = true;
    s.invincible = 120;
  }
  if (s.hp <= 0) {
    addEffect(s, s.x, s.y, "aegis_explode");
    s.status = s.revive ? "revive" : "lost";
  }
}
function spawn(s, kind, lane, path, drop, at) {
  if (s.enemies.length >= caps(s).enemies) return;
  const st = STATS[kind], p = planet(s), hp = st[0] * (1 + 0.25 * (p - 1)) * (has(s, "iron") ? 1.5 : 1) * (s.config.mode === "ngplus" ? 1.5 : 1);
  const x = at?.x ?? clamp(lane * 18, 10, 170), y = at?.y ?? (path === 17 ? 345 : -20);
  const born = at ? s.frame - Math.round((y + 20) / st[3] * 60) : s.frame;
  s.enemies.push({
    id: s.nextId++,
    kind,
    x,
    y,
    x0: x,
    born,
    hp,
    maxHp: hp,
    radius: st[2],
    path,
    fire: s.frame + 90,
    tele: 0,
    aimX: s.x,
    aimY: s.y,
    drop
  });
  s.spawned++;
}
function bullet(s, b) {
  if (s.bullets.length >= 300) return;
  if (!b.player) {
    if (s.bullets.filter((b2) => !b2.player).length >= caps(s).bullets || Math.hypot(b.x - s.x, b.y - s.y) < 48 || b.y < 0 || b.y > 320)
      return;
  }
  s.bullets.push(b);
}
function aimed(s, x, y, count = 1, spread = 0.22, kind = "aimed", dmg = 1, angle) {
  const a = angle ?? Math.atan2(s.y - y, s.x - x);
  for (let i = 0; i < count; i++) {
    const theta = a + (i - (count - 1) / 2) * spread, v = caps(s).bulletSpeed * (has(s, "fast") ? 1.2 : 1);
    bullet(s, {
      x,
      y,
      vx: q(Math.cos(theta) * v),
      vy: q(Math.sin(theta) * v),
      player: false,
      damage: dmg,
      radius: kind === "bomb" ? 4 : 1.5,
      kind,
      ttl: kind === "bomb" ? 90 : 600,
      pierce: 0,
      hit: []
    });
  }
}
function ring(s, x, y, count, offset = 0) {
  for (let i = 0; i < count; i++)
    aimed(s, x, y, 1, 0, "round", 1, offset + Math.PI * 2 * i / count);
}
function makeBoss(s, p) {
  const maxHp = BOSS_HP[p - 1], parts = [];
  if ([5, 6, 8].includes(p)) {
    const n = p === 8 ? 3 : 4;
    for (let i = 0; i < n; i++)
      parts.push({
        x: 30 + 120 / (n - 1) * i,
        y: p === 8 ? 118 : 90 + i % 2 * 25,
        hp: p === 5 ? 400 : p === 6 ? 600 : 500,
        maxHp: p === 5 ? 400 : p === 6 ? 600 : 500,
        radius: 12,
        kind: p === 5 ? "tentacle" : p === 6 ? "turret" : "rod"
      });
  }
  s.boss = {
    planet: p,
    x: 90,
    y: p === 10 ? 92 : 65,
    hp: maxHp,
    maxHp,
    phase: 1,
    transition: s.frame + 180,
    fire: s.frame + 270,
    pattern: 0,
    weak: 0,
    born: s.frame,
    phaseStart: s.frame,
    parts
  };
  message(s, "Boss \u0111ang ti\u1EBFp c\u1EADn");
}
function hazard(s, kind, x, y, w, h, life = 60, dmg = 1) {
  if (dmg === 2) {
    if (s.frame - s.lastHeavy < 480) return;
    s.lastHeavy = s.frame;
  }
  const tele = caps(s).tele + (dmg === 2 ? 12 : 0);
  s.hazards.push({
    kind,
    x,
    y,
    w,
    h,
    start: s.frame + tele,
    end: s.frame + tele + life,
    damage: dmg
  });
}
function bossUpdate(s) {
  const b = s.boss;
  if (!b) return;
  const p = b.planet, maxPhase = p === 10 ? 4 : 3;
  const phase = clamp(
    Math.floor((1 - Math.max(0, b.hp / b.maxHp)) * maxPhase) + 1,
    1,
    maxPhase
  );
  if (phase > b.phase) {
    b.phase = phase;
    b.phaseStart = s.frame;
    b.transition = s.frame + 90;
    b.fire = s.frame + 150;
    s.bullets = s.bullets.filter((v) => v.player);
    s.hazards = [];
    score(s, 3e3);
    message(s, `Pha ${phase} \xB7 \u0110\u1ED5i chi\u1EBFn thu\u1EADt`);
  }
  if (p !== 6)
    b.x = q(90 + Math.sin((s.frame - b.born) / 120) * (p === 3 ? 55 : 20));
  if (p === 7) b.x = 36 + Math.floor((s.frame - b.born) / 360) % 5 * 27;
  b.y = q((p === 10 ? 92 : p === 3 ? 48 : 68) + Math.sin(s.frame / 90) * 3);
  if (p === 10 && b.phase === 4) b.weak = s.frame + 300;
  if (s.frame < b.transition || s.frame < b.fire) return;
  b.fire = s.frame + Math.max(45, 150 - b.phase * 15 - Math.floor(difficulty(s) / 3));
  b.pattern++;
  const pattern = b.pattern + (has(s, "remix") ? s.config.seed % 3 : 0);
  if (p === 1) {
    if (b.phase >= 2 && pattern % 3 === 0) {
      hazard(s, "beam", s.x, 160, 27, 320, 40, 2);
      b.weak = s.frame + caps(s).tele + 160;
    } else if (pattern % 2) {
      for (let i = 0; i < 3; i++)
        hazard(s, "meteor", 20 + random(s) * 140, 165, 12, 320, 35);
    } else aimed(s, b.x, b.y + 35, 5, 0.22, "shard", 1, Math.PI / 2);
  }
  if (p === 2) {
    if (pattern % 3 === 0) {
      hazard(s, "slow", 30 + random(s) * 120, 200, 40, 80, 180, 0);
      if (b.phase >= 2) {
        spawn(s, "larva", 3, 3);
        spawn(s, "larva", 7, 3);
        b.weak = s.frame + 180;
      }
    } else if (b.phase === 3) ring(s, b.x, b.y + 35, 12, pattern * 0.2);
    else aimed(s, b.x, b.y + 35, 3, 0.12);
  }
  if (p === 3) {
    if (b.phase >= 2 && pattern % 3 === 0) {
      hazard(s, "ice", s.x, 160, 23, 320, 72);
      b.weak = s.frame + caps(s).tele + 120;
    } else aimed(s, b.x, b.y + 20, 5, 0.3, "shard");
  }
  if (p === 4) {
    if (pattern % 2) {
      hazard(s, "beam", s.x, 220, 23, 200, 72);
      hazard(s, "beam", s.x < 90 ? 145 : 35, 220, 23, 200, 72);
      b.weak = s.frame + caps(s).tele + 120;
    } else if (b.phase === 3) {
      const gap = 30 + Math.floor(random(s) * 6) * 20;
      for (let x = 5; x < 180; x += 10)
        if (Math.abs(x - gap) > 14)
          aimed(s, x, b.y + 35, 1, 0, "shard", 1, Math.PI / 2);
    } else aimed(s, b.x, b.y + 40, 7, 0.24, "bomb");
  }
  if (p === 5) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 300;
    if (b.phase >= 3 && pattern % 3 === 0)
      hazard(s, "gravity", 90, 190, 70, 70, 300, 0);
    else if (b.phase >= 2 && pattern % 2 === 0)
      aimed(s, b.x, b.y + 35, 6, 0.28, "bomb");
    else
      for (const part of b.parts.filter((v) => v.hp > 0).slice(pattern % 2, pattern % 2 + 2))
        hazard(s, "beam", part.x, 180, 20, 210, 60);
  }
  if (p === 6) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 600;
    if (b.phase === 3) ring(s, b.x, b.y + 25, 8, pattern * 0.26);
    else if (pattern % 3 === 0) {
      const gap = 25 + random(s) * 130;
      for (let x = 12; x < 180; x += 32)
        if (Math.abs(x - gap) > 22) hazard(s, "beam", x, 160, 8, 320, 48);
    } else
      for (const part of b.parts.filter((v) => v.hp > 0))
        aimed(s, part.x, part.y, 1);
  }
  if (p === 7) {
    b.weak = s.frame + 90;
    if (b.phase >= 2 && !b.parts.length)
      for (let i = 0; i < 3; i++)
        b.parts.push({
          x: 35 + i * 55,
          y: 120,
          hp: 30,
          maxHp: 30,
          radius: 10,
          kind: "decoy"
        });
    aimed(s, b.x, b.y + 25, 7, 0.18);
    if (b.phase === 3 && pattern % 3 === 0)
      hazard(s, "slow", s.x, s.y, 35, 80, 240, 0);
  }
  if (p === 8) {
    if (b.parts.every((v) => v.hp <= 0)) b.weak = s.frame + 360;
    hazard(
      s,
      "beam",
      s.x,
      160,
      b.phase === 3 ? 33 : 20,
      320,
      b.phase === 3 ? 90 : 18,
      b.phase === 3 ? 2 : 1
    );
    if (pattern % 2 === 0) aimed(s, b.x, b.y + 30, 3, 0.5, "round");
  }
  if (p === 9) {
    b.weak = pattern % 2 === 0 ? s.frame + 120 : 0;
    if (b.phase === 3) {
      if (!b.parts.length)
        for (let i = 0; i < 12; i++)
          b.parts.push({
            x: 90 + Math.cos(i * Math.PI / 6) * 55,
            y: 120 + Math.sin(i * Math.PI / 6) * 35,
            hp: 150,
            maxHp: 150,
            radius: 6,
            kind: "shard"
          });
      ring(s, b.x, b.y, 12, pattern * 0.15);
    } else if (b.phase === 2 && pattern % 3 === 0)
      for (let i = 0; i < 3; i++)
        hazard(s, "beam", 40 + i * 50, 160, 9, 320, 60);
    else aimed(s, b.x, b.y + 40, 4, 0.35);
  }
  if (p === 10) {
    if (b.phase === 1) {
      aimed(s, b.x, b.y + 45, 5, 0.2);
      if (pattern % 6 === 0) {
        spawn(s, "gnat", 2, 3);
        spawn(s, "beetle", 7, 1);
      }
    }
    if (b.phase === 2) {
      const memory = Math.floor((s.frame - b.phaseStart) / 720) % 3;
      if (memory === 0) hazard(s, "beam", s.x, 160, 27, 320, 50, 2);
      if (memory === 1) {
        const gap = 30 + random(s) * 120;
        for (let x = 10; x < 180; x += 10)
          if (Math.abs(x - gap) > 15)
            aimed(s, x, 130, 1, 0, "shard", 1, Math.PI / 2);
      }
      if (memory === 2) aimed(s, b.x, b.y + 40, 7, 0.2);
    }
    if (b.phase === 3) {
      hazard(s, "gravity", 90, 185, 65, 65, 100, 0);
      ring(s, b.x, b.y + 45, 18, pattern * 0.35);
    }
    if (b.phase === 4) {
      b.weak = s.frame + 300;
      if (pattern % 3 === 0) hazard(s, "beam", s.x, 160, 33, 320, 48, 2);
      else ring(s, b.x, b.y + 40, 12, pattern * 0.1);
    }
  }
  if (b.hp <= 0) bossKilled(s);
}
function bossKilled(s) {
  if (!s.boss) return;
  const p = s.boss.planet;
  score(
    s,
    1e4 + 3e3 * (p === 10 ? 4 : 3) + s.bullets.filter((v) => !v.player).length * 50
  );
  addEffect(s, s.boss.x, s.boss.y, "explode_m");
  s.bullets = [];
  s.hazards = [];
  s.enemies = [];
  s.boss = null;
  s.bossesKilled++;
  if (s.config.mode === "rush" && s.bossesKilled < 10) {
    s.hp = Math.min(s.maxHp, s.hp + 1);
    makeBoss(s, s.bossesKilled + 1);
  } else if (s.config.mode === "practice") {
    makeBoss(s, p);
    const b = s.boss;
    b.phase = s.config.practicePhase || 1;
    b.hp = b.maxHp * (1 - (b.phase - 1) / (p === 10 ? 4 : 3)) - 0.01;
  } else if (s.config.mode !== "endless") s.status = "won";
}
function pathPosition(s, e) {
  const age = (s.frame - e.born) / 60, v = STATS[e.kind][3] * speed(s), isHover = e.path === 7 || e.kind === "commander" || e.kind === "generator";
  if (isHover) {
    e.y = q(Math.min(e.kind === "generator" ? 95 : 70, -20 + age * v));
    e.x = q(clamp(e.x0 + (planet(s) > 1 ? Math.sin(age) * 16 : 0), 12, 168));
    if (age > 10 && e.kind !== "commander" && e.kind !== "generator")
      e.y = q(70 + (age - 10) * v);
    return;
  }
  e.y = q(e.path === 17 ? 345 - age * v : -20 + age * v);
  if (e.path === 2)
    e.x = q(clamp(e.x0 + (e.x0 < 90 ? 1 : -1) * age * v * 0.4, 8, 172));
  if ([3, 11, 16].includes(e.path))
    e.x = q(
      clamp(e.x0 + Math.sin(age * 2.2) * (e.path === 11 ? 40 : 22), 8, 172)
    );
  if (e.path === 4)
    e.x = q(clamp(e.x0 + (Math.abs(age * 35 % 80 - 40) - 20), 8, 172));
  if ([5, 6, 8, 9, 12, 13].includes(e.path))
    e.x = q(
      clamp(
        90 + Math.cos(age * (e.path === 12 ? 3 : 2) + e.x0 / 35) * (e.path === 9 ? Math.max(10, 45 - age * 6) : 40),
        8,
        172
      )
    );
  if (e.path === 14) {
    e.y = 80;
    e.x = q((e.x0 + age * 32) % 210 - 15);
  }
  if (e.path === 15 && age > 2) {
    e.y = q(170 - (age - 2) * 100);
    e.x = q(clamp(e.x0 + (e.x0 < 90 ? 1 : -1) * (age - 2) * 35, 0, 180));
  }
  if (e.path === 10 && age > 1) {
    e.y = 70;
    if (!e.tele) {
      e.tele = s.frame + caps(s).tele;
      e.aimX = s.x;
      e.aimY = s.y;
    }
    if (s.frame > e.tele) {
      const d = (s.frame - e.tele) / 60, theta = Math.atan2(e.aimY - 70, e.aimX - e.x0);
      e.x = q(e.x0 + Math.cos(theta) * d * 300);
      e.y = q(70 + Math.sin(theta) * d * 300);
    }
  }
}
function enemyUpdate(s, e) {
  pathPosition(s, e);
  if (e.kind === "cicada") {
    for (const other of s.enemies)
      if (other.id !== e.id && Math.hypot(other.x - e.x, other.y - e.y) < 45)
        other.hp = Math.min(other.maxHp, other.hp + other.maxHp * 0.1 / 60);
  }
  if (s.frame - e.born < 36 || e.y < 0 || e.y > 200 || [
    "scout",
    "gnat",
    "larva",
    "larva_small",
    "hornet",
    "generator",
    "meteor"
  ].includes(e.kind))
    return;
  if (s.frame % 1440 >= 1200) return;
  if (s.frame >= e.fire) {
    if (!e.tele) {
      e.tele = s.frame + caps(s).tele;
      e.aimX = s.x;
      e.aimY = s.y;
      return;
    }
    if (s.frame < e.tele) return;
    if (e.kind === "minelayer")
      bullet(s, {
        x: e.x,
        y: e.y,
        vx: 0,
        vy: 0,
        player: false,
        damage: 1,
        radius: 4,
        kind: "mine",
        ttl: 360,
        pierce: 0,
        hit: []
      });
    else if (e.kind === "commander") ring(s, e.x, e.y + 22, 8, s.frame / 60);
    else if (e.kind === "moth") aimed(s, e.x, e.y + 12, 1, 0, "bomb");
    else if (e.kind !== "wraith" || Math.floor((s.frame - e.born) / 120) % 2 === 0)
      aimed(
        s,
        e.x,
        e.y + e.radius,
        e.kind === "beetle" ? 3 : 1,
        0.3,
        e.kind === "wasp" ? "aimed" : "round",
        1,
        Math.atan2(e.aimY - e.y, e.aimX - e.x)
      );
    e.fire = s.frame + Math.round(144 - difficulty(s) * 0.7);
    e.tele = 0;
  }
}
function death(s, e) {
  if (s.frame - s.lastKill > 120) s.combo = 0;
  s.combo++;
  s.maxCombo = Math.max(s.maxCombo, s.combo);
  s.lastKill = s.frame;
  s.kills++;
  score(s, STATS[e.kind][1]);
  if (e.kind === "generator") s.generators++;
  if (e.kind === "commander") s.miniKilled = true;
  addEffect(s, e.x, e.y, e.radius > 12 ? "explode_m" : "explode_s");
  if (e.kind === "larva" && s.enemies.length < caps(s).enemies - 1) {
    spawn(s, "larva_small", 3, 2, void 0, { x: e.x - 8, y: e.y });
    spawn(s, "larva_small", 7, 2, void 0, { x: e.x + 8, y: e.y });
  }
  if (e.kind === "commander") {
    s.pickups.push(
      { x: e.x - 12, y: e.y, kind: "plasma", born: s.frame },
      { x: e.x + 12, y: e.y, kind: "nano", born: s.frame }
    );
  }
  if (e.drop && !has(s, "dry"))
    s.pickups.push({ x: e.x, y: e.y, kind: e.drop, born: s.frame });
  const chance = (planet(s) <= 2 ? 0.08 : planet(s) <= 7 ? 0.06 : 0.05) * (s.config.boosters.includes("lucky") ? 1.25 : 1);
  if (random(s, true) < chance) {
    let kind = ITEMS[Math.floor(random(s, true) * ITEMS.length)];
    if (has(s, "dry")) kind = "nano";
    s.pickups.push({ x: e.x, y: e.y, kind, born: s.frame });
  }
  if (random(s, true) < 0.32 || levelFor(s.config.level).objective === "collect")
    s.pickups.push({ x: e.x, y: e.y, kind: "star", born: s.frame });
}
function updateBullets(s) {
  const damageMult = (1 + 0.04 * s.config.upgrades.cannon) * 1.032 ** Object.values(s.config.upgrades).reduce((a, b) => a + b, 0) * (s.config.integrity >= 80 ? 1 : s.config.integrity >= 60 ? 0.92 : s.config.integrity >= 40 ? 0.88 : s.config.integrity >= 20 ? 0.82 : 0.75) * (s.config.ship === "striker" ? 1.1 : s.config.ship === "bulwark" ? 0.9 : 1);
  for (const b of [...s.bullets]) {
    if (b.kind === "missile") {
      const target = s.enemies.find((e) => e.hp > 0) || s.boss;
      if (target) {
        const a = Math.atan2(target.y - b.y, target.x - b.x);
        b.vx = q(b.vx * 0.9 + Math.cos(a) * 260 * 0.1);
        b.vy = q(b.vy * 0.9 + Math.sin(a) * 260 * 0.1);
      }
    }
    b.x = q(b.x + b.vx / 60);
    b.y = q(b.y + b.vy / 60);
    b.ttl--;
    if (!b.player) {
      if (s.laser > 0 && Math.abs(b.x - s.x) < 6 && b.y < s.y) {
        b.ttl = 0;
        continue;
      }
      if (b.kind === "bomb" && b.ttl <= 0) {
        ring(s, b.x, b.y, 8);
        continue;
      }
      if (b.kind === "mine" && Math.hypot(b.x - s.x, b.y - s.y) < 20) {
        b.ttl = 0;
        ring(s, b.x, b.y, 6);
      }
      if (Math.hypot(b.x - s.x, b.y - s.y) < b.radius + (s.config.upgrades.thrusters >= 10 ? 1.8 : 2)) {
        damage(s, b.damage, !!s.boss);
        b.ttl = 0;
      }
      continue;
    }
    for (const e of s.enemies) {
      if (e.hp <= 0 || b.hit.includes(e.id) || e.kind === "wraith" && Math.floor((s.frame - e.born) / 120) % 2 === 1)
        continue;
      if (Math.abs(b.x - e.x) < e.radius + 2 && Math.abs(b.y - e.y) < e.radius + 3) {
        let scale = e.kind === "beetle" && b.kind !== "missile" ? 0.6 : 1;
        if (e.kind === "mantis" && b.kind !== "missile" && Math.sin(s.frame / 40) > 0)
          scale = 0.1;
        if (e.kind === "prism" && b.kind !== "missile" && Math.floor(s.frame / 90) % 2 === 1) {
          aimed(s, e.x, e.y + 12, 1);
          scale = 0;
        }
        e.hp -= b.damage * damageMult * scale;
        b.hit.push(e.id);
        addEffect(s, b.x, b.y, "explode_s");
        if (b.pierce-- <= 0) b.ttl = 0;
        break;
      }
    }
    const boss = s.boss;
    if (boss && boss.transition <= s.frame && b.ttl > 0) {
      let hitPart = false;
      for (const p of boss.parts)
        if (p.hp > 0 && Math.hypot(b.x - p.x, b.y - p.y) < p.radius + 3) {
          p.hp -= b.damage * damageMult;
          b.ttl = 0;
          hitPart = true;
          if (p.kind === "shard" && p.hp <= 0) boss.hp -= boss.maxHp * 0.025;
          break;
        }
      if (!hitPart && Math.abs(b.x - boss.x) < (boss.planet === 3 ? 22 : boss.planet === 10 ? 62 : 40) && Math.abs(b.y - boss.y) < (boss.planet === 10 ? 58 : 30)) {
        const shielded = [5, 6, 8].includes(boss.planet) && boss.parts.some((p) => p.hp > 0), reflect = boss.planet === 9 && boss.weak <= s.frame && Math.abs(b.x - boss.x) > 12;
        if (reflect) {
          if (s.bullets.filter((v) => v.kind === "aimed").length < 20)
            aimed(s, b.x, b.y + 10, 1);
        } else
          boss.hp -= b.damage * damageMult * (boss.weak > s.frame ? 2 : shielded ? [6, 8].includes(boss.planet) ? 0 : 0.15 : 1);
        b.ttl = 0;
      }
    }
  }
  s.bullets = s.bullets.filter(
    (b) => b.ttl > 0 && b.x > -20 && b.x < 200 && b.y > -30 && b.y < 350
  );
}
function spawnWaves(s) {
  const l = levelFor(s.config.level);
  if (s.config.mode === "practice" && s.config.practiceEnemy) {
    if (s.frame % 300 === 1)
      for (let i = 0; i < (s.config.practiceCount || 1); i++)
        spawn(s, s.config.practiceEnemy, 3 + i * 2, s.config.practicePath || 1);
    return;
  }
  if (s.config.mode === "endless") {
    if (s.frame % Math.max(60, 240 - Math.floor(difficulty(s))) === 0 && s.enemies.length < caps(s).enemies)
      spawn(
        s,
        [
          "scout",
          "drone",
          "gnat",
          "wasp",
          "beetle",
          "hornet",
          "wraith"
        ][Math.floor(random(s) * 7)],
        Math.floor(random(s) * 7) + 2,
        7
      );
    if (s.frame % 21600 === 0 && !s.boss)
      makeBoss(s, 1 + Math.floor(random(s) * 10));
    else if (s.frame % 10800 === 0) spawn(s, "commander", 5, 7);
    if (s.frame % 7200 === 0) s.hp = Math.min(s.maxHp, s.hp + 1);
    return;
  }
  if (s.config.mode === "rush") return;
  const waves = s.config.mode === "practice" && s.config.practiceWave !== void 0 ? [{ ...l.waves[s.config.practiceWave], t: 2 }].filter((w2) => w2.enemy) : l.waves;
  if (s.config.mode === "practice" && !s.boss && s.waveIndex >= waves.length && s.enemies.length === 0) {
    s.waveIndex = 0;
    s.waveSpawn = 0;
    s.nextSpawn = s.frame + 60;
  }
  const w = waves[s.waveIndex];
  if (!w || s.frame < w.t * 60 || s.frame < s.nextSpawn || s.enemies.length >= caps(s).enemies)
    return;
  const count = w.count + (has(s, "swarm") ? Math.ceil(w.count * 0.5) : 0);
  const index = s.waveSpawn;
  let lane = w.formation === 1 ? 2 + index % 7 : w.formation === 3 ? clamp(w.lane + (index % 2 ? 1 : -1) * Math.ceil(index / 2), 1, 9) : w.lane;
  if ((s.config.seed >>> 4) % 2 === 1 && s.config.mode !== "campaign" || has(s, "remix"))
    lane = 10 - lane;
  spawn(s, w.enemy, lane, w.path, index === count - 1 ? w.drop : void 0);
  s.nextSpawn = s.frame + Math.round(w.delay * 60);
  s.waveSpawn++;
  if (s.waveSpawn >= count) {
    s.waveIndex++;
    s.waveSpawn = 0;
  }
}
function objectiveMet(s) {
  const l = levelFor(s.config.level);
  return l.objective === "kills" ? s.kills >= l.target : l.objective === "collect" ? s.collected >= l.target : l.objective === "generators" ? s.generators >= l.target : l.objective === "score" ? s.score >= l.target : l.objective === "mini" ? s.miniKilled : l.objective === "escort" ? s.escortHp > 0 : l.objective === "survive";
}
function step(s, input, record = true) {
  if (s.status !== "playing") return;
  if (s.frame % 3 === 0) {
    s.targetX = clamp(Math.round(input.x), 6, 174);
    s.targetY = clamp(Math.round(input.y), 24, 304);
    const mask = input.mask & 63;
    if (record && (s.replay.length === 0 || s.replay.at(-1)[1] !== s.targetX || s.replay.at(-1)[2] !== s.targetY || s.replay.at(-1)[3] !== mask))
      s.replay.push([s.frame, s.targetX, s.targetY, mask]);
    for (let i = 0; i < s.slots.length; i++)
      if (mask & 1 << i && !(s.previousMask & 1 << i)) useSlot(s, i);
    if (mask & 8 && !(s.previousMask & 8) && s.config.upgrades.thrusters >= 5 && s.dashCooldown === 0) {
      s.invincible = Math.max(s.invincible, 18);
      s.overdrive = Math.max(s.overdrive, 18);
      s.dashCooldown = 360;
    }
    s.previousMask = mask;
  }
  s.frame++;
  s.dashCooldown = Math.max(0, s.dashCooldown - 1);
  for (const key of [
    "invincible",
    "laser",
    "cloak",
    "overdrive",
    "magnet",
    "amp"
  ])
    s[key] = Math.max(0, s[key] - 1);
  if (s.shieldOwned && s.shield === 0 && s.shieldRecharge-- <= 0) s.shield = 1;
  let movement = 200 * (1 + 0.02 * s.config.upgrades.thrusters) * (s.overdrive > 0 ? 1.3 : 1) * (s.config.ship === "courier" ? 1.1 : 1);
  for (const h of s.hazards)
    if (h.start <= s.frame && h.end >= s.frame) {
      if (h.kind === "gravity") {
        const a = Math.atan2(h.y - s.y, h.x - s.x);
        s.x = q(s.x + Math.cos(a) * 0.3);
        s.y = q(s.y + Math.sin(a) * 0.3);
      } else if (Math.abs(s.x - h.x) < h.w / 2 && Math.abs(s.y - h.y) < h.h / 2) {
        if (h.kind === "slow" || h.kind === "ice") movement *= 0.6;
        if (h.damage) damage(s, h.damage, !!s.boss);
      }
    }
  const dx = s.targetX - s.x, dy = s.targetY - s.y, d = Math.hypot(dx, dy), v = Math.min(d, movement / 60);
  if (d > 0) {
    s.x = q(clamp(s.x + dx / d * v, 6, 174));
    s.y = q(clamp(s.y + dy / d * v, 24, 304));
  }
  if (planet(s) === 5 || planet(s) === 8)
    s.x = q(clamp(s.x + Math.sin(s.frame / 120) * 0.2, 6, 174));
  spawnWaves(s);
  const l = levelFor(s.config.level);
  if ((l.stage === 10 || s.config.mode === "rush") && !s.boss && s.bossesKilled === 0 && s.frame === 1)
    makeBoss(s, planet(s));
  bossUpdate(s);
  if (s.boss && s.boss.hp <= 0) bossKilled(s);
  if (s.frame >= s.fire && s.cloak === 0 && (s.enemies.length || s.boss)) {
    s.fire = s.frame + (s.overdrive > 0 ? 5 : 10);
    const n = s.weapon + (s.config.upgrades.cannon >= 5 && s.weapon >= 3 ? 1 : 0);
    for (let i = 0; i < n; i++)
      bullet(s, {
        x: s.x + (i - (n - 1) / 2) * 4,
        y: s.y - 13,
        vx: (i - (n - 1) / 2) * (s.weapon >= 3 ? 8 : 0),
        vy: -300,
        player: true,
        damage: 1,
        radius: 2,
        kind: "plasma",
        ttl: 100,
        pierce: s.weapon >= 5 ? 2 : s.weapon >= 4 ? 1 : 0,
        hit: []
      });
  }
  if (s.missile > 0 && s.frame >= s.missileFire) {
    s.missileFire = s.frame + 90;
    for (let i = 0; i < (s.missile >= 2 ? 4 : 2); i++)
      bullet(s, {
        x: s.x + (i % 2 ? 12 : -12),
        y: s.y,
        vx: i % 2 ? 80 : -80,
        vy: -180,
        player: true,
        damage: 8,
        radius: 2,
        kind: "missile",
        ttl: 180,
        pierce: 0,
        hit: []
      });
  }
  if (s.laser > 0) {
    for (const e of s.enemies)
      if (Math.abs(e.x - s.x) < e.radius + 5 && e.y < s.y)
        e.hp -= 0.6 * (1 + 0.04 * s.config.upgrades.cannon);
    if (s.boss && s.boss.transition <= s.frame && Math.abs(s.boss.x - s.x) < 40)
      s.boss.hp -= 1.5 * (s.boss.weak > s.frame ? 2 : 1);
    s.bullets = s.bullets.filter((b) => b.player || Math.abs(b.x - s.x) > 6);
  }
  for (const e of [...s.enemies]) {
    if (e.hp <= 0) {
      death(s, e);
      continue;
    }
    enemyUpdate(s, e);
    if (Math.hypot(e.x - s.x, e.y - s.y) < e.radius + 2) damage(s);
    if (l.objective === "escort" && e.y >= 300) {
      s.escortHp--;
      e.y = 360;
    }
  }
  s.enemies = s.enemies.filter(
    (e) => e.hp > 0 && e.y < 350 && e.y > -50 && s.frame - e.born < 1200
  );
  updateBullets(s);
  const supplyPeriod = l.stage === 10 ? 1200 : 1500;
  if (s.frame === 1200 || s.frame % supplyPeriod === 0) {
    const kind = s.frame === 1200 ? "plasma" : s.hp < s.maxHp ? "nano" : "plasma";
    if (!has(s, "dry") || kind === "nano")
      s.pickups.push({ x: 90, y: 100, kind, born: s.frame });
  }
  if (s.frame === Math.round(l.duration * 30)) {
    if (s.config.boosters.includes("magnet")) s.magnet = 900;
    if (s.config.boosters.includes("nano"))
      s.pickups.push({ x: 90, y: 160, kind: "nano", born: s.frame });
  }
  for (const p of s.pickups) {
    p.y = q(p.y + 0.4);
    const d2 = Math.hypot(p.x - s.x, p.y - s.y);
    if (s.magnet > 0 || p.kind === "star" && s.config.upgrades.magnet >= 5 || d2 < 16 * (1 + 0.05 * s.config.upgrades.magnet)) {
      p.x = q(p.x + (s.x - p.x) * 0.1);
      p.y = q(p.y + (s.y - p.y) * 0.1);
    }
    if (d2 < 10) {
      pickup(s, p.kind);
      p.born = -1e4;
    }
  }
  s.pickups = s.pickups.filter((p) => s.frame - p.born < 480 && p.y < 335);
  if (l.stage >= 4 && s.config.mode !== "rush" && s.frame - s.lastHazard > 900) {
    s.lastHazard = s.frame;
    const p = planet(s), x = 25 + random(s) * 130;
    if (p === 1) spawn(s, "meteor", x / 18, 1);
    if ([2, 3, 7].includes(p))
      hazard(s, p === 3 ? "ice" : "slow", x, 200, 32, 65, 180, 0);
    if ([4, 6, 8].includes(p))
      hazard(s, "beam", x, 160, p === 6 ? 8 : 20, 320, 45);
    if ([5, 10].includes(p)) hazard(s, "gravity", x, 190, 50, 50, 200, 0);
    if (p === 9) spawn(s, "prism", x / 18, 7);
  }
  s.hazards = s.hazards.filter((h) => h.end >= s.frame);
  s.effects = s.effects.filter((e) => s.frame - e.born < 24);
  if (s.frame - s.lastKill > 120) s.combo = 0;
  if (s.status !== "playing") return;
  if (l.objective === "escort" && s.escortHp <= 0) {
    s.status = "lost";
    return;
  }
  if (s.config.mode === "practice") return;
  if (s.config.mode === "endless" || s.config.mode === "rush") {
    if (s.frame >= MAX_FRAMES)
      s.status = s.config.mode === "endless" ? "won" : "lost";
    return;
  }
  if (l.objective !== "boss" && s.frame >= l.duration * 60)
    s.status = objectiveMet(s) ? "won" : "lost";
  if (l.objective === "boss" && s.frame >= l.duration * 60 + 900)
    s.status = "lost";
}
function resultFor(s) {
  const l = levelFor(s.config.level), won = s.status === "won", secondary = s.hits <= 1 && (l.objective !== "escort" || s.escortHp >= 10), finalScore = s.score + (won ? s.hp * 1e3 : 0);
  const prp = Math.round(
    Math.min(35, finalScore / l.parScore * 35) + Math.max(0, 25 - s.hits * 5) + Math.min(15, s.kills / Math.max(1, s.spawned) * 15) + Math.min(15, s.itemsCollected * 3 + s.collected * 1.5) + Math.min(10, l.duration * 60 / Math.max(1, s.frame) * 10)
  );
  const stars = won ? prp >= 85 && secondary ? 3 : prp >= 60 ? 2 : 1 : 0, bonus = Math.min(
    0.8,
    s.config.mutators.reduce((a, m) => a + MUTATORS[m].bonus, 0)
  );
  let credits = Math.floor(
    (60 + 20 * (l.planet - 1) + finalScore / 50) * (1 + (stars === 3 ? 0.4 : stars === 2 ? 0.2 : 0) + bonus) * (won ? 1 : 0.25)
  );
  if (s.config.mode === "practice" || s.config.mode === "daily" || s.config.mode === "weekly" || s.config.mode === "rush")
    credits = 0;
  if (s.config.mode === "endless")
    credits = Math.min(1200, Math.floor(finalScore / 100));
  if (s.config.mode === "ngplus") credits = Math.floor(credits * 1.5);
  return {
    level: l.id,
    mode: s.config.mode,
    won,
    score: finalScore,
    stars: s.config.mode === "practice" ? 0 : stars,
    prp,
    secondary,
    kills: s.kills,
    spawned: s.spawned,
    hits: s.hits,
    collected: s.collected,
    frames: s.frame,
    combo: s.maxCombo,
    credits
  };
}
function replaySimulation(config, entries, frames) {
  if (!Number.isInteger(frames) || frames < 0 || frames > MAX_FRAMES || entries.length > 12200)
    throw new Error("Replay qu\xE1 d\xE0i");
  let last = -1;
  for (const e of entries) {
    if (e.length !== 4 || !e.every(Number.isInteger) || e[0] < last || e[0] < 0 || e[0] > frames || e[1] < 6 || e[1] > 174 || e[2] < 24 || e[2] > 304 || e[3] < 0 || e[3] > 63)
      throw new Error("Replay kh\xF4ng h\u1EE3p l\u1EC7");
    last = e[0];
  }
  const s = createSimulation(config);
  let i = 0, input = { x: 90, y: 268, mask: 0 };
  while (s.frame < frames && s.status === "playing" || s.status === "revive" && i < entries.length) {
    while (i < entries.length && entries[i][0] === s.frame) {
      const e = entries[i++];
      input = { x: e[1], y: e[2], mask: e[3] };
      if (e[3] & 32) s.status = "lost";
      if (e[3] & 16 && s.status === "revive") {
        revive(s);
        s.replay = [];
      }
    }
    if (s.status !== "playing") break;
    step(s, input, false);
  }
  while (i < entries.length && entries[i][0] === s.frame) {
    if (entries[i++][3] & 32 && s.status !== "won") s.status = "lost";
  }
  s.replay = entries.map((e) => [...e]);
  return s;
}
function decodeReplay(text) {
  if (typeof text !== "string" || text.length > 1e5)
    throw new Error("Replay qu\xE1 d\xE0i");
  const raw = atob(text);
  if (raw.length % 6) throw new Error("Replay sai \u0111\u1ECBnh d\u1EA1ng");
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0)), view = new DataView(bytes.buffer), entries = [];
  for (let i = 0; i < bytes.length; i += 6)
    entries.push([
      view.getUint16(i),
      bytes[i + 2],
      view.getUint16(i + 3),
      bytes[i + 5]
    ]);
  return entries;
}

// supabase/functions/cosmic-verify/index.ts
var cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};
Deno.serve(async (req) => {
  const response = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST")
    return response({ error: "Method not allowed" }, 405);
  try {
    const token = req.headers.get("Authorization")?.replace(/^Bearer /, "");
    if (!token) return response({ error: "Sign in required" }, 401);
    if (Number(req.headers.get("content-length") || 0) > 12e4)
      return response({ error: "Request too large" }, 413);
    const text = await req.text();
    if (text.length > 12e4)
      return response({ error: "Request too large" }, 413);
    const body = JSON.parse(text);
    const client = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_ANON_KEY"),
      { auth: { persistSession: false } }
    );
    const {
      data: { user },
      error: authError
    } = await client.auth.getUser(token);
    if (authError || !user || user.is_anonymous || user.id !== body.expectedOwner)
      return response({ error: "Account changed" }, 401);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false } }
    );
    const { data: run, error } = await admin.from("cosmic_runs").select("*").eq("id", body.ticket).eq("owner_id", user.id).single();
    if (error || !run) return response({ error: "Invalid ticket" }, 403);
    if (run.finished_at) return response({ verified: true, score: run.score });
    if (run.pack_version !== 2 || Date.now() - Date.parse(run.started_at) > 864e5)
      return response({ error: "Ticket expired/version changed" }, 400);
    const entries = decodeReplay(body.replay), sim = replaySimulation(run.config, entries, body.frames);
    if (sim.frame !== body.frames || !["won", "lost"].includes(sim.status) || sim.frame < 1)
      return response({ error: "Incomplete replay" }, 400);
    const result = resultFor(sim);
    const { data: accepted, error: acceptError } = await admin.rpc(
      "cosmic_accept",
      {
        p_ticket: run.id,
        p_owner: user.id,
        p_frames: sim.frame,
        p_score: result.score,
        p_won: result.won,
        p_replay: body.replay
      }
    );
    if (acceptError) return response({ error: "Result/time rejected" }, 400);
    return response(accepted);
  } catch {
    return response({ error: "Invalid replay/request" }, 400);
  }
});
