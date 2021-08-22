export default class FakeProgress {
    private readonly callback: (p: number) => void;
    private progress: number = 0;
    private readonly intervalTime;
    private intervalId?: number;

    constructor(f: (p: number) => void, 
            interval: number = 1000,
            initialProgress?: number) {
        this.callback = f;
        this.intervalTime = interval;
        if (initialProgress) {
            this.progress = initialProgress;
        }
    }

    start(): void {
        this.stop();

        const self = this;
        this.intervalId = setInterval(function(){
            const delay = Math.random() * (self.intervalTime / 2);
            setTimeout(
                () => {
                    self.progress = 100 - (100 - self.progress) / 1.2
                    self.callback(self.progress);
                }, 
                delay);
        }, self.intervalTime);
    }
            
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
}