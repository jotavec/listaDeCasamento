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
  const contentType =
    request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 415 },
    );
  }

  let body: { name?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 400 },
    );
  }

  const name = String(body.name ?? "")
    .trim()
    .replace(/\s+/g, " ");

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json(
      {
        error:
          "Digite o nome completo usado no convite.",
      },
      { status: 400 },
    );
  }

  const supabase = publicClient();

  const { data, error } = await supabase.rpc(
    "find_rsvp_invitation",
    {
      p_name: name,
    },
  );

  if (error) {
    console.error("RSVP search error:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível localizar o convite agora.",
      },
      { status: 500 },
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json(
      {
        found: false,
        message:
          "Não encontramos esse nome. Confira o nome completo do convite.",
      },
      { status: 404 },
    );
  }

  if (data.length > 1) {
    return NextResponse.json(
      {
        found: false,
        message:
          "Encontramos mais de um convite com esse nome. Entre em contato com os noivos.",
      },
      { status: 409 },
    );
  }

  const invitation = data[0];

  const response = NextResponse.json({
    found: true,
    invitation: {
      name: invitation.primary_name,
      maxAdults: invitation.max_adults,
      status: invitation.rsvp_status,
    },
  });

  response.cookies.set(
    "jjrsvp",
    `${invitation.invitation_id}.${invitation.rsvp_token}`,
    {
      httpOnly: true,
      sameSite: "strict",
      secure:
        process.env.NODE_ENV === "production" ||
        Boolean(process.env.CODESPACE_NAME),
      path: "/",
      maxAge: 60 * 30,
    },
  );

  return response;
}
