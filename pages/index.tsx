import fs from 'fs';
import path from 'path';
import React from 'react';

// マークダウンファイルの型を定義
interface MarkdownFile {
  title: string;
  slug: string;
}

// ページコンポーネント
const HomePage = ({ markdownFiles }: { markdownFiles: MarkdownFile[] }) => {
  return (
    <div>
      <h1>ドキュメント一覧</h1>
      <ul>
        {markdownFiles.map((file) => (
          <li key={file.slug}>{file.title}</li>
        ))}
      </ul>
    </div>
  );
};

// getStaticProps 関数
export async function getStaticProps() {
  const docsDirectory = path.join(process.cwd(), 'docs');
  let filenames;
  try {
    filenames = fs.readdirSync(docsDirectory);
  } catch (error) {
    console.error('Error reading the docs directory:', error);
    return { props: { markdownFiles: [] } }; // エラーがあった場合は空の配列を返す
  }

  const markdownFiles = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '');
      const fullPath = path.join(docsDirectory, filename);
      let fileContents;
      try {
        fileContents = fs.readFileSync(fullPath, 'utf8');
      } catch (error) {
        console.error(`Error reading markdown file ${filename}:`, error);
        return null;
      }
      // マークダウンのタイトルを抽出（ここでは `##` 見出しを想定）
      const titleMatch = fileContents.match(/^## (.*)\n/);
      const title = titleMatch ? titleMatch[1] : slug;
      return { title, slug };
    })
    .filter(Boolean); // null値をフィルタリングする

  return {
    props: {
      markdownFiles,
    },
  };
}

export default HomePage;
