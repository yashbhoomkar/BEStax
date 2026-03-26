function PageHeader({ title, description, actions = null }) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        <span className="eyebrow">Workspace</span>
        <h2>{title}</h2>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;