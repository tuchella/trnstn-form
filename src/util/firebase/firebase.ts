import * as fb from "./fb";

import { FIREBASE_API_KEY } from '@/util/keys';
import { convertShows } from "./converters";
import Collection from "./Collection";

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
const db = fb.getFirestore(firebaseApp);
const fa = fb.getAuth(firebaseApp);
const fbs = fb.getStorage(firebaseApp);

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
    return fb.deleteObject(storageRef).then(() => true).catch(() => false);
  }
}