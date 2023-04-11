import { Act, Show } from '@/model/Show';
import ContactInfo from '@/model/ContactInfo';
import { app } from '@/util/app';
import uuid from './uuid';

async function saveShow(show:Show) {
    if (!show.id) {
        show.id = show.title.replaceAll(' ','').substring(0,4).toUpperCase() + uuid().substring(0,13).replace('-','');
    }
    if (!show.createdAt) {
        show.createdAt = new Date();
    }
    if (show.contact.isSomeChanged) {
        if (show.contact.isEmpty) {
            await app.confidentialCollection.delete(show.id)
        } else {
            
            await app.confidentialCollection.updateOrCreate(
                show.id, show.contact.changedValues);
        }
    }
    for (const act of show.acts) {
        act.img = await act.img.save();
        act.techRider = await act.techRider.save();
    }
    
    return await app.showsCollection.overwrite(show.id, show);
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
    act.techRider = await act.techRider.save();
    if (fields.length > 0) {
        for (const f of fields) {
            const k = "acts." + act.id + "." + f;
            const v = getFieldValue(act, f);
            data.set(k, v);
        }
    } else {
        data.set("acts." + act.id, act);
        data.get("acts." + act.id).index = show.acts.indexOf(act);
    }
    return app.showsCollection.update(show.id!, data);
}

async function deleteShow(id?:string) {
    if (!id) {
        return;
    }
    const show = await app.showsCollection.get(id)
    await app.showsCollection.delete(id);
    for (const act of show.acts) {
        if (act.img.delete) {
            await act.img.delete();
        }
        if (act.techRider.delete) {
            await act.techRider.delete();
        }
    }
}

async function getShow(id?:string): Promise<Show> {
    if (!id) {
        return Promise.reject("Can not find show without id");
    }

    const show = await app.showsCollection.get(id)

    if (show && show.id && app.auth.isSignedIn()) {
        const confidential = await app.confidentialCollection.getMaybe(show.id);
        confidential.ifPresent((c:any) => {
            // LEGACY MIGRATION CODE
            // in the past we stored contact info as a single 
            // string value.
            if (c.contact) {
                show.contact = new ContactInfo(c.contact);
            } else {
                show.contact = new ContactInfo(c.email, c.phone);
            }
        });
    }
    return show;
}

function getInfo():Promise<string> {
    return app.infoDoc.get();
}

function saveInfo(text:string) {
    return app.infoDoc.set(text);
}

export default {
    saveShow,
    saveAct,
    deleteShow,
    getShow,
    getInfo,
    saveInfo,
}