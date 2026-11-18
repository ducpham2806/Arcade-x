import {ChatProvider} from '../../chat/ChatProvider';
import {ChatShell} from '../../chat/ChatShell';
import {GameWrapper} from '../../games/GameWrapper';
import {snakePreview} from './metadata';

export default function SnakePreviewGame({onExit}:{onExit:()=>void}){
 return <ChatProvider previewGame={snakePreview}>
  <GameWrapper gameMeta={snakePreview} onExit={onExit}/>
  <div className="platform-ui"><ChatShell/></div>
 </ChatProvider>;
}
