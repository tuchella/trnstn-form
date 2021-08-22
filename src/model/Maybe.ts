export default class Maybe<T> {
    value?:T;

    present(): boolean {
        return this.value != undefined;
    }

    static empty<T>(): Maybe<T>  {
        return new Maybe<T>();
    }
}