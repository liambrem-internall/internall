import React from 'react';

// mock ForceGraph2D component
const ForceGraph2D = React.forwardRef((props, ref) => {
  return <div data-testid="force-graph-2d" ref={ref} {...props} />;
});

ForceGraph2D.displayName = 'ForceGraph2D';

export default ForceGraph2D;