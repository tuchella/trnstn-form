import { Artwork, NO_ARTWORK } from "@/model/Artwork";
import ContactInfo from "@/model/ContactInfo";

export type UUID = string;
/**
 * Should have the format `HH:mm`
 */
export type TimeStr = string;

// this is stupid but i'd like to try it out
export type Tag = "ambient" | "bass" | "breakbeat" | "club" | 
    "deconstructed" | "dnb" | "ebm" | "ecology" | "electro" | 
    "electronic" | "electronica" | "experimental" | "funk" | "global" | 
    "hardcore" | "hip-hop" | "house" | "hybrid" | "italo" | "jungle" | 
    "knowledge" | "latinx" | "machines" | "minimal" | "rap" | "rave" | 
    "selectors" | "synth" | "talks" | "techno" | "traditional" | "trance" | 
    "variable";


export class Act {
    id: UUID;
    name: string;
    bio: string = "";
    img: Artwork = NO_ARTWORK;
    city: string = "";
    collective: string = "";
    transport: string = "";
    pronouns: string = "";
    scLink: string = "";
    igLink: string = "";
    tags: Array<Tag> = [];
    comment: string = "";
    mcLink?: string;
    pageLink?: string;
    techRider:Artwork = NO_ARTWORK;
    techRiderText: string = "";

    constructor(id:UUID, name:string) {
        this.id = id;
        this.name = name;
    }
}

export interface ScheduledShow {
    title: string;
    date?: Date;
    timeStart?: TimeStr;
    timeEnd?: TimeStr;
    residency?: string;
    eventRef?: string;
}

export class ScheduledShowImpl implements ScheduledShow {
    title: string;
    date?: Date;
    timeStart?: TimeStr;
    timeEnd?: TimeStr;
    residency?: string;
    eventRef?: string;

    constructor(title:string, date:Date, start:TimeStr, end:TimeStr, residency?:string, eventRef?:string ) {
        this.title = title;
        this.date = date;
        this.timeStart = start;
        this.timeEnd = end;
        this.residency = residency;
        this.eventRef = eventRef;
    }
}

export class Show implements ScheduledShow  {
    id?: string;
    title: string = "";
    number: string = "";
    timeStart?: TimeStr;
    timeEnd?: TimeStr;
    date?: Date;
    contact: ContactInfo = new ContactInfo();
    comment: string = "";
    acts: Array<Act> = [];
    residency?: string;
    createdAt?:Date;
    eventRef?: string;
}