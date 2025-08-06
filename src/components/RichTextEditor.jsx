"use client";
import React, { useState, useEffect } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const [editorValue, setEditorValue] = useState(value || '');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setEditorValue(value || '');
  }, [value]);

  const handleEditorChange = (e) => {
    const val = e.target.value;
    setEditorValue(val);
    onChange(val);
  };

  const insertVideo = () => {
    if (!videoUrl) return;

    let embedCode = '';

    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);

    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      embedCode = `\n\n<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 20px 0;">
  <iframe
    src="https://www.youtube.com/embed/${videoId}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0"
    allowfullscreen>
  </iframe>
</div>\n\n`;
    } else {
      // For other video URLs, create a basic video element
      embedCode = `\n\n<div style="margin: 20px 0;">
  <video controls style="width: 100%; max-width: 100%;">
    <source src="${videoUrl}" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>\n\n`;
    }

    // Insert the video code at the end of current content
    const newContent = editorValue + embedCode;
    setEditorValue(newContent);
    onChange(newContent);

    setVideoUrl('');
    setShowVideoModal(false);
  };

  const insertFormatting = (before, after = '') => {
    const textarea = document.getElementById('rich-text-area');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorValue.substring(start, end);
    const newText = editorValue.substring(0, start) + before + selectedText + after + editorValue.substring(end);
    setEditorValue(newText);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            onClick={() => insertFormatting('# ', '')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            title="Header 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ', '')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            title="Header 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-bold"
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('- ', '')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            title="List"
          >
            List
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-mono"
            title="Code"
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setShowVideoModal(true)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            title="Insert Video"
          >
            📹 Video
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1 rounded text-sm ${showPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            title="Toggle Preview"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="border rounded-lg overflow-hidden bg-white">
        {showPreview ? (
          <div
            className="p-4 min-h-[400px] prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: editorValue
                .replace(/\n/g, '<br>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^- (.*$)/gm, '<li>$1</li>')
            }}
          />
        ) : (
          <textarea
            id="rich-text-area"
            value={editorValue}
            onChange={handleEditorChange}
            placeholder={placeholder}
            className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0 min-h-[400px] bg-white text-black"
            style={{ fontSize: '14px', lineHeight: '1.6' }}
          />
        )}
      </div>

      {/* Video Insert Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Insert Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter YouTube URL or video file URL"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports YouTube URLs and direct video file links
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setVideoUrl('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={insertVideo}
                  disabled={!videoUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Insert Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.5em 0;
        }

        .prose strong {
          font-weight: bold;
        }

        .prose em {
          font-style: italic;
        }

        .prose code {
          background-color: #f1f5f9;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        .prose li {
          margin-left: 20px;
          list-style-type: disc;
        }

        .video-container iframe,
        .video-container video {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
