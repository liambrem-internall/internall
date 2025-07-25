import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

const API_URL = import.meta.env.VITE_API_URL;

const SemanticGraphView = ({ roomId }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `${API_URL}/api/search/semantic-graph?roomId=${roomId}`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        setGraphData({
          nodes: data.nodes,
          links: data.edges.map((e) => ({
            source: e.source,
            target: e.target,
            value: e.weight,
          })),
        });
      } catch (error) {
        console.error("Error fetching graph data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGraph();
  }, [roomId]);

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        Loading semantic graph...
      </div>
    );
  }

  if (error) {
    return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;
  }

  if (graphData.nodes.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        No items found for this room.
      </div>
    );
  }

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <div style={{ padding: 10, fontSize: 14, color: "#666" }}>
        {graphData.nodes.length} nodes, {graphData.links.length} connections
        <br />
      </div>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="label"
        nodeAutoColorBy="id"
        nodeRelSize={4}
        linkColor={() => "rgb(133, 133, 133)"}
        linkLabel={(link) => `Weight: ${link.value?.toFixed(3)}`}
        width={window.innerWidth - 40}
        height={window.innerHeight - 120}
      />
    </div>
  );
};

export default SemanticGraphView;
