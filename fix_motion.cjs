const fs = require('fs');
let code = fs.readFileSync('src/games/blocker/index.tsx', 'utf-8');

code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'motion/react';");

fs.writeFileSync('src/games/blocker/index.tsx', code);
