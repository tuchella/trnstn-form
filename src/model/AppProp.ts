export default interface AppProp<T> {
    get(): Promise<T>;
    set(value: T): Promise<void>;
}