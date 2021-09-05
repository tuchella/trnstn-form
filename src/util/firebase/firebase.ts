import * as fb from "./fb";

import { StaticArtwork, FirebaseArtwork, NO_ARTWORK } from '@/model/Artwork';
import { Act, Show } from '@/util/types';
import { FIREBASE_API_KEY } from '@/util/keys';
import FirestoreQuery from "./FirestoreQuery";
import Maybe from "@/model/Maybe";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "trnstn-83e1a.firebaseapp.com",
  databaseURL: "https://trnstn-83e1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trnstn-83e1a",
  storageBucket: "trnstn-83e1a.appspot.com",
  messagingSenderId: "639015505411",
  appId: "1:639015505411:web:5b39a402965a59c9ff0836"
};

const firebaseApp = fb.initializeApp(firebaseConfig);

//fb.initializeApp(firebaseConfig)

// utils

const db = fb.getFirestore(firebaseApp);
const fa = fb.getAuth(firebaseApp);

const convertActs = {
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
      comment: act.comment,
      img: {

      }
    };
    if (act.img.url) {
      data.img.url = act.img.url;
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

    const img: string | undefined = data.img.url;
    if (img) {
      if (img.startsWith("http://") || img.startsWith("https://")) {
        act.img = new StaticArtwork(img);
      } else {
        FirebaseArtwork.load(img)
          .then(artwork => act.img = artwork);
      }
    }
    return act;
  }

}

const convertShows: fb.FirestoreDataConverter<Show> = {
  toFirestore: (show: Show) => {
    const data: fb.DocumentData = {
      id: show.id,
      title: show.title,
      number: show.number,
      date: show.date,
      contact: show.contact,
      comment: show.comment,
      acts: {},
      tags: show.tags,
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
    show.tags = data.tags;
    show.residency = data.residency;
    show.createdAt = data.createdAt;


    return show;
  }
};

export type CollectionName = "shows" | "confidential" | "shows-light";

class Collection<T> {
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

// collection references
export const showsCollection = new Collection(fb.collection(db, 'shows').withConverter(convertShows));
export const confidentialCollection = new Collection(fb.collection(db, 'confidential'))
export const showsOnlyCollection = new Collection(fb.collection(db, 'shows'));

const infoRef = fb.doc(fb.collection(db, 'meta'), 'info')
export const infoDoc = {
  async get(): Promise<string> {
    const doc = await fb.getDoc(infoRef)
    if (doc.exists()) {
      const info: any = doc.data()
      return info.text.replaceAll("\\n", "\n");
    } else {
      throw 'No such document';
    }
  },
  async set(text:string):Promise<void> {
    return fb.updateDoc(infoRef, {
      text: text.replaceAll("\n", "\\n")
    });
  }
}


export const auth = {
  isSignedIn: function () {
    return fa.currentUser ? true : false
  },
  signIn: function (email: string, pass: string): Promise<fb.UserCredential> {
    return fb.signInWithEmailAndPassword(fa, email, pass);
  },
  signOut: function () {
    return fb.signOut(fa);
  },
  onAuthStateChanged: function (observer: () => void) {
    return fb.onAuthStateChanged(fa, observer);
  }
};


const fbs = fb.getStorage(firebaseApp);

export const storage = {
  put(ref: string, data: Blob | File) {
    const storageRef = fb.ref(fbs, ref);
    return fb.uploadBytes(storageRef, data);
  },
  getDownloadURL(ref: string) {
    const storageRef = fb.ref(fbs, ref);
    return fb.getDownloadURL(storageRef);
  },
  delete(ref: string) {
    const storageRef = fb.ref(fbs, ref);
    return fb.deleteObject(storageRef);
  }
}



/*
// export utils/refs
export {
  isSignedIn,
  showsCollection,
  showsOnlyCollection,
  confidentialCollection,
  infoDoc,
}
*/