이 문서는 예쁜꼬마선충(C. elegans) 신경 네트워크 및 근육 시뮬레이션 프로젝트를 설명하며, 설치 및 실행 방법, 구조, 주요 기능 등을 포함합니다.

# 🧠 C. elegans Neural & Muscle Simulation

**C. elegans Neural & Muscle Simulation**은 예쁜꼬마선충(C. elegans)의 **신경 네트워크 및 근육 구조**를 시뮬레이션하는 프로젝트입니다.  
이 프로젝트는 **뉴런 발화, 시냅스 신호 전달, 근육 활성화 및 벌레의 움직임**을 시각적으로 표현합니다.

---

## 🌟 주요 기능

✅ **신경 네트워크 모델링**

- Izhikevich 뉴런 모델을 사용하여 뉴런 발화(`spike`) 구현
- 감각 뉴런(`sensory`), 개재 뉴런(`interneuron`), 운동 뉴런(`motor`)의 기능 반영
- 뉴런 간 시냅스 연결(`Synapse`)을 통한 신호 전달

✅ **근육 모델링**

- **근육(`Muscle`) 클래스**를 구현하여 뉴런과 연결
- **NMJ(신경근 접합)**을 통해 운동 뉴런과 근육을 연동
- 근육 활성화(`activation`) 상태를 반영하여 시각적 표현

✅ **시각적 표현 (2D 기반)**

- `Canvas`를 활용하여 뉴런 및 근육을 시각적으로 표현
- 근육 활성화에 따른 **벌레의 곡선 변형**
- 뉴런 발화(`spike`) 시 색상 변경 (기본 `blue`, 발화 시 `red`)

---

## 🚀 설치 및 실행 방법

### 1️⃣ **의존성 설치**

```sh
pnpm install
```

2️⃣ 프로젝트 실행

```sh
pnpm run dev
```

이제 브라우저에서 http://localhost:3000 에 접속하면 시뮬레이션을 확인할 수 있습니다.

🎨 시뮬레이션 구조

🔹 뉴런 발화 (Izhikevich 모델)

뉴런의 막전위(v)가 특정 임계값(30mV)를 초과하면 발화(spike)가 발생합니다.

```typescript
update(I: number) {
  this.v += 0.04 * this.v ** 2 + 5 * this.v + 140 - this.u + I;
  this.u += this.a * (this.b * this.v - this.u);

  if (this.v >= 30) {
    this.v = this.c;
    this.u += this.d;
    this.spike = true;
  } else {
    this.spike = false;
  }
}
```

🔹 신경 네트워크 업데이트

```typescript
updateNetwork(inputSignals: { [key: string]: number }) {
  for (const [id, neuron] of this.neurons) {
    const I = inputSignals[id] || 0;
    neuron.update(I);
  }

  for (const [id, neuron] of this.neurons) {
    if (neuron.spike) {
      neuron.synapses.forEach(({ target, weight, type }) => {
        const targetNeuron = this.neurons.get(target);
        if (!targetNeuron) return;
        if (type === "S" || type === "Sp") {
          targetNeuron.update(weight);
        }
      });
    }
  }

  // 근육 활성화 및 이동 처리
  this.muscles.forEach((muscle) => {
    muscle.decay();
  });

  this.position.x += this.muscles.values().reduce((sum, muscle) => sum + muscle.activation * 0.01, 0);
}
```

🎮 주요 인터페이스

Neuron.ts

```typescript
/**
 *
 * @property a: 시간 스케일, u가 얼마나 빠르게 변화하는지 조절.
 * @property b: 민감도, v가 u에 얼마나 영향을 미치는지 결정.
 * @property c: 발화 후 재설정 값. 뉴런이 발화한 후 리셋시킬 v 값을 결정.
 * @property d: 발화 후 보정 값. 뉴런이 발화한 후 u를 얼마나 증가시킬 지 결정.
 * @property v: 막전위. 뉴런의 전압(mV), 기본값 -65mV
 * @property u: 회복 변수. 발화 후 뉴런이 안정 상태로 복귀하는 속도를 조절.
 * @property spike: 발화 상태 여부 (true / false).
 * @property somaPosition: 뉴런의 위치 (0: 코 끝 ~ 1: 꼬리 끝)
 * @property region: 뉴런이 속한 영역 (머리, 몸통, 꼬리)
 * @property sensory: 감각 뉴런 여부
 * @property receptor: 수용 뉴런 여부
 * @property motor: 운동 뉴런 여부
 * @property ganglion: 뉴런이 속한 신경절 그룹
 */
export class Neuron {
  id: string;
  a: number;
  b: number;
  c: number;
  d: number;
  v: number;
  u: number;
  spike: boolean;
  somaPosition: number;
  region: string;
  sensory: boolean;
  receptor: boolean;
  motor: boolean;
  ganglion: string;
  synapses: Synapse[];

  constructor(
    id: string,
    a = 0.02,
    b = 0.2,
    c = -65,
    d = 8,
    somaPosition = 0.5,
    region = "M",
    sensory = false,
    receptor = false,
    motor = false,
    ganglion = ""
  ) {
    this.id = id;
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.v = -65;
    this.u = b * this.v;
    this.spike = false;
    this.somaPosition = somaPosition;
    this.region = region;
    this.sensory = sensory;
    this.receptor = receptor;
    this.motor = motor;
    this.ganglion = ganglion;
    this.synapses = [];
  }
}
```

Muscle.ts

```typescript
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
}
```

📌 향후 개선 사항

```
✅ 벌레 움직임 애니메이션 추가 (더 자연스러운 이동 반영)
✅ 환경 변화(터치, 자극 등)에 대한 반응 구현
✅ 근육과 신경의 생물학적 연결 관계 더 정밀하게 반영
✅ Unity 물리엔진을 사용해 더 현실적인 움직임을 구현

📜 참고 문헌
	•	White et al., 1986: “The structure of the nervous system of the nematode C. elegans”
	•	Varshney et al., 2011: “Structural properties of the C. elegans neuronal network”
	•	Izhikevich, 2003: “Simple model of spiking neurons”
```
