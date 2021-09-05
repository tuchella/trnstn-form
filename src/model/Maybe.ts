export default class Maybe<T> {
    value?:T;

    present(): boolean {
        return this.value != undefined;
    }

    static from<T>(value:T): Maybe<T> {
        const m = new Maybe<T>()
        m.value = value;
        return m;
    }

    static empty<T>(): Maybe<T>  {
        return new Maybe<T>();
    }

    ifPresent(consumer:(v:T) => void):void {
        if (this.present()) {
            consumer(this.value!)
        } 
    }
}