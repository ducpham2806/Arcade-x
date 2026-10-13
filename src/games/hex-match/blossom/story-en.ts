import { MID_STORIES } from "./story-scenes";
export const INTRO_EN = [
  [
    [
      "A silent garden",
      "Mia",
      "Yesterday this place was full of color. Why are all the flowers bowing their heads?",
    ],
    [
      "Bibi’s promise",
      "Bibi",
      "Gray Dust is covering the Tree of Life. Every flower we awaken will help us find a seed.",
    ],
    [
      "The first step",
      "Mia",
      "Let’s begin with this little flower bed. Bibi, will you help me bring the garden back?",
    ],
  ],
  [
    [
      "The missing fruit",
      "Mia",
      "The branches are heavy with fruit, but someone has taken their colors.",
    ],
    [
      "Wings over the orchard",
      "Bibi",
      "The greedy Crow is keeping the Orange Seed. Clear the weeds to reach its nest.",
    ],
    [
      "A harvest to share",
      "Mia",
      "Ripe fruit belongs to everyone. We will bring its warm orange color back.",
    ],
  ],
  [
    [
      "The still windmill",
      "Mia",
      "The wind is blowing. Why is the meadow so quiet?",
    ],
    [
      "A little friend",
      "Pip",
      "Gray Dust is caught in the sails. I know a path between the rocks!",
    ],
    [
      "Let the wind return",
      "Bibi",
      "Free the seeds. When the windmill turns again, the Yellow Seed will awaken.",
    ],
  ],
  [
    [
      "A beach without a song",
      "Mia",
      "The waves still reach the shore, but the seaside flowers have lost their colors.",
    ],
    [
      "A secret in a claw",
      "Bibi",
      "The giant Crab has the Ocean Seed. Vines are covering the sand.",
    ],
    [
      "A gentler sky",
      "Mia",
      "Perhaps Gray Dust grows from sadness. Let’s bring a little joy back.",
    ],
  ],
  [
    [
      "Lights under the mushrooms",
      "Mia",
      "Little sparks of color are calling us into the forest.",
    ],
    [
      "Rescue Bunny",
      "Bunny",
      "My friends are trapped in cocoons. Please help them find their way home!",
    ],
    [
      "Nobody left behind",
      "Bibi",
      "Rescue every friend, then find the Purple Seed among the mushrooms.",
    ],
  ],
  [
    [
      "A sea of sand",
      "Mia",
      "The sand stretches to the horizon. Are we going the right way?",
    ],
    [
      "A golden guide",
      "Bibi",
      "The cactus flowers will guide us. Watch out for the Scorpion’s timed bombs.",
    ],
    [
      "A determined flower",
      "Mia",
      "Flowers can bloom even in a desert. The Earth Orange Seed is waiting for us.",
    ],
  ],
  [
    [
      "Memories in the ice",
      "Mia",
      "Everything is frozen, even the flowers just beginning to bloom.",
    ],
    [
      "The gardener she once was",
      "Bibi",
      "The Queen once cared for this place. Afraid of losing its beauty, she trapped it in ice.",
    ],
    [
      "Life needs change",
      "Mia",
      "Flowers need to grow and make room for a new season. Let’s free the Ice Seed.",
    ],
  ],
  [
    [
      "A misty lake",
      "Mia",
      "I can hear lotus flowers calling beneath the fog.",
    ],
    [
      "Owl’s watchful eyes",
      "Owl",
      "The mist is hiding old memories. I will help you find what was forgotten.",
    ],
    [
      "Welcome a new day",
      "Bibi",
      "The Lotus Seed carries the colors of sunset. Yesterday and tomorrow both deserve our love.",
    ],
  ],
  [
    [
      "The last little lights",
      "Mia",
      "Fireflies are keeping a little light alive in the dark valley.",
    ],
    [
      "Silk holding back a season",
      "Bibi",
      "The Night Spider keeps everything in cocoons. It is afraid of change, too.",
    ],
    [
      "Open a path for light",
      "Mia",
      "We will open every cocoon. The Firefly Seed will guide us to the palace.",
    ],
  ],
  [
    [
      "At the golden gate",
      "Turtle",
      "You have come a long way. Every seed carries something the garden has learned.",
    ],
    [
      "Words for the Queen",
      "Mia",
      "We have not come to take your garden away. We want it to live.",
    ],
    [
      "When dust becomes pollen",
      "Bibi",
      "Bring all ten seeds to the Tree of Life. A new season begins with our courage.",
    ],
  ],
];
const MID_LINES = [
  [
    "The flowers are lifting their heads!",
    "The Caterpillar still has the Pink Seed. Practice making Bees before you meet it.",
    "I will look at the whole board and choose a group that opens more flowers.",
  ],
  [
    "The weeds are thinning, but the branches still need their orange color.",
    "The Crow hides its seed in the branches. Blast beside weeds to make a path.",
    "We will share the fruit with the whole garden.",
  ],
  [
    "I can hear the sails moving again!",
    "Clear near the seed first. Breaking the bottom too early can remove a useful group.",
    "Every little step brings the windmill closer to a new season.",
  ],
  [
    "The sea is singing, but vines are holding the flowers back.",
    "Frozen flowers need repeated nearby blasts. Keep an eye on the timer.",
    "I will choose a path before tapping, so I do not waste time.",
  ],
  [
    "I have found my friend’s footprints!",
    "Portal A sends pieces to B when B is empty. Open the exit first.",
    "We will count every rescued friend before leaving the forest.",
  ],
  [
    "A cactus flower is blooming in the hot sand.",
    "Bombs count valid turns. Deal with the lowest countdown first.",
    "We do not have to rush. Looking carefully is also progress.",
  ],
  [
    "The ice holds the memory of someone who cared for this garden.",
    "The Queen feared flowers fading, so she tried to keep everything still.",
    "Flowers can fade and bloom again. We will show her that.",
  ],
  [
    "Fog can hide colors, but it cannot erase them.",
    "Clear a patch of mist, then look for the groups underneath.",
    "We do not need to forget yesterday to welcome tomorrow.",
  ],
  [
    "Fireflies are guiding us past each cocoon.",
    "Keep groups just below the seeds. Vertical Bees and Suns can open a whole path.",
    "Rescue the last lights, then we can reach the palace.",
  ],
  [
    "You have brought back nine seeds and made many friends.",
    "I want the Queen to know that the garden still needs her.",
    "Use everything we have learned. The final seed is waiting ahead.",
  ],
];
export const MID_EN = MID_LINES.map((lines, i) =>
  lines.map((line, j) => [
    ["A little progress", "A useful clue", "Together we continue"][j],
    ({ Thỏ: "Bunny", Cú: "Owl", Rùa: "Turtle" } as Record<string, string>)[
      MID_STORIES[i][j][1]
    ] || MID_STORIES[i][j][1],
    line,
  ]),
);
const SEEDS = [
  "Pink",
  "Orange",
  "Yellow",
  "Ocean",
  "Purple",
  "Earth Orange",
  "Ice",
  "Lotus",
  "Firefly",
];
const NAMES = [
  "Caterpillar",
  "Crow",
  "Windmill",
  "Crab",
  "Mushroom",
  "Scorpion",
  "Yeti",
  "Dragon",
  "Spider",
];
const REPLIES = [
  "I had forgotten the scent of new leaves.",
  "You saved some fruit for me, too?",
  "The wind is turning the sails again.",
  "The waves sound happy again.",
  "All the little friends have found their way home.",
  "Even sand can help a flower grow.",
  "I do not need to keep everything frozen.",
  "The lake reflects the sky again.",
  "I will weave a bridge instead of more cocoons.",
];
export const VICTORY_EN = SEEDS.map((seed, i) => [
  ["A friend returns", NAMES[i], REPLIES[i]],
  [
    `The ${seed} Seed awakens`,
    "Bibi",
    `We have received the ${seed} Seed. It carries a memory that will help the Tree of Life grow.`,
  ],
  [
    "Bring a new season home",
    "Mia",
    "Thank you for helping us. Let’s rest a little, then travel to the next land together.",
  ],
]);
VICTORY_EN.push([
  [
    "Gray Dust fades",
    "Queen",
    "I was only afraid that one day the garden would no longer need me.",
  ],
  [
    "The garden still needs you",
    "Mia",
    "Flowers will change, but your love for them is still here. Come and plant a new season with us.",
  ],
  [
    "The Tree of Life blooms",
    "Bibi",
    "All ten seeds have returned. Gray Dust becomes pollen, and the garden begins a new story!",
  ],
]);
