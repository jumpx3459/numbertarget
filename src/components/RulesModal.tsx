import React from 'react';
import { HelpCircle, X, Keyboard } from 'lucide-react';
import { Language } from '../types';
import { sound } from '../utils/audio';
import { useModalA11y } from '../hooks/useModalA11y';
import { getTranslation } from '../utils/i18n';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  language?: Language;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, theme, language = 'ko' }) => {
  const isDark = theme === 'dark';
  const t = getTranslation(language);

  const panelRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        tabIndex={-1}
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 border shadow-2xl relative transition-all ${
          isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/60 sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 id="rules-modal-title" className="font-display font-extrabold text-lg">{t.rulesModal.title}</h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {t.rulesModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playCardDeselect();
              onClose();
            }}
            aria-label={language === 'ko' ? '닫기' : 'Close'}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4 text-xs">
          {/* Objective */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <h4 className="font-bold text-sm text-emerald-400 mb-1 flex items-center gap-1.5">
              <span>🎯 {t.rulesModal.overviewTitle}</span>
            </h4>
            <p className="leading-relaxed text-zinc-300">
              {t.rulesModal.overviewText}
            </p>
          </div>

          {/* Core rules */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <h4 className="font-bold text-sm text-fuchsia-400 mb-2 flex items-center gap-1.5">
              <span>⚡ {t.rulesModal.coreRulesTitle}</span>
            </h4>
            <div className="space-y-1.5 text-zinc-300">
              {t.rulesModal.coreRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] leading-relaxed text-zinc-300">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}
          >
            <h4 className="font-bold text-sm text-amber-400 mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              <span>⌨️ {t.rulesModal.shortcutsTitle}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {t.rulesModal.shortcutsList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-400">{item.label}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-teal-300 font-mono-num font-bold">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playCardDeselect();
            onClose();
          }}
          className="w-full mt-4 py-3 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-md shadow-teal-600/30"
        >
          {t.rulesModal.close}
        </button>
      </div>
    </div>
  );
};

