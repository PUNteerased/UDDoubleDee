import { isTooLong, json, readAllQuestions, requireAdmin, writeAllQuestions } from "./_utils";

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === "GET") {
    const denied = requireAdmin(request, env);
    if (denied) return denied;
    const questions = await readAllQuestions(env);
    return json({ success: true, data: questions });
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: "Invalid JSON" }, { status: 400 });
    }

    const name = (body.name || "Anonymous").toString();
    const category = (body.category || "").toString();
    const questionText = (body.question || "").toString();

    if (!category || !questionText) {
      return json({ success: false, error: "Category and question are required" }, { status: 400 });
    }
    if (isTooLong(name, 80) || isTooLong(category, 80) || isTooLong(questionText, 1000)) {
      return json({ success: false, error: "Input is too long" }, { status: 400 });
    }

    const questions = await readAllQuestions(env);
    const newQuestion = {
      id: Date.now(),
      name,
      category,
      question: questionText,
      answer: "",
      status: "pending",
      date: new Date().toISOString(),
    };

    questions.unshift(newQuestion);
    await writeAllQuestions(env, questions);

    return json({ success: true, data: newQuestion }, { status: 201 });
  }

  return json({ success: false, error: "Method Not Allowed" }, { status: 405 });
}

