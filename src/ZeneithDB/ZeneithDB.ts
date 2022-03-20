import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDBCore } from "./ZeneithDBCore.js";

export const ZeneithDB = {
 __version : 0.1,
 core: new ZeneithDBCore(),

 $INIT: async function () {
   await this.core.initialize();
 },

 createDatabase(data : ZeneithDatabaseCreationData ) {

   return this.core.createDatabase(data);
 }
 };

ZeneithDB.core.zeneith = ZeneithDB;
