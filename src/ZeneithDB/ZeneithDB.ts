import type { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDBCore } from "./ZeneithDBCore.js";

export const ZeneithDB = {

 __initalized: false,
 core: ZeneithDBCore,

 async $INIT() {
  if (this.__initalized) return;
  await this.core.initialize();
  this.__initalized = true;
 },

 async databaseExists(dataBaseName: string) {
  return await this.core.dataBaseExist(dataBaseName);
 },
 async createDatabase(data: ZeneithDatabaseCreationData) {
  return this.core.createDataBase(data);
 },
 async updateDatabase(data: ZeneithDatabaseCreationData) {
  return this.core.createDataBase(data);
 },
 async getDatabase(name: string) {
  return this.core.getDataBase(name);
 },
 async deleteDatabase(name: string) {
  return this.core.deleteDataBase(name);
 },
};
