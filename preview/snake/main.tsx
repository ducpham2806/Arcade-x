import {StrictMode} from 'react';import {createRoot} from 'react-dom/client';
import {AuthProvider} from '../../src/context/AuthContext';
import {LauncherProvider} from '../../src/launcher/LauncherContext';
import {PlayerProvider} from '../../src/context/PlayerContext';
import {InventoryProvider} from '../../src/context/InventoryContext';
import {GameProvider} from '../../src/context/GameContext';
import {SnakePreviewPage} from '../../src/preview/snake/SnakePreviewPage';
import '../../src/index.css';import '../../src/launcher/launcher.css';import '../../src/launcher/platform-theme.css';
createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><LauncherProvider><PlayerProvider><InventoryProvider><GameProvider><SnakePreviewPage/></GameProvider></InventoryProvider></PlayerProvider></LauncherProvider></AuthProvider></StrictMode>);
