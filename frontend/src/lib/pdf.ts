import React from 'react';
import ReactPDF, { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (using system fonts for now)
Font.register({
  family: 'NotoSansJP',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/notosansjp/v52/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFJMj75vN.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'NotoSansJP',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 10,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  listItem: {
    marginLeft: 16,
    marginBottom: 4,
  },
  codeBlock: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    marginBottom: 10,
    fontSize: 10,
  },
  inlineCode: {
    backgroundColor: '#f4f4f4',
    padding: 2,
    fontSize: 10,
  },
  metadata: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
  },
});

interface DocumentPDFProps {
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Simple markdown to PDF elements converter
function parseMarkdownToPDF(content: string): React.ReactElement[] {
  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      listItems.forEach((item, i) => {
        elements.push(
          React.createElement(Text, { key: `list-${elements.length}-${i}`, style: styles.listItem }, `• ${item}`)
        );
      });
      listItems = [];
    }
  };

  const flushCodeBlock = () => {
    if (codeBlockContent.length > 0) {
      elements.push(
        React.createElement(View, { key: `code-${elements.length}`, style: styles.codeBlock },
          React.createElement(Text, {}, codeBlockContent.join('\n'))
        )
      );
      codeBlockContent = [];
    }
  };

  lines.forEach((line, index) => {
    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        React.createElement(Text, { key: `h1-${index}`, style: styles.heading1 }, line.substring(2))
      );
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        React.createElement(Text, { key: `h2-${index}`, style: styles.heading2 }, line.substring(3))
      );
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        React.createElement(Text, { key: `h3-${index}`, style: styles.heading3 }, line.substring(4))
      );
      return;
    }

    // List items
    if (line.match(/^[\-\*]\s/)) {
      listItems.push(line.substring(2));
      return;
    }
    if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^\d+\.\s(.*)$/);
      if (match) {
        listItems.push(match[1]);
      }
      return;
    }

    // Regular paragraph
    flushList();
    // Simple text processing (remove markdown syntax for bold/italic)
    const cleanText = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1');

    elements.push(
      React.createElement(Text, { key: `p-${index}`, style: styles.paragraph }, cleanText)
    );
  });

  flushList();
  flushCodeBlock();

  return elements;
}

export function DocumentPDF({ title, content, createdAt, updatedAt }: DocumentPDFProps): React.ReactElement {
  const contentElements = parseMarkdownToPDF(content);

  return React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page },
      React.createElement(Text, { style: styles.title }, title),
      (createdAt || updatedAt) && React.createElement(View, { style: styles.metadata },
        updatedAt && React.createElement(Text, {}, `最終更新: ${new Date(updatedAt).toLocaleDateString('ja-JP')}`),
        createdAt && React.createElement(Text, {}, `作成日: ${new Date(createdAt).toLocaleDateString('ja-JP')}`)
      ),
      React.createElement(View, { style: styles.content }, ...contentElements)
    )
  );
}

export async function generatePDF(props: DocumentPDFProps): Promise<Buffer> {
  const doc = DocumentPDF(props);
  const pdfStream = await ReactPDF.renderToStream(doc);

  const chunks: Uint8Array[] = [];
  for await (const chunk of pdfStream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
