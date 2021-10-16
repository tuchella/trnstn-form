import { Artwork, FirebaseArtwork, NO_ARTWORK, StaticArtwork } from "@/model/Artwork";
import { Act, Show } from "@/util/types";
import * as fb from "./fb";

export const convertActs = {
  toFirestore: (act: Act) => {
    const data: fb.DocumentData = {
      id: act.id,
      name: act.name,
      bio: act.bio,
      city: act.city,
      collective: act.collective,
      transport: act.transport,
      pronouns: act.pronouns,
      scLink: act.scLink,
      igLink: act.igLink,
      comment: act.comment,
      img: {},
      techRider: {},
      tags: act.tags,
    };
    if (act.img.url) {
      data.img.url = act.img.url;
    }
    if (act.techRider.url) {
      data.techRider.url = act.techRider.url;
    }
    if (act.mcLink) {
      data.mcLink = act.mcLink;
    }
    if (act.pageLink) {
      data.pageLink = act.pageLink;
    }
    return data;
  },
  fromFirestore: (data: any) => {
    const act = new Act(data.id, data.name);
    act.bio = data.bio;
    act.comment = data.comment;
    act.mcLink = data.mcLink;
    act.pageLink = data.pageLink;
    act.city = data.city;
    act.collective = data.collective;
    act.transport = data.transport;
    act.pronouns = data.pronouns;
    act.scLink = data.scLink;
    act.igLink = data.igLink;
    act.tags = data.tags;

    getfileForUrl(data.img?.url).then(file => act.img = file);
    getfileForUrl(data.techRider?.url).then(file => act.techRider = file);

    return act;
  }
}

function getfileForUrl(url: string | undefined): Promise<Artwork> {
  if (url) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return Promise.resolve(new StaticArtwork(url));
    } else {
      return FirebaseArtwork.load(url);
    }
  } else {
    return Promise.resolve(NO_ARTWORK);
  }
}

export const convertShows: fb.FirestoreDataConverter<Show> = {
  toFirestore: (show: Show) => {
    const data: fb.DocumentData = {
      id: show.id,
      title: show.title,
      number: show.number,
      date: show.date,
      contact: show.contact,
      comment: show.comment,
      acts: {},
      createdAt: show.createdAt || Date.now(),
    }
    show.acts.map(convertActs.toFirestore).forEach((a, i) => {
      data.acts[a.id] = a;
      data.acts[a.id].index = i;
    });

    if (show.timeStart) {
      data.timeStart = show.timeStart;
    }
    if (show.timeEnd) {
      data.timeEnd = show.timeEnd;
    }
    if (show.residency) {
      data.residency = show.residency;
    }
    return data;
  },
  fromFirestore: (snap: fb.QueryDocumentSnapshot) => {
    const show = new Show()
    const data = snap.data();
    show.id = data.id;
    show.title = data.title;
    show.number = data.number;
    show.timeStart = data.timeStart;
    show.timeEnd = data.timeEnd;
    if (data.date && data.date.toDate) {
      show.date = data.date.toDate();
    } else {
      show.date = data.date;
    }

    show.contact = data.contact;
    show.comment = data.comment;
    show.acts = Object.values(data.acts)
      .sort((a: any, b: any) => a.index - b.index)
      .map(convertActs.fromFirestore);
    show.residency = data.residency;
    show.createdAt = data.createdAt;
    return show;
  }
};