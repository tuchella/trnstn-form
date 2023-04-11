
import App from "@/model/App";
import AppAuth from "@/model/AppAuth";
import AppProp from "@/model/AppProp";
import AppStorage from "@/model/AppStorage";
import { AppCollection } from "@/model/AppCollection";
import { Show } from "@/model/Show";
import { User } from "@/model/User";


import { FIREBASE_API_KEY } from '@/util/keys';

import * as fb from "./fb";
import FirebaseCollection from "./FirebaseCollection";
import { convertShows } from "./converters";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "trnstn-83e1a.firebaseapp.com",
  databaseURL: "https://trnstn-83e1a-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "trnstn-83e1a",
  storageBucket: "trnstn-83e1a.appspot.com",
  messagingSenderId: "639015505411",
  appId: "1:639015505411:web:5b39a402965a59c9ff0836"
};

// collection references
export default class FirebaseApp implements App {
  showsCollection: AppCollection<Show>;
  confidentialCollection: AppCollection<any>;
  showsSearchCollection: AppCollection<any>;
  infoDoc: AppProp<string>;
  auth: AppAuth;
  storage: AppStorage;

  constructor() {
    const firebaseApp = fb.initializeApp(firebaseConfig);
    const db = fb.getFirestore(firebaseApp);
    const fa = fb.getAuth(firebaseApp);
    const fbs = fb.getStorage(firebaseApp);

    this.showsCollection = new FirebaseCollection(fb.collection(db, 'shows').withConverter(convertShows));
    this.confidentialCollection = new FirebaseCollection(fb.collection(db, 'confidential'));
    this.showsSearchCollection = new FirebaseCollection(fb.collection(db, 'shows'));
    this.infoDoc = new FirebaseProp(fb.doc(fb.collection(db, 'meta'), 'info'));
    this.auth = {
      isSignedIn: function () {
        return fa.currentUser ? true : false
      },
      signIn: function (email: string, pass: string): Promise<User> {
        return fb.signInWithEmailAndPassword(fa, email, pass).then(fb => {
          const name = fb.user?.displayName || fb.user?.email;
          return name ? new User(name, true) : new User("Anonymous", false);
        });
      },
      signOut: function () {
        return fb.signOut(fa);
      },
      onAuthStateChanged: function (observer: () => void) {
        return fb.onAuthStateChanged(fa, observer);
      }
    }
    this.storage = {
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
  }
}

class FirebaseProp implements AppProp<string> {
  ref: fb.DocumentReference<fb.DocumentData>;

  constructor(ref: fb.DocumentReference<fb.DocumentData>) {
    this.ref = ref;
  }

  async get(): Promise<string> {
    const doc = await fb.getDoc(this.ref)
    if (doc.exists()) {
      const info: any = doc.data()
      return info.text.replaceAll("\\n", "\n");
    } else {
      throw 'No such document';
    }
  }

  async set(text: string): Promise<void> {
    return fb.updateDoc(this.ref, {
      text: text.replaceAll("\n", "\\n")
    });
  }
}