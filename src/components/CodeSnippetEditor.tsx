import { useEffect, useRef, useCallback } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState, Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { CodeTheme } from '@/lib/codeThemes';
import { CodeLanguage } from '@/lib/codeLanguages';

interface CodeSnippetEditorProps {
  code: string;
  onChange: (code: string) => void;
  language: CodeLanguage;
  theme: CodeTheme;
  className?: string;
}

export function CodeSnippetEditor({
  code,
  onChange,
  language,
  theme,
  className,
}: CodeSnippetEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const getExtensions = useCallback((): Extension[] => {
    return [
      lineNumbers(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      language.extension,
      theme.extension,
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
        },
        '.cm-scroller': {
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '16px 0',
        },
        '.cm-gutters': {
          backgroundColor: 'transparent',
          border: 'none',
        },
      }),
    ];
  }, [language, theme, onChange]);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: code,
      extensions: getExtensions(),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;

    const currentDoc = viewRef.current.state.doc.toString();
    if (currentDoc !== code) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: code,
        },
      });
    }
  }, [code]);

  useEffect(() => {
    if (!viewRef.current || !editorRef.current) return;

    const currentDoc = viewRef.current.state.doc.toString();
    viewRef.current.destroy();

    const state = EditorState.create({
      doc: currentDoc,
      extensions: getExtensions(),
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;
  }, [language, theme, getExtensions]);

  return (
    <div
      ref={editorRef}
      className={className}
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: theme.background,
      }}
    />
  );
}
