import { useState, useRef, useEffect, useCallback } from 'react';

interface MenuItem {
  label: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  separator?: boolean;
}

interface MenuDef {
  label: string;
  items: MenuItem[];
}

interface MenuBarProps {
  menus: MenuDef[];
}

function MenuDropdown({ menu, isOpen, onClose }: { menu: MenuDef; isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="menu-dropdown">
      {menu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className="menu-separator" />
        ) : (
          <button
            key={i}
            className={`menu-item ${item.disabled ? 'disabled' : ''}`}
            disabled={item.disabled}
            onClick={() => {
              if (item.action && !item.disabled) {
                item.action();
                onClose();
              }
            }}
          >
            <span className="menu-item-label">{item.label}</span>
            {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
          </button>
        ),
      )}
    </div>
  );
}

export function MenuBar({ menus }: MenuBarProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpenIndex(null), []);

  // Close on click outside
  useEffect(() => {
    if (openIndex === null) return;

    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openIndex, close]);

  return (
    <div ref={barRef} className="editor-menu">
      {menus.map((menu, i) => (
        <div key={i} className="menu-wrapper">
          <button
            className={`menu-btn ${openIndex === i ? 'active' : ''}`}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            onMouseEnter={() => {
              if (openIndex !== null) setOpenIndex(i);
            }}
          >
            {menu.label}
          </button>
          <MenuDropdown menu={menu} isOpen={openIndex === i} onClose={close} />
        </div>
      ))}
    </div>
  );
}
