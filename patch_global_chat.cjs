const fs = require('fs');
let code = fs.readFileSync('src/components/GlobalChat.tsx', 'utf-8');

code = code.replace(
  `                      <span className={\`text-[11px] font-bold \${isMe ? 'text-indigo-400' : 'text-slate-200'}\`}>
                        {msg.senderName}
                      </span>
                      {msg.senderLevel && (`,
  `                      <span className={\`text-[11px] font-bold \${isMe ? 'text-indigo-400' : 'text-slate-200'}\`}>
                        {msg.senderName}
                      </span>
                      {msg.senderTitle && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          {msg.senderTitle}
                        </span>
                      )}
                      {msg.senderLevel && (`
);

fs.writeFileSync('src/components/GlobalChat.tsx', code);
