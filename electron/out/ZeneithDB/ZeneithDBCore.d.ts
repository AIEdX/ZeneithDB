import { ZeneithDB } from "./ZeneithDB.js";
import { DataBase } from "./Database/Database.js";
import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
export declare class ZeneithDBCore {
    zeneith: typeof ZeneithDB;
    dataBase: DataBase;
    loadedDatabases: Record<string, DataBase>;
    initialize(): Promise<void>;
    createDatabase(data: ZeneithDatabaseCreationData): Promise<DataBase>;
    updateDatabase(data: ZeneithDatabaseCreationData): DataBase;
    getDatabase(dataBasename: string): Promise<DataBase>;
    checkIfDatabaseExists(dataBasename: string): Promise<boolean>;
}
