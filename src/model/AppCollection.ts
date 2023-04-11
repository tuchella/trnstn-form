import Maybe from "./Maybe";

export interface AppCollection<T> {
    get(id: string): Promise<T>;
    delete(id: string): Promise<void>;
    getMaybe(id: string): Promise<Maybe<T>>;
    overwrite(id: string, content: any): Promise<void>;
    updateOrCreate(id: string, content: Map<string, any>): Promise<void>;
    update(id: string, content: Map<string, any>): Promise<void>;
    query(): AppCollectionQuery;
}

export interface AppCollectionQueryResult {
    map<T>(f:(data:any) => T): T[];
}

export type AppQueryFieldValue = string | number | Date | undefined;

export interface AppCollectionQuery {
    where(field: string, op: WhereOp, value: any): AppCollectionQuery;
    whereMaybe(field: string, op: WhereOp, value?: string): AppCollectionQuery;
    whereDateMaybe(field: string, op: WhereOp, value?: string):AppCollectionQuery;
    orderBy(field: string, direction: "asc" | "desc"): AppCollectionQuery
    offset(offset: AppQueryFieldValue[]) : AppCollectionQuery;
    limit(l: number):AppCollectionQuery
    get(): Promise<AppCollectionQueryResult>
}

export declare type WhereOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';

export interface AppCollectionQueryField {
  field: string;
  op: WhereOp;
  value: any;
}

export interface AppCollectionQueryOrder {
  field: string;
  direction?: "asc" | "desc";
}