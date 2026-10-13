import React from "react";
import { Volume2 } from "lucide-react";
import { getWordDefinition } from "./definitions";
import { WordDialog } from "./WordDialog";
export function WordDefinitionModal({
  word,
  onClose,
}: {
  word: string | null;
  onClose: () => void;
}) {
  if (!word) return null;
  const def = getWordDefinition(word);
  return (
    <WordDialog title={word} onClose={onClose}>
      <button
        aria-label="Phát âm từ"
        onClick={() => {
          if ("speechSynthesis" in window) {
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(word.toLowerCase());
            u.lang = "en-US";
            speechSynthesis.speak(u);
          }
        }}
      >
        <Volume2 size={18} />
        Phát âm
      </button>
      {def.phonetic && <p>{def.phonetic}</p>}
      <h3>{def.partOfSpeech}</h3>
      <p>{def.meaningVi}</p>
      {def.meaningEn && <p>{def.meaningEn}</p>}
      {def.example && (
        <blockquote>
          {def.example}
          <br />
          {def.exampleVi}
        </blockquote>
      )}
      <p className="wc-muted">
        Nghĩa có sẵn hoạt động offline. Phát âm cần giọng tiếng Anh được cài
        trên thiết bị.
      </p>
    </WordDialog>
  );
}

