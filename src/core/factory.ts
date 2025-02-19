import { DataType } from "@/types/data-type";
import { Muscle } from "./muscle";
import { CElegans } from "./celegans";
import { Neuron } from "./neuron";
import { Synapse } from "./synapse";

export class CElegansFactory {
  celegans: CElegans;

  constructor(
    connectionData: DataType[],
    neuronData: DataType[],
    fixedPointData: DataType[]
  ) {
    this.celegans = new CElegans();
    neuronData.forEach((row) => {
      const id = row["Neuron"];
      const somaPosition = parseFloat(row["Soma Position"]);
      const region = row["Soma Region"].trim();
      const sensory =
        row["S_Head"] > 0 || row["S_Mid"] > 0 || row["S_Tail"] > 0;
      const receptor =
        row["R_Head"] > 0 || row["R_Mid"] > 0 || row["R_Tail"] > 0;
      const motor = /^(DA|DB|DD|VA|VB|VD|VC)/.test(id);
      const ganglion = row["AY Ganglion Designation"].trim();

      this.celegans.addNeuron(
        new Neuron(
          id,
          0.02,
          0.2,
          -65,
          8,
          somaPosition,
          region,
          sensory,
          receptor,
          motor,
          ganglion
        )
      );
    });

    connectionData.forEach((row) => {
      const source = row["Neuron 1"];
      const target = row["Neuron 2"];
      const type = row["Type"];
      const weight = row["Nbr"];
      const synapse: Synapse = { target, type, weight };
      this.celegans.connectNeurons(source, synapse);
    });

    fixedPointData.forEach((row) => {
      const landMark = row["Landmark"] as string;
      const position = row["Landmark Position"];
      const neuronId = row["Neuron"];
      const weight = row["Weight"];

      if (landMark.startsWith("M") && !this.celegans.muscles.has(landMark)) {
        const muscle = new Muscle(landMark, position);
        this.celegans.addMuscle(muscle);
        this.celegans.connectMuscle(neuronId, landMark, weight);
      }
    });
  }
}
