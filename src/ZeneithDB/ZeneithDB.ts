import type { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDBCore } from "./ZeneithDBCore.js";

export const ZeneithDB = {
 __version: 0.1,
 core: new ZeneithDBCore(),

 $INIT: async function () {
  await this.core.initialize();
 },

 databaseExists: async function (dataBaseName: string) {
  return await this.core.checkIfDatabaseExists(dataBaseName);
 },
 createDatabase: async function (data: ZeneithDatabaseCreationData) {
  return this.core.createDatabase(data);
 },
 updateDatabase: function (data: ZeneithDatabaseCreationData) {
  return this.core.createDatabase(data);
 },
 getDatabase: function (name: string) {
  return this.core.getDatabase(name);
 },
 deleteDatabase: function (name: string) {
   return this.core.deleteDatabase(name);
 },
};

ZeneithDB.core.zeneith = ZeneithDB;
