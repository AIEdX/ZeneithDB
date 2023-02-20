import type { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { DataBase } from "./Database/Database.js";
export declare const ZeneithDBCore: {
    dataBase: DataBase;
    __version: number;
    loadedDatabases: Record<string, DataBase>;
    util: {
        getUUID: () => string;
    };
    initialize(): Promise<void>;
    createDataBase(data: ZeneithDatabaseCreationData): Promise<DataBase>;
    updateDatBaseData(data: ZeneithDatabaseCreationData): Promise<void>;
    getDataBase(dataBasename: string): Promise<DataBase>;
    dataBaseExist(dataBasename: string): Promise<boolean>;
    deleteDataBase(dataBasename: string): Promise<false | undefined>;
};
