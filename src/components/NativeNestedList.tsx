import { useState } from 'react'
import { Folder, FolderOpen, File, ChevronRight } from 'lucide-react'
import './NativeNestedList.css'

export interface ListItem {
  id: string
  label: string
  icon?: React.ReactNode
  children?: ListItem[]
  href?: string
  onClick?: (e: React.MouseEvent) => void
  path?: string
  type?: 'tree' | 'blob'
}

interface NativeNestedListProps {
  items: ListItem[]
  onFileSelect?: (path: string) => void
  selectedFilePath?: string
  level?: number
}

export function NativeNestedList({
  items,
  onFileSelect,
  selectedFilePath,
  level = 0,
}: NativeNestedListProps) {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleItemClick = (e: React.MouseEvent, item: ListItem) => {
    if (item.onClick) {
      item.onClick(e)
      return
    }
    if (item.children && item.children.length > 0) {
      e.stopPropagation()
      toggleExpand(item.id)
    } else if (item.path && onFileSelect) {
      e.stopPropagation()
      onFileSelect(item.path)
    }
  }

  return (
    <ul className="nested-list" style={{ paddingLeft: level > 0 ? '16px' : '0' }}>
      {items.map((item) => {
        const isExpanded = expandedNodes[item.id]
        const isSelected = item.path === selectedFilePath
        const hasChildren = item.children && item.children.length > 0

        const renderIcon = () => {
          if (item.icon) return item.icon
          if (hasChildren) return isExpanded ? <FolderOpen className="nested-list__icon nested-list__icon--folder-open" /> : <Folder className="nested-list__icon nested-list__icon--folder" />
          return <File className="nested-list__icon nested-list__icon--file" />
        }

        return (
          <li key={item.id} className="nested-list__item">
            <div
              className={`nested-list__row ${isSelected ? 'nested-list__row--selected' : ''} ${hasChildren ? 'nested-list__row--folder' : 'nested-list__row--file'}`}
              onClick={(e) => handleItemClick(e, item)}
              role="button"
              tabIndex={0}
            >
              {hasChildren && (
                <span className={`nested-list__arrow ${isExpanded ? 'nested-list__arrow--expanded' : ''}`}>
                  <ChevronRight className="nested-list__arrow-icon" />
                </span>
              )}

              <span className="nested-list__icon-wrap">{renderIcon()}</span>
              <span className="nested-list__label">{item.label}</span>
            </div>

            {hasChildren && isExpanded && (
              <NativeNestedList
                items={item.children!}
                onFileSelect={onFileSelect}
                selectedFilePath={selectedFilePath}
                level={level + 1}
              />
            )}
          </li>
        )
      })}
    </ul>
  )
}
