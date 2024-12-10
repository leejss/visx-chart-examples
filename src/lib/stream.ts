type Data = {
  x: number;
  y: number;
};

type Range = {
  x: [number, number]; // min, max
  y: [number, number]; // min, max
};

type Subscriber = (data: Data) => void;

export class DataStream {
  private range: Range;
  private subscribers: Subscriber[] = [];
  private intervalId: number | null = null;

  constructor(range: Range) {
    this.range = range;
    this.startStreaming();
  }

  // 주어진 범위 내에서 무작위 숫자 생성
  private generateRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateData() {
    return {
      x: this.generateRandomNumber(this.range.x[0], this.range.x[1]),
      y: this.generateRandomNumber(this.range.y[0], this.range.y[1]),
    };
  }

  private startStreaming() {
    this.intervalId = setInterval(() => {
      const data = this.generateData();
      this.notifySubscribers(data);
    }, 1000);
  }

  private notifySubscribers(data: Data) {
    this.subscribers.forEach((subscriber) => subscriber(data));
  }

  public subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);

    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    };
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
