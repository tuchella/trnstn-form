export function dateWithYearOffset(years: number): string {
    const date = new Date();
    date.setDate(date.getDate() + (years*365));
    return date.toISOString().substr(0, 10);
}

export function dateToString(date: any): string {
    if (!date) {
        return "";
    }
    // well that's ugly, sorry
    // also would probably be easier now that we switched to typescript but whatever...
    if (typeof date.toDate === 'function') {
        date = date.toDate();
    }
    return date.getFullYear() + "-" + ("0"+(date.getMonth()+1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
}

export function stringToDate(str:string): Date {
    return new Date(Date.parse(str));
}