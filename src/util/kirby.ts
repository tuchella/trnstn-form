import axios, { AxiosResponse } from 'axios';
import { auth, storage } from '../firebase';
import { stringToDate, dateToString } from './date';
import ContextualPromiseChain from '../model/ContextualPromiseChain';
import { Act, ScheduledShow, ScheduledShowImpl, Show, User } from './types';
import { Artwork } from '@/model/Artwork';


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


function getUser(): Promise<User> {
    return kirxios.get("/api/auth?select=content,name,username")
      .then(response => response.data.data)
      .then(response => {
        const user = response;
        // do something with the page data
        return auth.signInWithEmailAndPassword(user.username, user.content.firebasekey).then(fb => {
            const name = fb.user?.displayName || fb.user?.email;
            return name ? new User(name, true) : new User("Anonymous", false);
        });
      })
      .catch(error => {
        if (error.response && error.response.status == 403) {
            // user is simply not logged in, that's ok.
            return new User("Anonymous", false);
        }
        // something went wrong
        console.error(error);
        return new User("ERROR", false);
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

function publishShow(show: Show, act: Act, 
        progressCallback:ProgressListener = (_) => {}):Promise<PageId> {

    const listener = new ProgressListenerWrapper(progressCallback, 5);

    return ContextualPromiseChain
        .withContextProvidedBy(createEpisodePage(show, act))
        .andInitialValue(act.img)
        .then(listener.notify(1))
        .then(downloadImage)
        .then(listener.notify(2))
        .then(uploadImageToCMS)
        .then(listener.notify(3))
        .then(updateEpisodeImage)
        .then(listener.notify(4))
        .then(setStatusToListed)
        .then(listener.notify(5))
        .then((ctx:PageId, res:any) => {
            console.log(ctx, res);
            return Promise.resolve(res);
        })
        .dropContext();
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


/**
 * 
 * @param {Show} show 
 * @param {Act} act 
 * @returns {Promise<PageId>} The episode page id.
 */
function createEpisodePage(show: Show, act: Act): Promise<PageId> {
    const title = show.acts.length > 1 ? show.title + " w/ " + act.name : show.title;
    const parent = show.residency ? `shows+${show.residency}` : `guests`;
    const slug = slugify(title);

    return kirxios.post(`/api/pages/${parent}/children`, {
        slug: slug,
        title: title,
        template: 'episode',
        content: {
            title: title,
            episode_visual: "none.jpg",
            episode_date_enregistrement: dateToString(show.date) + " " + show.timeStart,
            episode_description: act.bio,
            episode_tags: show.tags.join(", "),
            episode_url_mixcloud: act.mcLink || "https://trnstnradio.com",
            episode_tracklist: ""
        }
    }).then(resp => resp.data.data.id.replaceAll('/','+'));
}

function downloadImage(_:any, img?:Artwork) {
    return img?.download() || Promise.reject("No artwork found");
}

function uploadImageToCMS(page:PageId, img:Blob) {
    const formData = new FormData();
    formData.append('file', img);
    return kirxios({
        method: "post",
        url: `/api/pages/${page}/files`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data.data.filename)
}

function updateEpisodeImage(page:PageId, filename:string) {
    return kirxios.patch(`/api/pages/${page}`, {
        episode_visual: filename
    });
}

function setStatusToListed(page:PageId, res:AxiosResponse) {
    console.log(res);
    return kirxios.patch(`/api/pages/${page}/status`, {
        status: 'listed'
    }).then(r => r.data.data.url);
}

function slugify(str: string): string {
    const r = Math.floor(Math.random()*1000);
    return str.replaceAll(" ", "-").replace(/[^0-9-a-z]/gi, '').toLowerCase() + r;
}

export default {
    getUser,
    getScheduledShows,
    publishShow,
}