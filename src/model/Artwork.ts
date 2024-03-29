import { app } from "@/util/app";
import uuid from "@/util/uuid";
import { basename } from 'path';
import axios, { AxiosResponse } from "axios";

export interface Artwork {
    readonly src: string;
    readonly url?: string;
    readonly name: string;
    readonly isStored: boolean;

    save(): Promise<Artwork>;
    update(file:File): Promise<Artwork>;
    download(): Promise<Blob> | undefined;
    delete?() : Promise<any>;
}

export function isArtwork(object: any): object is Artwork {
    return typeof object === 'object' && 'src' in object && 'name' in object && 'isStored' in object;
}

class NoArtwork implements Artwork {
    readonly src  = "";
    readonly name = "";
    readonly isStored = false;

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
    url: string;
    readonly isStored = true;

    constructor(url:string) {
        this.url = url;
    }

    get src() {
        return this.url;
    }
    get name() {
        return basename(this.url)
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
    readonly isStored = true;

    private constructor(ref: string, url:string) {
        this.ref = ref;
        this._src = url;
    }

    static async load(ref:string): Promise<Artwork> {
        try {
            const url = await app.storage.getDownloadURL(ref);
            return new FirebaseArtwork(ref, url);
        } catch {
            return NO_ARTWORK;
        }
    }

    get src() {
        return this._src;
    }
    get url() {
        return this.ref;
    }
    get name() {
        return basename(this.ref)
    }

    async save() {
        if (this.content) {
            await app.storage.put(this.ref, this.content);
            this.content = undefined;
        }
        return this;
    }
    async update(f:File) {
        const upload = await UploadedArtwork.fromFile(f);
        this.content = f;
        this._src = upload.src;
        return this;
    }
    
    async download() {
        if (this.content) {
            return Promise.resolve(this.content);
        } else {
            return axios.get(this._src, { responseType: 'blob' })
                .then((res:AxiosResponse) => res.data as Blob)
        }
    }

    delete() {
        return app.storage.delete(this.ref);
    }
}

export class UploadedArtwork implements Artwork {
    readonly file:File; 
    private _src:string;
    readonly isStored = false;

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
        return this.file.name;
    }
    
    get name() {
        return this.file.name;
    }

    async save() {
        const ref = "images/" + uuid() + "-" + this.file.name;
        await app.storage.put(ref, this.file)
        return FirebaseArtwork.load(ref);
    }
    async update(f:File) {
        return UploadedArtwork.fromFile(f);
    }
    download() {
        return Promise.resolve(this.file);
    }
}

export function getFileName(a:Artwork):string {
    if (!a.url) {
        return ""; 
    }
    const url = a.url;
    if (url.lastIndexOf('/') >= 0) {
        return url.substring(url.lastIndexOf('/') + 1);
    } else {
        return url;
    }
}