const REDACTED_MAIL = /^.\*\*\*.@.\*\*.\*\*.$/;
const REDACTED_PHONE = /^.\*\*\*.$/;

export default function redact(v?:string) {
    if (!v) {
        return '';
    } else if (v.indexOf('@') > -1) {
        const redacted = 
            v.split('@')[0].slice(0,1) +
            '***' +
            v.split('@')[0].slice(-1) +
            '@' +
            v.split('@')[1].slice(0,1) +
            '**.**'
            v.split('@')[1].slice(-1);
        return redacted;
    } else {
        const redacted = 
            v.slice(0,1) +
            '***' +
            v.slice(-1);
        return redacted;
    }
}