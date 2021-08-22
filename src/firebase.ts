import fb from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import { StaticArtwork, FirebaseArtwork, NO_ARTWORK } from './model/Artwork';
import { Act, Show } from './util/types';
import { FIREBASE_API_KEY } from './util/keys';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "trnstn-83e1a.firebaseapp.com",
  databaseURL: "https://trnstn-83e1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trnstn-83e1a",
  storageBucket: "trnstn-83e1a.appspot.com",
  messagingSenderId: "639015505411",
  appId: "1:639015505411:web:5b39a402965a59c9ff0836"
};

fb.initializeApp(firebaseConfig)

// utils
const db = fb.firestore()
const auth = fb.auth()
const storage = fb.storage()

const convertActs = {
  toFirestore: (act: Act) => {
    const data:any = {
      id: act.id,
      name: act.name,
      bio: act.bio,
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
    return data;
  },
  fromFirestore: (data: any) => {
    const act = new Act(data.id, data.name);
    act.bio = data.bio;
    act.comment = data.comment;
    act.mcLink = data.mcLink;

    const img:string | undefined = data.img.url;
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

const convertShows:fb.firestore.FirestoreDataConverter<Show> = {
  toFirestore: (show: Show) => {
    const data:fb.firestore.DocumentData = {
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
    show.acts.map(convertActs.toFirestore).forEach((a,i) => {
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
    console.log(data);
    return data;
  },
  fromFirestore: (snap: fb.firestore.QueryDocumentSnapshot) => {
    const show = new Show()
    const data = snap.data();
    show.id = data.id;
    show.title = data.title;
    show.number = data.number;
    show.timeStart = data.timeStart;
    show.timeEnd = data.timeEnd;
    show.date = data.date;
    show.contact = data.contact;
    show.comment = data.comment;
    show.acts = Object.values(data.acts)
      .sort((a:any,b:any) => a.index - b.index)
      .map(convertActs.fromFirestore);
    show.tags = data.tags;
    show.residency = data.residency;
    show.createdAt = data.createdAt;
    

    return show;
  }
};

// collection references
const showsCollection = db.collection('shows').withConverter(convertShows);
const confidentialCollection = db.collection('confidential')
const showsOnlyCollection = db.collection('shows');

const infoDoc = db.collection('meta').doc('info')

function isSignedIn() {
  return auth.currentUser ? true : false
}

// export utils/refs
export {
  db,
  auth,
  isSignedIn,
  storage,
  showsCollection,
  showsOnlyCollection,
  confidentialCollection,
  infoDoc,
}