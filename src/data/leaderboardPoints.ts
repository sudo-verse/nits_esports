import { supabase } from "@/lib/supabase";

type MatchRowPayload = {
  team: string;
  wwcd: number;
  placement: number;
  kills: number;
  total?: number;
};

type FinalsRowPayload = {
  origIdx: number;
  team: string;
  wwcd: number;
  placement: number;
  kills: number;
  total?: number;
};

export type GroupRowPayload = {
  team: string;
  points: number;
  rank?: number;
  gamesPlayed?: number;
  gamesWon?: number;
  totalKills?: number;
  totalDeaths?: number;
  originalIndex?: number;
};

export type GroupPayload = Record<string, GroupRowPayload[]>;

export type PointsPayload<MatchKey extends string> = {
  matchData?: Partial<Record<MatchKey, MatchRowPayload[]>>;
  finals?: FinalsRowPayload[];
  groups?: GroupPayload;
};

export type PointsSnapshot<MatchKey extends string> = PointsPayload<MatchKey> & {
  updatedAt?: string;
};

const TABLE_NAME = "leaderboard_points";

const hasSupabaseConfig = Boolean((import.meta as any).env.VITE_SUPABASE_URL && (import.meta as any).env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => hasSupabaseConfig;

export async function fetchPointsSnapshot<MatchKey extends string>(eventId: string, gameId: string): Promise<PointsSnapshot<MatchKey> | null> {
  if (!hasSupabaseConfig || !eventId || !gameId) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("payload, updated_at")
    .eq("event_id", eventId)
    .eq("game_id", gameId)
    .maybeSingle();

  if (error || !data?.payload) {
    return null;
  }

  return {
    ...(data.payload as PointsPayload<MatchKey>),
    updatedAt: data.updated_at ?? undefined,
  };
}

export async function savePointsSnapshot<MatchKey extends string>(
  eventId: string,
  gameId: string,
  payload: PointsPayload<MatchKey>
): Promise<void> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase configuration missing");
  }

  const { error } = await supabase.from(TABLE_NAME).upsert(
    {
      event_id: eventId,
      game_id: gameId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,game_id" }
  );

  if (error) {
    throw error;
  }
}
