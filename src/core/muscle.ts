export class Muscle {
  id: string; // Landmark
  activation: number;
  position: { x: number; y: number }; // 상대적 값 (0 ~ 1)
  connectedNeurons: Map<string, number>; // <뉴런 아이디, 연결 강도>

  constructor(id: string, positionX: number) {
    this.id = id;
    this.activation = 0;
    this.connectedNeurons = new Map();

    let positionY: number;
    if (this.id.includes("MANAL")) {
      positionY = 0.9; // 항문 근육 (아래쪽)
    } else if (this.id.includes("MVULVA")) {
      positionY = 0.8; // 질 근육 (중간 아래)
    } else if (this.id.includes("MDR") || this.id.includes("MDL")) {
      positionY = 0.3; // 등쪽(Dorsal) 체벽 근육 (위쪽)
    } else if (this.id.includes("MVR") || this.id.includes("MVL")) {
      positionY = 0.7; // 복측(Ventral) 체벽 근육 (아래쪽)
    } else {
      positionY = 0.5; // 기본 위치 (중앙)
    }

    this.position = { x: positionX, y: positionY };
  }

  // NMJ를 통해 운동 뉴런으로부터 신호를 받으면 활성화
  activate(strength: number) {
    this.activation = Math.min(1, this.activation + strength); // 최대 1까지 증가
  }

  // 시간에 따라 근육 수축이 점차 감소 (자연 복귀)
  decay(rate: number = 0.1) {
    this.activation = Math.max(0, this.activation - rate);
  }

  // 운동 뉴런과의 연결 추가
  connectNeuron(neuronId: string, weight: number) {
    if (!this.connectedNeurons.has(neuronId)) {
      this.connectedNeurons.set(neuronId, weight);
    }
  }

  getAdjustedY(): number {
    return this.position.y + this.activation * 0.05; // 활성화에 따라 미세한 변형 반영
  }
}
