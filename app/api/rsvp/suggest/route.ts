import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export async function POST(request: Request) {
  let body: { query?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { results: [] },
      { status: 400 },
    );
  }

  const query = String(body.query ?? "")
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
