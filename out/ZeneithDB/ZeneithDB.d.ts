import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDBCore } from "./ZeneithDBCore.js";
export declare const ZeneithDB: {
    __version: number;
    core: ZeneithDBCore;
    $INIT: () => Promise<void>;
    createDatabase(data: ZeneithDatabaseCreationData): import("./Database/Database.js").DataBase;
};
