import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDBCore } from "./ZeneithDBCore.js";
export declare const ZeneithDB: {
    __version: number;
    core: ZeneithDBCore;
    $INIT: () => Promise<void>;
    databaseExists: (dataBaseName: string) => Promise<boolean>;
    createDatabase: (data: ZeneithDatabaseCreationData) => Promise<import("./Database/Database.js").DataBase>;
    updateDatabase: (data: ZeneithDatabaseCreationData) => Promise<import("./Database/Database.js").DataBase>;
    getDatabase: (name: string) => Promise<import("./Database/Database.js").DataBase>;
    deleteDatabase: (name: string) => void;
};
