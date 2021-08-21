import { showsCollection, infoDoc, storage, confidentialCollection, isSignedIn } from '../firebase';
import { Act, Show } from './types';
import uuid from './uuid';

const REDACTED_MAIL = /^.\*\*\*.@.\*\*.\*\*.$/;
const REDACTED_PHONE = /^.\*\*\*.$/;
  
async function saveShow(show:Show) {
    const files = storage.ref();

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
        await confidentialCollection.doc(show.id).set(confidential);
    }

    for (const act of show.acts) {
        act.img = await act.img.save();
    }
    /*
    show.acts.filter(act => act.img.file).forEach(async (act) => {
        if (!act.img.url) {
            act.img.url = "images/" + uuid() + "-" + act.img.file.name;
        }
        await files
            .child(act.img.url)
            .put(act.img.file)
            .then(() => (act.img.file = null));
    });
    */
    return await showsCollection.doc(show.id).set(show);
}

async function saveAct(show: Show, act: Act) {
    const s = await getShow(show.id);
    const i = s.acts.findIndex(a => a.id == act.id);
    if (i > 0) {
        s.acts[i] = act;
        act.img = await act.img.save();
        await showsCollection.doc(s.id).update({
            acts: s.acts
        })
        return s;
    } else {
        throw new Error(`Act ${act.id} not valid`);
    }
}

function getShow(id?:string): Promise<Show> {
    if (!id) {
        return Promise.reject("Can not find show without id");
    }

    return showsCollection
            .doc(id)
            .get()
            .then(doc => {
                if (!doc.exists) {
                    throw 'No such document';
                }
                return doc.data()!;
            })
            .then(show => {
                console.log(show);
                if (show && isSignedIn()) {
                    confidentialCollection.doc(show.id).get().then(c => {
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
        infoDoc.get()
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
    return infoDoc.update({
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