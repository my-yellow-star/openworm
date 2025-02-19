import { Muscle } from "./muscle";
import { Neuron } from "./neuron";
import { Synapse } from "./synapse";

export class CElegans {
  neurons: Map<string, Neuron>;
  muscles: Map<string, Muscle>;
  position: number;

  constructor() {
    this.neurons = new Map();
    this.muscles = new Map();
    this.position = 0;
  }

  addNeuron(neuron: Neuron) {
    if (!this.neurons.has(neuron.id)) {
      this.neurons.set(neuron.id, neuron);
    }
  }

  addMuscle(muscle: Muscle) {
    if (!this.muscles.has(muscle.id)) {
      this.muscles.set(muscle.id, muscle);
    }
  }

  connectNeurons(source: string, synapse: Synapse) {
    const neuron = this.neurons.get(source);
    if (neuron) {
      neuron.addSynapse(synapse);
    }
  }

  connectMuscle(neuronId: string, muscleId: string, weight: number) {
    const neuron = this.neurons.get(neuronId);
    const muscle = this.muscles.get(muscleId);

    if (neuron && muscle && neuron.motor) {
      muscle.connectNeuron(neuronId, weight);
    }
  }

  updateNetwork(inputSignals: { [key: string]: number }) {
    // 1. 외부 자극 적용
    for (const [id, neuron] of this.neurons) {
      if (neuron.sensory) {
        const I = inputSignals[id] || 0;
        neuron.update(I);
      }
    }

    // 2. 뉴런 간 신호 전달
    for (const [id, neuron] of this.neurons) {
      if (neuron.spike) {
        neuron.synapses.forEach(({ target, weight, type }) => {
          if (type === "NMJ" && neuron.motor) {
            // 운동 뉴런 발화: 연결된 근육 활성화
            this.muscles.forEach((muscle) => {
              if (muscle.connectedNeurons.has(id)) {
                const neuronWeight = muscle.connectedNeurons.get(id) || 0;
                const totalStrength = weight * neuronWeight;
                const activationWeight = 0.1;
                muscle.activate(totalStrength * activationWeight);
              }
            });
          }
          const targetNeuron = this.neurons.get(target);
          if (!targetNeuron) return;

          if (type === "S" || type === "Sp") {
            // 흥분성 화학적 시냅스 (양의 weight)
            targetNeuron.update(weight);
          } else if (type === "R" || type === "Rp") {
            // 수신 뉴런 (weight 사용)
            targetNeuron.update(-weight);
          } else if (type === "EJ") {
            // 전기적 시냅스 (양방향 연결)
            const gapWeight = 0.1; // 전기적 시냅스 비율
            targetNeuron.v += neuron.v * gapWeight;
          }
        });
      }
    }

    // 3. 근육의 자연 복귀 (시간에 따라 활성도 감소)
    this.muscles.forEach((muscle) => {
      muscle.decay();
    });
  }
}
