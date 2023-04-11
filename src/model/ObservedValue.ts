export default class ObservedValue<T> {
    private _value: T;
    private _isChanged: boolean = false;
    readonly key: string;

    constructor(key: string, value: T) {
        this.key = key;
        this._value = value;
    }

    get value() {
        return this._value;
    }

    get isChanged() {
        return this._isChanged;
    }
     
    set value(newValue: T) {
        if (newValue != this._value) {
            this._isChanged = true;
            this._value = newValue;
        }
    }
}