import { showsOnlyCollection } from "@/firebase";
import fb from 'firebase/app'
import 'firebase/firestore'

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

export function searchShows(filter: ShowSearchFilter, offset?: Date): Promise<Array<ShowSearchResult>> {
  let query: fb.firestore.Query<fb.firestore.DocumentData> = showsOnlyCollection

  if (filter.residency) {
    query = query.where("title", "==", filter.residency);
  }
  if (filter.from) {
    query = query.where("date", ">=", new Date(Date.parse(filter.from)));
  }
  if (filter.to) {
    query = query.where("date", "<=", new Date(Date.parse(filter.to)));
  }
  query = query.orderBy("date", "desc")
    .limit(10);

  if (offset) {
    query = query.startAfter(offset);
  }
  return query.get().then(data => {
    const shows:Array<ShowSearchResult> = [];
    data.forEach(s => {
      const d = s.data();
      shows.push(new ShowSearchResult(
        d.id,
        d.title,
        d.date
      ));
    })
    return shows;

  });
}