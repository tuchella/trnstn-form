import { Show } from "@/model/Show";
import AppAuth from "./AppAuth";
import { AppCollection } from "./AppCollection";
import AppProp from "./AppProp";
import AppStorage from "./AppStorage";

export default interface App {
    showsCollection:AppCollection<Show>;
    confidentialCollection:AppCollection<any>;
    showsSearchCollection:AppCollection<any>;
    infoDoc:AppProp<string>;
    auth: AppAuth;
    storage: AppStorage;
}