import { app } from "@/util/app";
import { Timestamp } from "firebase/firestore/lite";

export class ShowSearchFilter {
  residency?: string;
  from?: string;
  to?: string;
}

export type ShowStatus = "open" | "uploaded" | "published";

export class ShowSearchResult {
  readonly id: string;
  readonly title: string;
  readonly date: Date;
  readonly status: ShowStatus;

  constructor(id: string, title: string, date: Date, status: ShowStatus) {
    this.id = id
    this.title = title
    this.date = date
    this.status = status
  }
}

interface QueryResultShow {
  id: string;
  title: string;
  date: Date;
  acts: {
    [id: string]: {
      mcLink?: string;
      pageLink?: string;
    };
  };
} 

export async function searchShows(filter: ShowSearchFilter, offset?: Date, offsetId?: string): Promise<ShowSearchResult[]> {
  const offsets = offset && offsetId ? [offset, offsetId] : []; 
  const query = app.showsSearchCollection.query()
    .whereMaybe("title", "==", filter.residency)
    .whereDateMaybe("date", ">=", filter.from)
    .whereDateMaybe("date", "<=", filter.to)
    .orderBy("date", "desc")
    .orderBy("id", "desc")
    .limit(10)
    .offset(offsets);
  const s = await query.get();
  return s.map((d:QueryResultShow) => {
    const acts = Object.values(d.acts);
    let status:ShowStatus = "open";
    if (acts.every(a => a.pageLink)) {
      status = "published"
    } else if (acts.every(a => a.mcLink)) {
      status = "uploaded"
    }
    
    return new ShowSearchResult(d.id, d.title, d.date, status);
  });
}