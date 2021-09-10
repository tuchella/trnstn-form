import { Act, Show } from '@/util/types';
import uuid from './uuid';
import { showsCollection, confidentialCollection, auth, infoDoc } from '@/util/firebase/firebase'; 

const REDACTED_MAIL = /^.\*\*\*.@.\*\*.\*\*.$/;
const REDACTED_PHONE = /^.\*\*\*.$/;
  
async function saveShow(show:Show) {
    if (!show.id) {
        show.id = show.title.replaceAll(' ','').substring(0,4).toUpperCase() + uuid().substring(0,13).replace('-','');
    }
    if (!show.createdAt) {
        show.createdAt = new Date();
    }
    if (show.contact && !(show.contact.match(REDACTED_MAIL) || show.contact.match(REDACTED_PHONE))) {
        const fullContact = show.contact;
        const confidential = { contact: fullContact };
        show.contact = redact(show.contact);
        await confidentialCollection.overwrite(show.id, confidential);
    }
    for (const act of show.acts) {
        act.img = await act.img.save();
    }
    return await showsCollection.overwrite(show.id, show);
}

function redact(v:string) {
    if (v.indexOf('@') > -1) {
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

function getFieldValue(o:any, field:string): any {
    let val;
    if (field.indexOf('.') > 0) {
        val = o;
        for(const f of field.split(".")) {
            val = val[f];
            if (val === undefined || val === null) {
                break;
            }
        }
    } else {
        val = o[field];
    }
    return val;
}

async function saveAct(show: Show, act: Act, ...fields: string[]) {
    const data = new Map<string, any>();
    act.img = await act.img.save();
    if (fields.length > 0) {
        fields.forEach(f => {
            const k = "acts." + act.id + "." + f;
            const v = getFieldValue(act, f);
            data.set(k, v);
        });
    } else {
        data.set("acts." + act.id, act);
        data.get("acts." + act.id).index = show.acts.indexOf(act);
    }
    return showsCollection.update(show.id!, data);
}

async function deleteShow(id?:string) {
    if (!id) {
        return;
    }
    const show = await showsCollection.get(id)
    await showsCollection.delete(id);
    for (const act of show.acts) {
        if (act.img.delete) {
            await act.img.delete();
        }
    }
}

async function getShow(id?:string): Promise<Show> {
    if (!id) {
        return Promise.reject("Can not find show without id");
    }

    const show = await showsCollection.get(id)

    if (show && show.id && auth.isSignedIn()) {
        const confidential = await confidentialCollection.getMaybe(show.id);
        confidential.ifPresent(c => {
            const contact = c['contact'];
            show.contact = contact || show.contact;
        });
    }
    return show;
}

function getInfo() {
    return infoDoc.get();
}

function saveInfo(text:string) {
    return infoDoc.set(text);
}

export default {
    saveShow,
    saveAct,
    deleteShow,
    getShow,
    getInfo,
    saveInfo,
}