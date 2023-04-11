import { AppCollection, AppCollectionQuery } from "@/model/AppCollection";
import { isArtwork } from "@/model/Artwork";
import Maybe from "@/model/Maybe";
import { Act, Show } from "@/model/Show";

import { convertActs, convertShows } from "./converters";
import * as fb from "./fb";
import FirestoreQuery from "./FirebaseQuery";

export default class FirebaseCollection<T> implements AppCollection<T> {
  private readonly col: fb.CollectionReference<T>;

  constructor(col: fb.CollectionReference<T>) {
    this.col = col
  }

  async get(id: string): Promise<T> {
    const doc = await fb.getDoc(fb.doc(this.col, id));
    if (!doc.exists()) {
      throw `No such document ${this.col.id}/${id}`;
    }
    return doc.data();
  }

  async delete(id: string) {
    const doc = fb.doc(this.col, id);
    return fb.deleteDoc(doc);
  }

  async getMaybe(id: string): Promise<Maybe<T>> {
    const doc = await fb.getDoc(fb.doc(this.col, id));
    if (!doc.exists()) {
      return Maybe.empty();
    }
    return Maybe.from(doc.data());
  }

  overwrite(id: string, content: any) {
    const doc = fb.doc(this.col, id);
    
    return fb.setDoc(doc, content);
  }

  async updateOrCreate(id: string, content: Map<string, any>) {
    //const doc = await fb.getDoc(fb.doc(this.col, id));
    //if (!doc.exists()) {
      // FIX: Data must be an object, but it was: a custom Map object
    const doc = fb.doc(this.col, id);
    const data:object = Object.fromEntries(content);
    return fb.setDoc(doc, data, { merge: true });
    
    //} else {
    //  return this.update(id, content);
    //}
  }

  update(id: string, content: Map<string, any>) {
    const doc = fb.doc(this.col, id);
    const data: fb.UpdateData = {};
    content.forEach((v, k) => {
      if (v === undefined) {
        data[k] = fb.deleteField();
      } else if (v instanceof Act) {
        data[k] = convertActs.toFirestore(v);
      } else if (v instanceof Show) {
        data[k] = convertShows.toFirestore(v);
      } else if (isArtwork(v)) {
        data[k] = { url: v.url || null };
      } else {
        data[k] = v;
      }
    })
    return fb.updateDoc(doc, data); 
  }

  query():AppCollectionQuery {
    return new FirestoreQuery(this.col);
  }
}