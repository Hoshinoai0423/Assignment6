import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export function TreeMap({ margin, svg_width, svg_height, tree, selectedCell, setSelectedCell }) {
    const ref = useRef();

    useEffect(() => {
        const innerWidth = svg_width - margin.left - margin.right;
        const innerHeight = svg_height - margin.top - margin.bottom;

        const svg = d3.select(ref.current);
        svg.selectAll("*").remove();

        const root = d3.hierarchy(tree)
            .sum(d => d.value || 0)
            .sort((a, b) => (a.data.name || "").localeCompare(b.data.name || ""));

        const globalTotal = root.value || 1;

        d3.treemap()
            .size([innerWidth, innerHeight])
            .padding(1)
            .round(true)
            .tile(d3.treemapResquarify)(root);

        const colorDomain = root.leaves().map(d => d.data.name).sort();
        const color = d3.scaleOrdinal()
            .domain(colorDomain)
            .range(d3.schemeDark2);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const legendData = [...new Set(colorDomain)];
        const legend = g.append("g")
            .attr("transform", `translate(0, -30)`);

        const legendItem = legend.selectAll("g")
            .data(legendData)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${i * 150}, 0)`);

        legendItem.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => color(d));

        legendItem.append("text")
            .attr("x", 16)
            .attr("y", 10)
            .attr("fill", "black")
            .text(d => d);

        const node = g.selectAll("g.node")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

        node.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d3.color(color(d.data.name)).copy({ opacity: 0.75 }))
            .on("click", d => setSelectedCell && setSelectedCell(d));

        g.selectAll("text.layer-label")
            .data(root.children || [])
            .enter().append("text")
            .attr("class", "layer-label")
            .attr("x", d => (d.x0 + d.x1) / 2)
            .attr("y", d => (d.y0 + d.y1) / 2)
            .attr("text-anchor", "middle")
            .attr("fill", "#333")
            .style("opacity", 0.4)
            .style("pointer-events", "none")
            .style("font-size", d => Math.max(10, Math.min((d.x1 - d.x0), (d.y1 - d.y0)) / d.data.name.length * 1.5) + "px")
            .attr("transform", d => {
                const width = d.x1 - d.x0;
                const height = d.y1 - d.y0;
                return width < height ? `rotate(-90 ${(d.x0 + d.x1) / 2}, ${(d.y0 + d.y1) / 2})` : null;
            })
            .text(d => d.data.name === "root" && root.children?.length === 1 ? root.children[0].data.name : d.data.name);

        node.each(function (d) {
            const group = d3.select(this);
            const label = d.ancestors()[1]?.data.name || d.data.name;
            const percent = ((d.value / globalTotal) * 100).toFixed(1) + "%";
            const lines = [label, percent];

            const padding = 2;
            const width = d.x1 - d.x0;
            const height = d.y1 - d.y0;
            const fontSize = Math.max(6, Math.min(width / 6, 10));

            lines.forEach((line, i) => {
                if (i * fontSize + padding * 2 < height) {
                    group.append("text")
                        .attr("x", padding)
                        .attr("y", padding + fontSize * (i + 1))
                        .attr("fill", "white")
                        .attr("font-size", fontSize + "px")
                        .style("pointer-events", "none")
                        .text(line);
                }
            });
        });

    }, [tree, margin, svg_width, svg_height, setSelectedCell]);

    return (
        <svg
            ref={ref}
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        />
    );
}