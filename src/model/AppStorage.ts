export default interface AppStorage {
    put(ref: string, data: Blob | File): Promise<any>;
    getDownloadURL(ref: string): Promise<string>;
    delete(ref: string): Promise<boolean>;
}