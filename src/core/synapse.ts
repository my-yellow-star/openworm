export interface Synapse {
  target: string;
  weight: number;
  type: "S" | "Sp" | "R" | "Rp" | "EJ" | "NMJ";
}
