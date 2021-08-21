import { storage } from "@/firebase";
import uuid from "@/util/uuid";
import axios, { AxiosResponse } from "axios";
//import axios, { AxiosResponse } from "axios";

export interface Artwork {
    readonly src: string;
    readonly url?: string;
    save(): Promise<Artwork>;
    update(file:File): Promise<Artwork>;
    download(): Promise<Blob> | undefined;
}

class NoArtwork implements Artwork {
    readonly src:string = "";

    save() { 
        return Promise.resolve(this)
    }
    async update(f:File) {
        return UploadedArtwork.fromFile(f);
    }
    download() {
        return undefined;
    }
}

export const NO_ARTWORK:Artwork = new NoArtwork(); 

export class StaticArtwork implements Artwork {
    url: string

    constructor(url:string) {
        this.url = url;
    }

    get src() {
        return this.url;
    }

    save() {
        // no need to save contents...
        return Promise.resolve(this);
    }
    update(f:File) {
        return Promise.reject("Can not update artwork already stored in CMS");
    }
    
    download() {
        return undefined;
    }
}

export class FirebaseArtwork implements Artwork {
    private _src: string;
    readonly ref: string;
    private content?: Blob;

    private constructor(ref: string, url:string) {
        this.ref = ref;
        this._src = url;
    }

    static async load(id:string): Promise<FirebaseArtwork> {
        const url = await storage.ref(id).getDownloadURL();
        return new FirebaseArtwork(id, url);
    }

    get src() {
        return this._src;
    }
    get url() {
        return this.ref;
    }

    async save() {
        if (this.content) {
            await storage.ref(this.ref).put(this.content);
            this.content = undefined;
        }
        return this;
    }
    async update(f:File) {
        return UploadedArtwork.fromFile(f).then(a => {
            this.content = f;
            this._src = a.src;
            return this;
        })
    }
    
    async download() {
        if (this.content) {
            return Promise.resolve(this.content);
        } else {
            return axios.get(this._src, { responseType: 'blob' })
                .then((res:AxiosResponse) => res.data as Blob)
        }
    }
}

export class UploadedArtwork implements Artwork {
    readonly file:File; 
    private _src:string;

    private constructor(file:File, content:string) {
        this.file = file;
        this._src = content;
    }

    static async fromFile(file:File): Promise<UploadedArtwork> {
        return new Promise<UploadedArtwork>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                const data = reader.result;
                if(data && typeof data === "string") {
                    // result should always be string not an ArrayBuffer
                    // as the result was obtained by calling `readAsDataURL`
                    resolve(new UploadedArtwork(file, data));
                } else {
                    reject("Failed to load file " + file.name + ": " + reader.error);
                }
                
            };
        });
    }

    get src() {
        return this._src;
    }

    get url(): string {
        throw "get URL should not be called on an Uploaded Artwork :(";
    }

    async save() {
        const ref = "images/" + uuid() + "-" + this.file.name;
        await storage.ref(ref).put(this.file)
        return FirebaseArtwork.load(ref);
    }
    async update(f:File) {
        return UploadedArtwork.fromFile(f);
    }
    download() {
        return Promise.resolve(this.file);
    }
}