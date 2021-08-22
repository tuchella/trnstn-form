import * as fb from '@/firebase';
import { Act, Show } from '@/util/types';
import uuid from './uuid';

import firebase from 'firebase/app'
import 'firebase/firestore'
const FieldValue = firebase.firestore.FieldValue;


const REDACTED_MAIL = /^.\*\*\*.@.\*\*.\*\*.$/;
const REDACTED_PHONE = /^.\*\*\*.$/;
  
async function saveShow(show:Show) {
    const files = fb.storage.ref();

    if (!show.id) {
        show.id = show.title.replaceAll(' ','').substring(0,4).toUpperCase() + uuid().substring(0,13).replace('-','');
    }
    if (!show.createdAt) {
        show.createdAt = new Date();
    }
    if (show.contact && !(show.contact.match(REDACTED_MAIL) || show.contact.match(REDACTED_PHONE))) {
        const fullContact = show.contact;
        if (show.contact.indexOf('@') > -1) {
            const redacted = 
                show.contact.split('@')[0].slice(0,1) +
                '***' +
                show.contact.split('@')[0].slice(-1) +
                '@' +
                show.contact.split('@')[1].slice(0,1) +
                '**.**'
                show.contact.split('@')[1].slice(-1);
            show.contact = redacted;
        } else {
            const redacted = 
                show.contact.slice(0,1) +
                '***' +
                show.contact.slice(-1);
            show.contact = redacted;
        }
        const confidential = { contact: fullContact };
        await fb.confidentialCollection.doc(show.id).set(confidential);
    }

    for (const act of show.acts) {
        act.img = await act.img.save();
    }
    return await fb.showsCollection.doc(show.id).set(show);
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
    if (val === undefined) {
        val = FieldValue.delete();
    }
    return val;
}

async function saveAct(show: Show, act: Act, ...fields: string[]) {
    const data:any = {}
    act.img = await act.img.save();
    if (fields.length > 0) {
        fields.forEach(f => data["acts." + act.id + "." + f] = getFieldValue(act, f));
    } else {
        data["acts." + act.id] = fb.convertActs.toFirestore(act);
        data["acts." + act.id].index = show.acts.indexOf(act);
    }
    return fb.showsCollection.doc(show.id).update(data);
    /*
    const i = s.acts.findIndex(a => a.id == act.id);
    if (i > 0) {
        s.acts[i] = act;
        act.img = await act.img.save();
        await fb.showsCollection.doc(s.id).update({
            acts: s.acts
        })
        return s;
    } else {
        throw new Error(`Act ${act.id} not valid`);
    }
    */
}

function getShow(id?:string): Promise<Show> {
    if (!id) {
        return Promise.reject("Can not find show without id");
    }

    return fb.showsCollection
            .doc(id)
            .get()
            .then(doc => {
                if (!doc.exists) {
                    throw 'No such document';
                }
                return doc.data()!;
            })
            .then(show => {
                if (show && fb.isSignedIn()) {
                    fb.confidentialCollection.doc(show.id).get().then(c => {
                        if (c.exists) {
                            const contact = c.data()!['contact'];
                            show.contact = contact || show.contact;
                        }
                    })
                }
                return show;
            });
}

function getInfo() {
    return new Promise((resolve, reject) => {
        fb.infoDoc.get()
            .then(doc => {
                if (doc.exists) {
                    const info:any = doc.data()
                    resolve(info.text.replaceAll("\\n","\n"));
                } else {
                    reject('No such document');
                }
            }).catch(error => {
                reject(error.code + ': ' + error.message);
            });
    });
}

function saveInfo(text:string) {
    return fb.infoDoc.update({
        text: text.replaceAll("\n", "\\n")
    })
}

export default {
    saveShow,
    saveAct,
    getShow,
    getInfo,
    saveInfo,
}