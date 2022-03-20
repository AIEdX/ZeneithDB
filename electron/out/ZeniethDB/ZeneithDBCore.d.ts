import { ZeneithDB } from "./ZeneithDB.js";
import { DataBase } from "./Database/Database.js";
import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
export declare class ZeneithDBCore {
    zeneith: typeof ZeneithDB;
    dataBase: DataBase;
    initialize(): Promise<void>;
    createDatabase(data: ZeneithDatabaseCreationData): DataBase;
}
