"use client";

import React, { useEffect, useRef } from "react";
import { CElegans } from "@/core/celegans";

const WormCanvas: React.FC<{ celegans: CElegans }> = ({ celegans }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawWorm = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 근육 기반 Mesh 표현
      ctx.beginPath();
      celegans.muscles
        .values()
        .toArray()
        .toSorted((a, b) => a.position.x - b.position.x)
        .forEach((muscle, index) => {
          if (index === 0) {
            ctx.moveTo(
              muscle.position.x * canvas.width,
              muscle.getAdjustedY() * canvas.height
            );
          } else {
            ctx.lineTo(
              muscle.position.x * canvas.width,
              muscle.getAdjustedY() * canvas.height
            );
          }
        });
      ctx.closePath();
      ctx.fillStyle = "rgba(34, 139, 34, 0.6)"; // 반투명 초록색
      ctx.fill();

      // 뉴런 그리기
      celegans.neurons.forEach((neuron) => {
        ctx.beginPath();
        ctx.arc(
          neuron.somaPosition * canvas.width,
          canvas.height / 2,
          neuron.spike ? 8 : 5,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = neuron.spike ? "red" : "blue";
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(drawWorm);
    };

    drawWorm();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [celegans]);

  return (
    <canvas
      ref={canvasRef}
      style={{ background: "#eee", display: "block", margin: "auto" }}
    />
  );
};

export default WormCanvas;
