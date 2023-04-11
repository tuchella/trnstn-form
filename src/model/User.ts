export class User {
    name:string;
    authenticated:boolean;

    constructor(name:string, authenticated:boolean) {
        this.name = name;
        this.authenticated = authenticated;
    }
}
