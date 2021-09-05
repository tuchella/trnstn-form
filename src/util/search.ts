import { showsCollection } from "@/util/firebase/firebase";

export class ShowSearchFilter {
  residency?: string;
  from?: string;
  to?: string;
}

export class ShowSearchResult {
  readonly id: string;
  readonly title: string;
  readonly date: Date;

  constructor(id: string, title: string, date: Date) {
    this.id = id
    this.title = title
    this.date = date
  }
}

export async function searchShows(filter: ShowSearchFilter, offset?: Date): Promise<ShowSearchResult[]> {
  const s = await showsCollection.query()
    .whereMaybe("title", "==", filter.residency)
    .whereDateMaybe("date", ">=", filter.from)
    .whereDateMaybe("date", "<=", filter.to)
    .orderBy("date", "desc")
    .limit(10)
    .offset(offset)
    .get();
  return s.map((d:any) => new ShowSearchResult(d.id, d.title, d.date));
}