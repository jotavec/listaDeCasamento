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

type Child = {
  name?: unknown;
  age?: unknown;
};

export async function POST(request: Request) {
  const contentType =
    request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Requisição inválida." },
      { status: 415 },
    );
  }

  const session = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("jjrsvp="))
    ?.slice("jjrsvp=".length);

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Sua busca expirou. Localize seu convite novamente.",
      },
      { status: 401 },
    );
  }

  const [invitationId, token] =
    decodeURIComponent(session).split(".");

  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !uuid.test(invitationId ?? "") ||
    !uuid.test(token ?? "")
  ) {
    return NextResponse.json(
      { error: "Sessão inválida." },
      { status: 401 },
    );
  }

  let body: {
    attending?: unknown;
    companions?: unknown;
    children?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Dados inválidos." },
      { status: 400 },
    );
  }

  if (typeof body.attending !== "boolean") {
    return NextResponse.json(
      { error: "Confirmação inválida." },
      { status: 400 },
    );
  }

  const rawCompanions = Array.isArray(body.companions)
    ? body.companions
    : [];

  const companions = rawCompanions
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  if (companions.length > 20) {
    return NextResponse.json(
      { error: "Quantidade inválida." },
      { status: 400 },
    );
  }

  const rawChildren = Array.isArray(body.children)
    ? (body.children as Child[])
    : [];

  const children = rawChildren.map((child) => ({
    name: String(child?.name ?? "").trim(),
    age: Number(child?.age),
  }));

  if (
    companions.some(
      (name) =>
        name.length < 2 ||
        name.length > 120,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Informe o nome completo dos acompanhantes.",
      },
      { status: 400 },
    );
  }

  if (
    children.some(
      (child) =>
        child.name.length < 2 ||
        child.name.length > 120 ||
        !Number.isInteger(child.age) ||
        child.age < 0 ||
        child.age > 10,
    )
  ) {
    return NextResponse.json(
      {
        error:
          "Confira o nome e a idade das crianças.",
      },
      { status: 400 },
    );
  }

  if (
    !body.attending &&
    (companions.length > 0 ||
      children.length > 0)
  ) {
    return NextResponse.json(
      { error: "Confirmação inválida." },
      { status: 400 },
    );
  }

  const supabase = publicClient();

  const { error } = await supabase.rpc(
    "confirm_rsvp",
    {
      p_invitation_id: invitationId,
      p_token: token,
      p_attending: body.attending,
      p_companions: companions,
      p_children: children,
    },
  );

  if (error) {
    console.error("RSVP confirmation error:", error);

    return NextResponse.json(
      {
        error:
          "Não foi possível registrar a confirmação. Confira os dados.",
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    success: true,
  });

  response.cookies.delete("jjrsvp");

  return response;
}
