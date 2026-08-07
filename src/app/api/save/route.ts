import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { gameSaves } from "@/lib/db/schema";
import type { PlayerState } from "@/lib/types";

export const runtime = "nodejs";

function dbUnavailable() {
  return NextResponse.json(
    {
      ok: false,
      error: "DATABASE_URL no configurada. La partida sigue en localStorage.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  const db = getDb();
  if (!db) return dbUnavailable();

  const { searchParams } = new URL(request.url);
  const playerKey = searchParams.get("player_key");
  if (!playerKey) {
    return NextResponse.json(
      { ok: false, error: "Falta player_key" },
      { status: 400 },
    );
  }

  const rows = await db
    .select()
    .from(gameSaves)
    .where(eq(gameSaves.playerKey, playerKey))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ ok: true, state: null });
  }

  return NextResponse.json({
    ok: true,
    state: row.state,
    updated_at: row.updatedAt,
  });
}

export async function POST(request: Request) {
  const db = getDb();
  if (!db) return dbUnavailable();

  let body: { player_key?: string; state?: PlayerState };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON inválido" },
      { status: 400 },
    );
  }

  const playerKey = body.player_key;
  const state = body.state;
  if (!playerKey || !state) {
    return NextResponse.json(
      { ok: false, error: "Faltan player_key o state" },
      { status: 400 },
    );
  }

  const existing = await db
    .select({ id: gameSaves.id })
    .from(gameSaves)
    .where(eq(gameSaves.playerKey, playerKey))
    .limit(1);

  if (existing[0]) {
    await db
      .update(gameSaves)
      .set({
        state,
        mes: state.mes,
        updatedAt: new Date(),
      })
      .where(eq(gameSaves.playerKey, playerKey));
  } else {
    await db.insert(gameSaves).values({
      playerKey,
      state,
      mes: state.mes,
    });
  }

  return NextResponse.json({ ok: true });
}
