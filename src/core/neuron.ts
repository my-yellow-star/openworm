import { Synapse } from "./synapse";

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

  addSynapse(synapse: Synapse) {
    this.synapses.push(synapse);
  }
}
