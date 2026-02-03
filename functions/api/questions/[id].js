import { isTooLong, json, readAllQuestions, requireAdmin, writeAllQuestions } from "../_utils";

export async function onRequest(context) {
  const { request, env, params } = context;
  const id = Number(params.id);
  if (!id) {
    return json({ success: false, error: "Invalid id" }, { status: 400 });
  }

  const denied = requireAdmin(request, env);
  if (denied) return denied;

  if (request.method === "PUT") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const answer = (body.answer || "").toString();
    if (!answer) {
      return json({ success: false, error: "Answer is required" }, { status: 400 });
    }
    if (isTooLong(answer, 2000)) {
      return json({ success: false, error: "Answer is too long" }, { status: 400 });
    }

    const questions = await readAllQuestions(env);
    const idx = questions.findIndex((q) => q && q.id === id);
    if (idx === -1) {
      return json({ success: false, error: "Question not found" }, { status: 404 });
    }

    questions[idx].answer = answer;
    questions[idx].status = "answered";
    questions[idx].answeredDate = new Date().toISOString();
    await writeAllQuestions(env, questions);

    return json({ success: true, data: questions[idx] });
  }

  if (request.method === "DELETE") {
    const questions = await readAllQuestions(env);
    const idx = questions.findIndex((q) => q && q.id === id);
    if (idx === -1) {
      return json({ success: false, error: "Question not found" }, { status: 404 });
    }
    const deleted = questions.splice(idx, 1)[0];
    await writeAllQuestions(env, questions);
    return json({ success: true, data: deleted });
  }

  return json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}

