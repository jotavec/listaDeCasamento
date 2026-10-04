import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase/public";
import { readJsonObject } from "@/lib/http/request";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (parsed.response) return parsed.response;
  const body = parsed.data;

  const query = (typeof body.query === "string" ? body.query : "")
    .trim()
    .replace(/\s+/g, " ");

  if (query.length < 3 || query.length > 120) {
    return NextResponse.json({
      results: [],
    });
  }

  const supabase = publicClient();

  const { data, error } = await supabase.rpc(
    "suggest_rsvp_invitations",
    {
      p_query: query,
    },
  );

  if (error) {
    console.error("RSVP live search:", error);

    return NextResponse.json(
      { results: [] },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    results: (data ?? []).map(
      (item: { primary_name: string }) =>
        item.primary_name,
    ),
  });

  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0",
  );

  return response;
}
