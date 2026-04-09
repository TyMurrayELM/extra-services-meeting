import React, { useState, useEffect, useRef } from 'react';

// Branch icon imports for rich text editor
import seIcon from '../assets/icons/se.png';
import nIcon from '../assets/icons/n.png';
import swIcon from '../assets/icons/sw.png';
const lvIcon = new URL('../assets/icons/lv.png', import.meta.url).href;

// Create branch icons mapping
export const branchIcons = {
  'SE': seIcon,
  'N': nIcon,
  'SW': swIcon,
  'LV': lvIcon
};

// Escape HTML entities to prevent XSS when rendering user input via dangerouslySetInnerHTML
const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Custom hook for auto-resizing textareas
const useAutoResizeTextarea = (value) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 320)}px`;
    }
  }, [value]);

  return textareaRef;
};

// Enhanced markdown parser with icon support
const parseMarkdown = (text) => {
  if (!text) return '';

  // First, handle bullet points and escape HTML on each line
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const escaped = escapeHtml(line);
    if (escaped.startsWith('- ')) {
      return '• ' + escaped.substring(2);
    }
    return escaped;
  });

  // Join lines back and process markdown syntax (operates on already-escaped text)
  let html = processedLines.join('\n')
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Process icons - replace :ICON: or [ICON] syntax with img tags
  Object.entries(branchIcons).forEach(([key, iconSrc]) => {
    const colonPattern = new RegExp(`:${key}:`, 'g');
    const bracketPattern = new RegExp(`\\[${key}\\]`, 'g');

    html = html
      .replace(colonPattern, `<img src="${iconSrc}" alt="${key}" style="height: 18px; width: auto; display: inline-block; vertical-align: middle; margin: 0 2px;" />`)
      .replace(bracketPattern, `<img src="${iconSrc}" alt="${key}" style="height: 18px; width: auto; display: inline-block; vertical-align: middle; margin: 0 2px;" />`);
  });

  // Line breaks (do this LAST)
  html = html.replace(/\n/g, '<br />');

  return html;
};

// Enhanced Rich Text Actions component with icon support
const RichTextActions = ({ value, onChange, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const textareaRef = useAutoResizeTextarea(localValue);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleSave = () => {
    onChange({ target: { value: localValue } });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(value || '');
    setIsEditing(false);
  };

  const insertFormatting = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localValue;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) +
      prefix + selectedText + suffix +
      text.substring(end);

    setLocalValue(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? end + prefix.length + suffix.length : start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertIcon = (iconKey) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = localValue;
    const iconSyntax = `:${iconKey}:`;

    const newText =
      text.substring(0, start) +
      iconSyntax +
      text.substring(end);

    setLocalValue(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + iconSyntax.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  if (!isEditing) {
    return (
      <div
        className="w-full px-3 py-2 bg-white border border-black rounded-md min-h-[5rem] max-h-[20rem] overflow-y-auto cursor-pointer hover:bg-gray-50"
        onClick={() => setIsEditing(true)}
      >
        {localValue ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(localValue) }}
          />
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex gap-1 mb-1 p-1 bg-gray-100 rounded-t-md border border-b-0 border-black">
        <button
          type="button"
          onClick={() => insertFormatting('**')}
          className="px-2 py-1 text-sm font-bold hover:bg-gray-200 rounded"
          title="Bold (** text **)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*')}
          className="px-2 py-1 text-sm italic hover:bg-gray-200 rounded"
          title="Italic (* text *)"
        >
          I
        </button>
        <div className="border-l border-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => insertFormatting('- ', '')}
          className="px-2 py-1 text-sm hover:bg-gray-200 rounded"
          title="Bullet point"
        >
          • List
        </button>
        <div className="border-l border-gray-300 mx-1" />

        {/* Icon buttons */}
        {Object.entries(branchIcons).map(([key, iconSrc]) => (
          <button
            key={key}
            type="button"
            onClick={() => insertIcon(key)}
            className="px-1 py-1 hover:bg-gray-200 rounded flex items-center justify-center"
            title={`Insert ${key} branch icon`}
          >
            <img
              src={iconSrc}
              alt={key}
              className="h-4 w-4"
            />
          </button>
        ))}

        <div className="flex-1" />
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 text-sm bg-green-500 text-white hover:bg-green-600 rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded"
        >
          Cancel
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-black hover:bg-gray-50 focus:bg-white focus:border rounded-b-md focus:outline-none resize-y"
        style={{
          minHeight: '5rem',
          maxHeight: '20rem',
          overflowY: 'auto'
        }}
      />
      <div className="text-xs text-gray-500 mt-1">
        Tip: Use **text** for bold, *text* for italic, - for bullet points, :SE: or [SE] for branch icons
      </div>
    </div>
  );
};

export default RichTextActions;
