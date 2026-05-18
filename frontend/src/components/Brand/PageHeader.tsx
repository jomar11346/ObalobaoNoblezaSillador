import type { FC, ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }) => {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="yb-eyebrow">Yui Blooms</p>
        <h1 className="yb-page-title">{title}</h1>
        {subtitle && <p className="yb-page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
};

export default PageHeader;
