import { AppCollectionQuery, AppCollectionQueryField, AppCollectionQueryOrder, AppCollectionQueryResult, AppQueryFieldValue, WhereOp } from "@/model/AppCollection";
import * as fb from "./fb";

class FirestoreQueryResult implements AppCollectionQueryResult {
  private readonly snapshot:fb.QuerySnapshot<fb.DocumentData>;

  constructor(snapshot: fb.QuerySnapshot<fb.DocumentData>) {
    this.snapshot = snapshot
  }

  map<T>(f:(data:any) => T): T[] {
    const out:T[] = [];
    this.snapshot.forEach(s => {
      const data = s.data();
      out.push(f(data));
    })
    return out;
  }
}

export default class FirestoreQuery implements AppCollectionQuery {
  private col: fb.CollectionReference;
  private filters: AppCollectionQueryField[] = [];
  private _orderBy: AppCollectionQueryOrder[] = [];
  private _limit?: number;
  private _offsets: AppQueryFieldValue[] = [];

  constructor(col: fb.CollectionReference) {
    this.col = col;
  }

  where(field: string, op: WhereOp, value: any): FirestoreQuery {
    this.filters.push({
      field: field,
      op: op,
      value: value!
    });
    return this;
  }


  whereMaybe(field: string, op: WhereOp, value?: string): FirestoreQuery {
    if (value === undefined) {
      return this;
    } else {
      return this.where(field, op, value!);
    }
  }

  whereDateMaybe(field: string, op: WhereOp, value?: string): FirestoreQuery {
    if (value === undefined) {
      return this;
    } else {
      return this.where(field, op, new Date(Date.parse(value)));
    }
  }

  orderBy(field: string, direction: "asc" | "desc"): FirestoreQuery {
    this._orderBy.push({
      field: field,
      direction: direction
    })
    return this;
  }

  offset(offset: AppQueryFieldValue[]) {
    this._offsets = offset;
    return this;
  }

  limit(l: number): FirestoreQuery {
    this._limit = l;
    return this;
  }

  async get(): Promise<FirestoreQueryResult> {
    const conditions: fb.QueryConstraint[] = this.filters.map(w => fb.where(w.field, w.op, w.value));
    this._orderBy.forEach(o => {
      conditions.push(fb.orderBy(o.field, o.direction))
    });
    if (this._limit) {
      conditions.push(fb.limit(this._limit));
    }
    if (this._offsets.length > 0) {
      conditions.push(fb.startAfter(...this._offsets));
    }

    const q = fb.query(this.col, ...conditions);
    const docs = await fb.getDocs(q);
    return new FirestoreQueryResult(docs);
  }
}