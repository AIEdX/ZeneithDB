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
    open(): Promise<boolean>;
    close(): boolean;
    forceUpdate(): Promise<void>;
    _processCollectionScehma(collection: IDBObjectStore, schema: ZeneithSchema): void;
    __traverseColletionScehma(collection: IDBObjectStore, schema: ZeneithSchema): void;
    getDatabaeVersion(): Promise<number>;
    doesCollectionExists(collectionName: string): boolean;
    getData<T>(collectionName: string, key: string): Promise<T | false>;
    removeData(collectionName: string, key: string): Promise<boolean>;
    setData(collectionName: string, key: string, setData: any): Promise<boolean>;
    updateData(collectionName: string, key: string, updateData: any): Promise<boolean>;
}
