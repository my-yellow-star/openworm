"use client";

import WormCanvas from "@/components/worn-canvas";
import { useCElegans } from "@/context/celegans";
import { useCallback, useEffect } from "react";

export default function Home() {
  const { celegans, update } = useCElegans();
  const sensorIds = celegans?.neurons
    .values()
    .filter((e) => e.sensory)
    .map((e) => e.id)
    .toArray();

  const updateNeuron = useCallback(() => {
    if (!celegans) return;

    const signals: { [key: string]: number } = {};
    sensorIds?.forEach((id) => {
      signals[id] = Math.random() * 15;
    });

    celegans.updateNetwork(signals);
    update(celegans);
  }, [celegans, sensorIds, update]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateNeuron();
    }, 100);

    return () => clearInterval(interval);
  }, [updateNeuron]);

  if (!celegans) return;

  return (
    <div>
      <WormCanvas celegans={celegans} />
      <button onClick={updateNeuron}>Stimulate</button>
    </div>
  );
}
