import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const API_URL = import.meta.env.VITE_API_URL;

const SemanticGraphView = ({ roomId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    async function fetchGraph() {
      try {
        const res = await fetch(`${API_URL}/api/search/semantic-graph?roomId=${roomId}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setGraphData({
          nodes: data.nodes,
          links: data.edges.map(e => ({
            source: e.source,
            target: e.target,
            value: e.weight,
          })),
        });
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    }
    fetchGraph();
  }, [roomId]);

  return (
    <div style={{ height: 500 }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="id"
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => d.value * 0.01}
      />
    </div>
  );
};

export default SemanticGraphView;