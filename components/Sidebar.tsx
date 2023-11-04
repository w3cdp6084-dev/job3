// components/Sidebar.tsx
import React, { useState } from 'react';

interface SidebarItem {
  title: string;
  slug: string;
  items?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  onSelect: (slug: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, onSelect }) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (slug: string) => {
    setOpenCategories(openCategories.includes(slug)
      ? openCategories.filter(openSlug => openSlug !== slug)
      : [...openCategories, slug]);
  };

  const isCategoryOpen = (slug: string) => {
    return openCategories.includes(slug);
  };

  const renderItems = (items: SidebarItem[], nested: boolean = false) => {
    return items.map(item => (
      <React.Fragment key={item.slug}>
        <li className={nested ? 'nested' : ''}>
          {item.items && item.items.length > 0 ? (
            <div onClick={() => toggleCategory(item.slug)}>
              {item.title}
            </div>
          ) : (
            <button onClick={() => onSelect(item.slug)}>
              {item.title}
            </button>
          )}
        </li>
        {item.items && item.items.length > 0 && isCategoryOpen(item.slug) && (
          <ul>{renderItems(item.items, true)}</ul>
        )}
      </React.Fragment>
    ));
  };

  return (
    <nav>
      <ul>{renderItems(items)}</ul>
    </nav>
  );
};

export default Sidebar;
