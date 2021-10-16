import axios, { AxiosResponse } from 'axios';
import { extname } from 'path';
import { auth } from '@/util/firebase/firebase';
import { stringToDate, dateToString } from '@/util/date';
import ContextualPromiseChain from '@/model/ContextualPromiseChain';
import { Act, ScheduledShow, ScheduledShowImpl, Show, User } from '@/util/types';
import { Artwork, StaticArtwork } from '@/model/Artwork';
import db from '@/util/db';
import router from '@/router/index'

declare global {
    interface Window {
        csrf:string;
    }
}

const kirxios = axios.create({
    headers: {
        'X-CSRF':  window.csrf
    },
});

const SHOW_CACHE: Array<ScheduledShow> = [];

let user:User | undefined = undefined;

function getUser(): Promise<User> {
    console.log("getUser()")
    
    if (user) {
        return Promise.resolve(user);
    }

    return kirxios.get("/api/auth?select=content,name,username,email")
      .then(response => response.data.data)
      .then(response => {
        // do something with the page data
        return auth.signIn(response.email, response.content.firebasekey).then(fb => {
            const name = fb.user?.displayName || fb.user?.email;
            user = name ? new User(name, true) : new User("Anonymous", false);
            return user;
        });
      })
      .catch(error => {
        if (error.response && error.response.status == 403) {
            // user is simply not logged in, that's ok.
            user = new User("Anonymous", false);
        } else {
            console.error(error);
            // something went wrong
            user = new User("ERROR", false);
        }
        return user;
      });
}

function getScheduledShows(): Promise<Array<ScheduledShow>> {
    if (SHOW_CACHE.length == 0) {
        return kirxios.get("/form/api/upcoming-shows")
            .then(r => r.data)
            .then(json => {
                const shows: Array<ScheduledShow> = json.map((r:any) => {
                    const show = new ScheduledShowImpl(
                        r.title,
                        stringToDate(r.date),
                        r.start,
                        r.end,
                        r.residency
                    );
                    return show;
                });
                if (SHOW_CACHE.length == 0) {
                    SHOW_CACHE.push(...shows);
                }
                return shows;
            }).catch(error => {
                console.log("Failed to load upcomoing shows", error);
                return [
                    new ScheduledShowImpl(
                        "SYSTEM CURRENTLY UNAVAILABLE",
                        stringToDate("1970-01-01"),
                        "00:00",
                        "00:01"
                    )
                ];
            });
    } else {
        // we return the cached show list but return
        // a shallow copy by identity mapping...
        return Promise.resolve(SHOW_CACHE.map(x => x));
    }
}

type PageId = string;
type ProgressListener = (a:number) => void;

interface ImageUploadResult {
    url: string;
    filename: string;
}

interface DownloadedImage {
    content: Blob | string;
    filename: string;
}

function publishShow(show:Show, act:Act, 
        progressCallback:ProgressListener = (_) => {}):Promise<PageId> {

    const listener = new ProgressListenerWrapper(progressCallback, 7);
            
    return ContextualPromiseChain
        .withContextProvidedBy(createEpisodePage())
        .andInitialValue(act.img)
        .then(listener.notify(1))
        .then(downloadImage)
        .then(listener.notify(2))
        .then(uploadImageToCMS)
        .then(listener.notify(3))
        .then(updateImageUrlInFirebase)
        .then(listener.notify(4))
        .then(updateEpisodeImage)
        .then(listener.notify(5))
        .then(setStatusToListed)
        .then(listener.notify(6))
        .then(updatePageUrlInFirebase)
        .then(listener.notify(7))
        .then((ctx:PageId, res:any) => {
            console.log(ctx, res);
            return Promise.resolve(res);
        })
        .dropContext();

    async function updatePageUrlInFirebase(page:PageId, url:string): Promise<string> {
        act.pageLink = url;
        await db.saveAct(show, act, "pageLink");
        return url;
    }
    async function updateImageUrlInFirebase(page:PageId, data:ImageUploadResult): Promise<string> {
        const oldImg = act.img; 
        act.img = new StaticArtwork(data.url);
        await db.saveAct(show, act, "img.url");
        if (oldImg.delete) {
            await oldImg.delete();
        }
        return data.filename;
    }

    async function createEpisodePage(): Promise<PageId> {
        const title = show.acts.length > 1 ? show.title + " w/ " + act.name : show.title;
        const parent = show.residency ? `shows+${show.residency}` : `guests`;
        const slug = slugify(title);
    
        const resp = await kirxios.post(`/api/pages/${parent}/children`, {
            slug: slug,
            title: title,
            template: 'episode',
            content: {
                title: title,
                episode_visual: "none.jpg",
                episode_date_enregistrement: dateToString(show.date) + " " + show.timeStart,
                episode_description: act.bio,
                episode_tags: act.tags.join(", "),
                episode_url_mixcloud: act.mcLink || "https://trnstnradio.com",
                episode_tracklist: ""
            }
        })
        return resp.data.data.id.replaceAll('/','+');
    }
    
    async function downloadImage(_:PageId, img:Artwork): Promise<DownloadedImage> {
        const content = await img.download();
        return {
            content: content || img.url || "",
            filename: img.name
        }
    }
    
    async function uploadImageToCMS(page:PageId, img:DownloadedImage):Promise<ImageUploadResult> {
        if (img.content instanceof Blob) {
            const ext = extname(img.filename);
            const date = dateToString(show.date);
            const filename =  `${date}_${page}_visual${ext}`
            const formData = new FormData();
            formData.append('file', img.content, filename);
            const res = await kirxios({
                method: "post",
                url: `/api/pages/${page}/files`,
                data: formData,
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data.data;
        } else {
            // image is probably already uploaded...
            return {
                url: img.content,
                filename: img.filename
            } 
        }
    }
    
    function updateEpisodeImage(page:PageId, filename:string) {
        return kirxios.patch(`/api/pages/${page}`, {
            episode_visual: filename
        });
    }
    
    async function setStatusToListed(page:PageId, res:AxiosResponse) {
        const r = await kirxios.patch(`/api/pages/${page}/status`, {
            status: 'listed'
        })
        return r.data.data.url;
    }
    
    function slugify(str: string): string {
        const r = Math.floor(Math.random()*1000);
        return str.replaceAll(" ", "-").replace(/[^0-9-a-z]/gi, '').toLowerCase() + r;
    }
}

class ProgressListenerWrapper {
    private readonly listener: ProgressListener;
    private readonly steps: number;

    constructor(listener:ProgressListener, steps:number = 1) {
        this.listener = listener;
        this.steps = steps;
    }

    start() {
        this.listener(0.0);
    }

    notify<C, T>(n:number):(a:C,b:T)=>Promise<T> {
        return (_:C, v:T) => {
            const progress = Math.min(1.0, n/this.steps);
            this.listener(progress);
            return Promise.resolve(v);
        }
    }
}




export default {
    getUser,
    getScheduledShows,
    publishShow,
}