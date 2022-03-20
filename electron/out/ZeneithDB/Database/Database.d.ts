import { ZeneithDatabaseCreationData } from "ZeneithDB/Meta/Database/Database.types";
import { ZeneithSchema } from "ZeneithDB/Meta/Database/Schema.types";
export declare class DataBase {
    creationData: ZeneithDatabaseCreationData;
    outsideZeneith: boolean;
    dataBaseVersion: number;
    dataBaseName: string;
    opened: boolean;
    db: IDBDatabase | null;
    constructor(creationData: ZeneithDatabaseCreationData, outsideZeneith?: boolean);
    isOpen(): boolean;
    open(): Promise<boolean> | true;
    close(): boolean;
    forceUpdate(): Promise<boolean>;
    _processCollectionScehma(collection: IDBObjectStore, schema: ZeneithSchema): void;
    __traverseColletionScehma(collection: IDBObjectStore, schema: ZeneithSchema): void;
    updateCollectionScehma(collectionName: string, scehma: ZeneithSchema): void;
    addNewCollection(collectionName: string, scehma: ZeneithSchema): void;
    removeCollection(collectionName: string, scehma: ZeneithSchema): void;
    getDatabaeVersion(): Promise<number>;
    doesCollectionExists(collectionName: string): boolean;
    getData<T>(collectionName: string, key: string): Promise<T | false>;
    removeData(collectionName: string, key: string): Promise<boolean>;
    setData<T>(collectionName: string, key: string, setData: T): Promise<boolean>;
    updateData(collectionName: string, key: string, updateData: any): Promise<boolean>;
}
