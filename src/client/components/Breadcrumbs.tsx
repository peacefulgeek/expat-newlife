import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="separator" aria-hidden="true">›</span>}
          {item.url && i < items.length - 1 ? (
            <Link to={item.url}>{item.name}</Link>
          ) : (
            <span aria-current={i === items.length - 1 ? 'page' : undefined}>
              {item.name}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
