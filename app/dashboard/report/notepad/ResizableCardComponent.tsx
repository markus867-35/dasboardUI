import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';

// 1. Definisikan Komponen Tampilan Kartu
function CardComponent({ node, updateAttributes }: NodeViewProps) {
  const [width, setWidth] = useState(node.attrs.width || '280px');
  const [height, setHeight] = useState(node.attrs.height || '130px');

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = parseInt(width, 10) || 280;
    const startHeight = parseInt(height, 10) || 130;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(150, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(80, startHeight + (moveEvent.clientY - startY));
      setWidth(`${newWidth}px`);
      setHeight(`${newHeight}px`);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      updateAttributes({ width: `${width}`, height: `${height}` });
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper className="inline-block relative my-2 mr-3 group cursor-default select-none align-middle">
      <div 
        style={{ width, height }} 
        className="relative bg-blue-600 text-white p-4 rounded-xl shadow-md flex flex-col justify-between transition-all"
      >
        <div>
          <p className="text-sm font-semibold">{node.attrs.title || 'Judul Kartu'}</p>
          <p className="text-xs opacity-80 mt-1">Lihat Detail</p>
        </div>

        {/* Kotak Titik Pengatur Ukuran */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-300 pointer-events-none rounded-xl transition-all">
          <div 
            onMouseDown={handleResizeStart}
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-se-resize pointer-events-auto shadow"
            title="Tarik untuk mengubah ukuran"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

// 2. Buat dan Export Ekstensi Tiptap-nya dari sini
export const CustomResizableCard = Node.create({
  name: 'resizableCard',
  group: 'inline',
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      title: { default: 'Permintaan Deposit' },
      width: { default: '280px' },
      height: { default: '130px' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="resizable-card"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'resizable-card' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CardComponent);
  },
});