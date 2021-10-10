export interface IQueueManager {
    enqueue(item: any): void;
    count(): number;
    empty(): void;
  }
  