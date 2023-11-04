// pages/index.tsx
import { marked } from 'marked';
import React, { useState, useEffect } from 'react';

interface MarkdownFile {
  title: string;
  slug: string;
  content: string;
}

interface Category {
  [key: string]: MarkdownFile[];
}

// ページコンポーネント
const HomePage = ({ categories }: { categories: Category }) => {
  // 最初のカテゴリを取得してデフォルトで展開
  const firstCategoryName = Object.keys(categories)[0];
  const [selectedSlug, setSelectedSlug] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  useEffect(() => {
    const startedSlug = categories['apiguide']?.find(file => file.slug.endsWith('started'))?.slug;
    if (startedSlug) {
      setSelectedSlug(startedSlug);
      setOpenCategories(['apiguide']);
    }
  }, [categories]);
  const toggleCategory = (category: string) => {
    setOpenCategories(openCategories.includes(category)
      ? openCategories.filter(c => c !== category)
      : [...openCategories, category]);
  };

  // 選択されたマークダウンファイルを探す
  const selectedMarkdownFile = Object.values(categories)
    .flat()
    .find(file => file.slug === selectedSlug);

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ marginRight: '20px' }}>
        <h1>ドキュメント一覧</h1>
        {Object.entries(categories).map(([category, files]) => (
          <div key={category}>
            <button onClick={() => toggleCategory(category)}>
              {category}
            </button>
            {openCategories.includes(category) && (
              <ul>
                {files.map((file) => (
                  <li key={file.slug} onClick={() => setSelectedSlug(file.slug)}>
                    {file.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div>
        <h2>コンテンツ</h2>
        {/* 選択されたマークダウンファイルの内容を表示 */}
        <div dangerouslySetInnerHTML={{ __html: selectedMarkdownFile?.content ?? 'Content not found' }} />
      </div>
    </div>
  );
};

// getStaticProps 関数
export async function getStaticProps() {
  const path = require('path');
  const fs = require('fs');

  // ディレクトリのパスからカテゴリ名を取得する関数
  const getCategoryName = (dirPath: string, rootPath: string) => {
    const relativePath = path.relative(rootPath, dirPath);
    return relativePath.split(path.sep)[0];
  };

  // 再帰的にディレクトリを読み込むためのヘルパー関数
  const getAllMarkdownFiles = (dirPath: string, rootPath: string): MarkdownFile[] => {
    let filesInDirectory: MarkdownFile[] = [];
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      if (fs.statSync(fullPath).isDirectory()) {
        filesInDirectory = filesInDirectory.concat(getAllMarkdownFiles(fullPath, rootPath));
      } else if (item.endsWith('.md')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const titleMatch = fileContents.match(/^# (.*)\n/);
        const title = titleMatch ? titleMatch[1] : path.basename(item, '.md');
        const content = marked(fileContents);
        const slug = fullPath.replace(rootPath, '').replace(/^\/+/, '').replace(/\.md$/, '');
        filesInDirectory.push({ title, slug, content });
      }
    });

    return filesInDirectory;
  };

  const docsDirectory = path.join(process.cwd(), 'docs');
  const markdownFiles = getAllMarkdownFiles(docsDirectory, docsDirectory);

  // カテゴリとファイルのリストを作成
  const categories = markdownFiles.reduce((acc: Category, file) => {
    const category = getCategoryName(file.slug, '');
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {});

  return {
    props: {
      categories
    }
  };
}

export default HomePage;
