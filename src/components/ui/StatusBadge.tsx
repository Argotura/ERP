// ============================================================
// ARGOTURO ERP — Status Badge Component
// ============================================================

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';
type BadgeType = 'stock' | 'product' | 'supplier' | 'category';

interface StatusBadgeProps {
  status: string;
  type: BadgeType;
}

function getVariantAndLabel(status: string, type: BadgeType): { variant: BadgeVariant; label: string } {
  switch (type) {
    case 'stock':
      switch (status) {
        case 'in_stock':
          return { variant: 'success', label: 'In Stock' };
        case 'low_stock':
          return { variant: 'warning', label: 'Low Stock' };
        case 'out_of_stock':
          return { variant: 'danger', label: 'Out of Stock' };
        default:
          return { variant: 'neutral', label: status };
      }

    case 'product':
      switch (status) {
        case 'active':
          return { variant: 'success', label: 'Active' };
        case 'inactive':
          return { variant: 'neutral', label: 'Inactive' };
        case 'archived':
          return { variant: 'neutral', label: 'Archived' };
        default:
          return { variant: 'neutral', label: status };
      }

    case 'supplier':
    case 'category':
      switch (status) {
        case 'active':
          return { variant: 'success', label: 'Active' };
        case 'inactive':
          return { variant: 'neutral', label: 'Inactive' };
        default:
          return { variant: 'neutral', label: status };
      }

    default:
      return { variant: 'neutral', label: status };
  }
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  const { variant, label } = getVariantAndLabel(status, type);

  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
