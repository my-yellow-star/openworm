import { useEffect, useRef, useState } from "react";

export const useCPUMonitor = () => {
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const lastTimestamp = useRef<number>(performance.now());

  useEffect(() => {
    const updateCPU = () => {
      const now = performance.now();
      const deltaTime = now - lastTimestamp.current;
      lastTimestamp.current = now;

      setCpuUsage((prev) => prev * 0.9 + deltaTime * 0.1); // 지수평균 필터 적용
      return requestAnimationFrame(updateCPU);
    };

    const update = updateCPU(); // 초기 실행
    return () => cancelAnimationFrame(update);
  }, []);

  return cpuUsage;
};
