/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef } from "react";
import * as d3 from "d3";
import { CElegans } from "@/core/celegans";
import { Synapse } from "@/core/synapse";

interface NeuronGraphProps {
  network: CElegans;
}

interface NeuronNodeDatum extends d3.SimulationNodeDatum {
  id: string;
  spike: boolean;
  synapses: Synapse[];
}

interface NeuronNodeLink {
  source: NeuronNodeDatum;
  target: NeuronNodeDatum;
  type: string;
}

const NeuronGraph: React.FC<NeuronGraphProps> = ({ network }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const neuronNodeRef = useRef<NeuronNodeDatum[]>(
    network.neurons
      .values()
      .toArray()
      .map((neuron) => ({
        id: neuron.id,
        spike: neuron.spike,
        synapses: neuron.synapses,
        x: Math.random() * 800,
        y: Math.random() * 600,
      }))
  );

  // ✅ 뉴런 클릭 이벤트 핸들러 (최적화)
  const handleNodeClick = useCallback(
    (node: NeuronNodeDatum) => {
      const signals: { [key: string]: number } = {};
      signals[node.id] = 60;
      network.updateNetwork(signals);
    },
    [network]
  );

  useEffect(() => {
    console.log("use effect");
    if (!svgRef.current) return;

    const neuronNodes = neuronNodeRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const width = 800;
    const height = 600;

    const links = neuronNodes.flatMap(
      (neuron) =>
        neuron.synapses
          .filter((synapse) => synapse.type !== "NMJ")
          .map((synapse) => ({
            source: neuronNodes.find((n) => n.id === neuron.id) || neuron.id,
            target:
              neuronNodes.find((n) => n.id === synapse.target) ||
              synapse.target,
            type: synapse.type,
          })) || []
    ) as NeuronNodeLink[];

    const simulation = d3
      .forceSimulation<NeuronNodeDatum>(neuronNodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .style("stroke", "gray")
      .style("stroke-width", 1);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(neuronNodes)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("fill", (d) => (d.spike ? "red" : "blue")) // 🔴 발화 상태 표시
      .on("click", (_, d) => handleNodeClick(d)) // ✅ 클릭하면 뉴런을 자극
      .call(
        d3
          .drag<SVGCircleElement, NeuronNodeDatum>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [handleNodeClick]);

  return <svg ref={svgRef} width={1200} height={800}></svg>;
};

export default NeuronGraph;
