'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useSearchUsers } from '@/hooks/use-users';
import { useAddComment } from '@/hooks/use-activities';
import type { OpenProjectUser } from '@/types/openproject';
import { cn } from '@/lib/utils';

interface CommentEditorProps {
  workPackageId: number;
  projectId: number;
  onCommentAdded?: () => void;
}

// Suggestion dropdown component
function MentionList({
  items,
  command,
  selectedIndex,
}: {
  items: OpenProjectUser[];
  command: (item: { id: string; label: string }) => void;
  selectedIndex: number;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
      {items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-slate-500">Không tìm thấy</div>
      ) : (
        items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => command({ id: item.id.toString(), label: item.name })}
            className={cn(
              'w-full text-left px-3 py-2 text-sm hover:bg-slate-100 flex items-center gap-2',
              index === selectedIndex && 'bg-blue-50 text-blue-700'
            )}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs flex items-center justify-center">
              {item.name[0]}
            </div>
            <span>{item.name}</span>
          </button>
        ))
      )}
    </div>
  );
}

export function CommentEditor({ workPackageId, projectId, onCommentAdded }: CommentEditorProps) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandRef = useRef<((item: { id: string; label: string }) => void) | null>(null);

  const { data: suggestions = [] } = useSearchUsers(mentionQuery, showSuggestions);
  const addComment = useAddComment();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention text-blue-600 bg-blue-50 px-1 rounded',
        },
        suggestion: {
          char: '@',
          command: ({ editor, range, props }) => {
            editor
              .chain()
              .focus()
              .insertContentAt(range, [
                {
                  type: 'mention',
                  attrs: props,
                },
                { type: 'text', text: ' ' },
              ])
              .run();
          },
          items: ({ query }) => {
            setMentionQuery(query);
            setShowSuggestions(true);
            setSelectedIndex(0);
            return [];
          },
          render: () => {
            return {
              onStart: (props) => {
                commandRef.current = props.command;
                setShowSuggestions(true);
              },
              onUpdate: (props) => {
                commandRef.current = props.command;
              },
              onKeyDown: (props) => {
                if (props.event.key === 'ArrowUp') {
                  setSelectedIndex((prev) => Math.max(0, prev - 1));
                  return true;
                }
                if (props.event.key === 'ArrowDown') {
                  setSelectedIndex((prev) => Math.min(suggestions.length - 1, prev + 1));
                  return true;
                }
                if (props.event.key === 'Enter') {
                  if (suggestions[selectedIndex]) {
                    commandRef.current?.({
                      id: suggestions[selectedIndex].id.toString(),
                      label: suggestions[selectedIndex].name,
                    });
                  }
                  return true;
                }
                if (props.event.key === 'Escape') {
                  setShowSuggestions(false);
                  return true;
                }
                return false;
              },
              onExit: () => {
                setShowSuggestions(false);
                setMentionQuery('');
              },
            };
          },
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[60px] px-3 py-2',
      },
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!editor || editor.isEmpty) return;

    const content = editor.getHTML();

    try {
      await addComment.mutateAsync({
        workPackageId,
        comment: content,
      });
      editor.commands.clearContent();
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }, [editor, workPackageId, addComment, onCommentAdded]);

  // Handle Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  return (
    <div className="relative">
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <EditorContent editor={editor} />

        {/* Suggestion dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 bottom-full mb-1 z-50">
            <MentionList
              items={suggestions}
              command={(item) => {
                commandRef.current?.(item);
                setShowSuggestions(false);
              }}
              selectedIndex={selectedIndex}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">
          Gõ @ để mention người dùng • Ctrl+Enter để gửi
        </span>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={addComment.isPending || !editor || editor.isEmpty}
        >
          {addComment.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="ml-2">Gửi</span>
        </Button>
      </div>
    </div>
  );
}
