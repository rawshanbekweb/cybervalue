import { DatabaseSync } from "node:sqlite";

export interface UserRow {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
}

const SEED_SQL = `
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, name TEXT, role TEXT, email TEXT);
  INSERT INTO users VALUES (15, 'ali', 'Ali Karimov', 'user', 'ali@example.test');
  INSERT INTO users VALUES (16, 'vali', 'Vali Olimov', 'user', 'vali@example.test');
  INSERT INTO users VALUES (1, 'admin', 'Administrator', 'admin', 'admin@example.test');
`;

// A fresh in-memory database is created per call, exactly like the original Python demo's
// `database()` factory — every SQL lesson (including the deliberately vulnerable one) operates
// on a throwaway 3-row fixture, so nothing here can leak or persist real data.
export function openLabDb(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(SEED_SQL);
  return db;
}
