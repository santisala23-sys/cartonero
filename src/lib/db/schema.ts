import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { PlayerState } from "@/lib/types";

export const gameSaves = pgTable("game_saves", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerKey: text("player_key").notNull().unique(),
  state: jsonb("state").$type<PlayerState>().notNull(),
  mes: integer("mes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
