import ObservedValue from './ObservedValue';

export default class ContactInfo {
    email: ObservedValue<string>;
    phone: ObservedValue<string>;

    constructor(email?: string, phone?: string) {
        this.email = new ObservedValue("email", email ?? '');
        this.phone = new ObservedValue("phone", phone ?? '');
    }

    private get values() {
        return [this.email, this.phone];
    }

    get isEmpty(): boolean {
        return this.values.every(v => v.value == undefined);
    }

    get changedValues(): Map<string, string | undefined> {
        const values = new Map<string, string | undefined>();
        this.values.filter(v => v.isChanged).reduce((map, v) => {
            map.set(v.key, v.value);
            return map;
        }, values);
        return values;
    }

    get isEveryChanged() {
        return this.values.every(v => v.isChanged)
    }

    get isSomeChanged() {
        return this.values.some(v => v.isChanged)
    }
}