import Maybe from "@/model/Maybe";
import { Act, Show } from "../types";
import { convertActs, convertShows } from "./converters";
import * as fb from "./fb";
import FirestoreQuery from "./FirestoreQuery";

export default class Collection<T> {
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
      } else {
        data[k] = v;
      }
    })
    return fb.updateDoc(doc, data);
  }

  query() {
    return new FirestoreQuery(this.col);
  }
}