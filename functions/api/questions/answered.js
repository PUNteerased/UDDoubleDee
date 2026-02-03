import { json, readAllQuestions } from "../_utils";

export async function onRequestGet({ env }) {
  const questions = await readAllQuestions(env);
  const answered = questions.filter((q) => q && q.status === "answered");
  return json({ success: true, data: answered });
}

