"use client";

import { CElegansFactory } from "@/core/factory";
import React, { createContext, useContext, useEffect, useState } from "react";
import Papa from "papaparse";
import { DataType } from "@/types/data-type";
import { CElegans } from "@/core/celegans";

const CElegansContext = createContext<{
  celegans: CElegans | null;
  update: (updated: CElegans) => void;
} | null>(null);

export const CElegansProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [celegans, setCelegans] = useState<CElegans | null>(null);

  useEffect(() => {
    const parseCSV = (filePath: string) =>
      new Promise<DataType[]>((resolve, reject) => {
        Papa.parse<DataType>(filePath, {
          download: true,
          header: true,
          dynamicTyping: true,
          complete: (result) => resolve(result.data),
          error: (error) => reject(error),
        });
      });

    Promise.all([
      parseCSV("./celegans_neuron_connect.csv"),
      parseCSV("./celegans_neuron_type.csv"),
      parseCSV("./celegans_neuron_fixed_points.csv"),
    ])
      .then(([connectionData, neuronData, fixedPointData]) => {
        const factory = new CElegansFactory(
          connectionData,
          neuronData,
          fixedPointData
        );
        setCelegans(factory.celegans);
      })
      .catch((error) => console.error("Error loading CSV files:", error));
  }, []);

  const update = (updated: CElegans) => {
    setCelegans(updated);
  };

  return (
    <CElegansContext.Provider value={{ celegans, update }}>
      {children}
    </CElegansContext.Provider>
  );
};

export const useCElegans = () => {
  const context = useContext(CElegansContext);
  if (!context) {
    throw new Error(
      "useNeuralNetwork must be used within a NeuralNetworkProvider"
    );
  }
  return context;
};
