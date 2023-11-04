import { marked } from 'marked';
import React, { useState } from 'react';

interface MarkdownFile {
  title: string;
  slug: string;
  content: string;
}

// ページコンポーネント
const HomePage = ({ markdownFiles }: { markdownFiles: MarkdownFile[] }) => {
  const [selectedSlug, setSelectedSlug] = useState(markdownFiles[0]?.slug);
  const selectedMarkdownFile = markdownFiles.find(file => file.slug === selectedSlug);

  return (
    <div>
      <h1>ドキュメント一覧</h1>
      <ul>
        {markdownFiles.map((file) => (
          <li key={file.slug} onClick={() => setSelectedSlug(file.slug)}>
            {file.title}
          </li>
        ))}
      </ul>
      <div dangerouslySetInnerHTML={{ __html: selectedMarkdownFile?.content ?? 'Content not found' }} />
    </div>
  );
};

// getStaticProps 関数
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');
  const docsDirectory = path.join(process.cwd(), 'docs');

  // 再帰的にディレクトリを読み込むためのヘルパー関数を getStaticProps 内に配置
  const getAllMarkdownFiles = (dirPath: string, arrayOfFiles: MarkdownFile[] = [], rootPath: string) => {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
        arrayOfFiles = getAllMarkdownFiles(path.join(dirPath, file), arrayOfFiles, rootPath);
      } else if (file.endsWith('.md')) {
        const fullPath = path.join(dirPath, file);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const titleMatch = fileContents.match(/^# (.*)\n/);
        const title = titleMatch ? titleMatch[1] : path.basename(file, '.md');
        const content = marked(fileContents);
        const slug = fullPath.replace(rootPath, '').replace(/^\/+/, '').replace(/\.md$/, '');
        arrayOfFiles.push({ title, slug, content });
      }
    });

    return arrayOfFiles;
  };

  const markdownFiles = getAllMarkdownFiles(docsDirectory, [], docsDirectory);

  return {
    props: {
      markdownFiles,
    },
  };
}

export default HomePage;
