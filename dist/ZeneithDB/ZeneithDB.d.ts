import type { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
export declare const ZeneithDB: {
    __initalized: boolean;
    core: {
        dataBase: import("./index.js").DataBase;
        __version: number;
        loadedDatabases: Record<string, import("./index.js").DataBase>;
        util: {
            getUUID: () => string;
        };
        initialize(): Promise<void>;
        createDataBase(data: ZeneithDatabaseCreationData): Promise<import("./index.js").DataBase>;
        updateDatBaseData(data: ZeneithDatabaseCreationData): Promise<void>;
        getDataBase(dataBasename: string): Promise<import("./index.js").DataBase>;
        dataBaseExist(dataBasename: string): Promise<boolean>;
        deleteDataBase(dataBasename: string): Promise<false | undefined>;
    };
    $INIT(): Promise<void>;
    databaseExists(dataBaseName: string): Promise<boolean>;
    createDatabase(data: ZeneithDatabaseCreationData): Promise<import("./index.js").DataBase>;
    updateDatabase(data: ZeneithDatabaseCreationData): Promise<import("./index.js").DataBase>;
    getDatabase(name: string): Promise<import("./index.js").DataBase>;
    deleteDatabase(name: string): Promise<false | undefined>;
};
