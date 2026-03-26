function PageHeader({ title, description, actions = null }) {
  return (
    <div className="page-header">
      <div className="page-header-copy">
        <span className="eyebrow">Workspace</span>
        <h2>{title}</h2>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {actions ? <div className="header-actions">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
