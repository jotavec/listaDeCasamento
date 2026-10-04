import { NextResponse } from "next/server";
import { publicClient } from "@/lib/supabase/public";
import { readJsonObject } from "@/lib/http/request";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request);
  if (parsed.response) return parsed.response;
  const body = parsed.data;

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

  let credentials: string[];
  try {
    credentials = decodeURIComponent(session).split(".");
  } catch {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }
  const [invitationId, token] = credentials;

  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    credentials.length !== 2 ||
    !uuid.test(invitationId ?? "") ||
    !uuid.test(token ?? "")
  ) {
    return NextResponse.json(
      { error: "Sessão inválida." },
      { status: 401 },
    );
  }

  if (typeof body.attending !== "boolean") {
    return NextResponse.json(
      { error: "Confirmação inválida." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.companions) || !Array.isArray(body.children)
    || body.companions.length > 20 || body.children.length > 50) {
    return NextResponse.json({ error: "Quantidade inválida." }, { status: 400 });
  }

  if (body.companions.some((name: unknown) => typeof name !== "string"
    || name.trim().length < 2 || name.trim().length > 120)) {
    return NextResponse.json({ error: "Informe o nome completo dos acompanhantes." }, { status: 400 });
  }
  const companions = (body.companions as string[]).map((name) => name.trim());

  if (body.children.some((child: unknown) => {
    if (!child || typeof child !== "object" || Array.isArray(child)) return true;
    const { name, age } = child as Record<string, unknown>;
    return typeof name !== "string" || name.trim().length < 2 || name.trim().length > 120
      || typeof age !== "number" || !Number.isInteger(age) || age < 0 || age > 10;
  })) {
    return NextResponse.json({ error: "Confira o nome e a idade das crianças." }, { status: 400 });
  }
  const children = (body.children as { name: string; age: number }[])
    .map(({ name, age }) => ({ name: name.trim(), age }));

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
