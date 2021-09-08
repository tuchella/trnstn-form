import * as fb from "./fb";

export type WhereOp = fb.WhereFilterOp;

interface Query {
  field: string;
  op: WhereOp;
  value: any;
}

interface QueryOrder {
  field: string;
  direction?: "asc" | "desc";
}

class FirestoreQueryResult {
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

export default class FirestoreQuery {
  private col: fb.CollectionReference;
  private filters: Query[] = [];
  private _orderBy?: QueryOrder;
  private _limit?: any;
  private _offset?: any;

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
    this._orderBy = {
      field: field,
      direction: direction
    }
    return this;
  }

  offset(offset?: any) {
    this._offset = offset;
    return this;
  }

  limit(l: number): FirestoreQuery {
    this._limit = l;
    return this;
  }

  async get(): Promise<FirestoreQueryResult> {
    const conditions: fb.QueryConstraint[] = this.filters.map(w => fb.where(w.field, w.op, w.value));
    if (this._orderBy) {
      conditions.push(fb.orderBy(this._orderBy.field, this._orderBy.direction))
    }
    if (this._limit) {
      conditions.push(fb.limit(this._limit));
    }
    if (this._offset) {
      conditions.push(fb.startAfter(this._offset));
    }

    const q = fb.query(this.col, ...conditions);
    const docs = await fb.getDocs(q);
    return new FirestoreQueryResult(docs);
  }
}