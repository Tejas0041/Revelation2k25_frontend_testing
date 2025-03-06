import React, { useState } from 'react';
import '../css/CollapsibleSection.css';

const CollapsibleSection = ({ title, children, isOpen = false, isCompleted = false }) => {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div className={`collapsible-section ${expanded ? 'expanded' : ''}`}>
      <div 
        className={`section-header ${isCompleted ? 'completed' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <h3>{title}</h3>
        <span className="indicator">
          {isCompleted ? '✓' : expanded ? '−' : '+'}
        </span>
      </div>
      <div className="section-content">
        {expanded && children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
