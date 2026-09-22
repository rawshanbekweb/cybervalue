"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createExamAction,
  reviewAttemptAction,
} from "@/app/admin/(cms)/assessments/actions";

export function CreateExamForm() {
  const [state, action, pending] = useActionState(createExamAction, undefined);
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("45");
  const [roster, setRoster] = useState("");
  function download() {
    if (!state?.codes) return;
    const data = state.codes
      .map(
        (row) =>
          `${row.studentId} | ${row.name} | ${row.code.match(/.{1,4}/g)!.join("-")}`,
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(
        [
          `HTML sinovi: ${location.origin}/playground/html-basics/assessment\nHar bir kodni faqat uning egasiga bering.\n\n${data}`,
        ],
        { type: "text/plain;charset=utf-8" },
      ),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "html-sinov-kodlari.txt";
    a.click();
    URL.revokeObjectURL(url);
  }
  if (state?.codes)
    return (
      <section className="exam-card">
        <h2>Sinov yaratildi</h2>
        <p>
          Kodlar faqat hozir ko‘rsatiladi. Ro‘yxatni yuklab oling va har bir
          kodni tegishli o‘quvchiga alohida bering.
        </p>
        <button
          type="button"
          className="button button-primary"
          onClick={download}
        >
          Kodlarni yuklab olish
        </button>
        <p>
          <Link href={`/admin/assessments/${state.examId}`}>
            Natijalar sahifasiga o‘tish →
          </Link>
        </p>
        <details>
          <summary>Kodlarni ko‘rish</summary>
          <pre>
            {state.codes
              .map((row) => `${row.studentId} | ${row.name} | ${row.code}`)
              .join("\n")}
          </pre>
        </details>
      </section>
    );
  return (
    <form action={action} className="exam-card exam-form">
      <h2>Yangi sinov</h2>
      <label>
        Sinov nomi
        <input
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          minLength={3}
          maxLength={100}
          placeholder="9-A · HTML amaliy sinov"
        />
      </label>
      <label>
        Vaqt (daqiqa)
        <input
          name="minutes"
          type="number"
          min={15}
          max={120}
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          required
        />
      </label>
      <label>
        O‘quvchilar: har qatorda ID | Ism Familiya
        <textarea
          name="roster"
          value={roster}
          onChange={(event) => setRoster(event.target.value)}
          required
          rows={7}
          maxLength={25000}
          placeholder={"001 | Ali Valiyev\n002 | Madina Karimova"}
        />
      </label>
      <p className="muted">
        Bir ID — bir urinish. Bir xil o‘quvchini boshqa ID bilan qayta
        kiritmang. Ro‘yxatni sinov boshlanishidan oldin tekshiring.
      </p>
      {state?.error && <p role="alert">{state.error}</p>}
      <button className="button button-primary" disabled={pending}>
        {pending ? "Yaratilmoqda…" : "Sinov va shaxsiy kodlarni yaratish"}
      </button>
    </form>
  );
}

export function ReviewForm({
  candidateId,
  score,
  note,
}: {
  candidateId: string;
  score: number | null;
  note: string;
}) {
  const [state, action, pending] = useActionState(
    reviewAttemptAction.bind(null, candidateId),
    undefined,
  );
  return (
    <form action={action} className="exam-form">
      <h3>O‘qituvchi bahosi · 10 ball</h3>
      <p>
        Har bir izoh uchun: aniqlik 0–2, sabab va foydalanuvchiga ta’sir 0–2,
        o‘z kodidan misol 0–1. Jami ikki izoh uchun 0–10.
      </p>
      <label>
        Izohlar bali
        <input
          name="score"
          type="number"
          min={0}
          max={10}
          defaultValue={score ?? ""}
          required
        />
      </label>
      <label>
        O‘quvchiga fikr-mulohaza
        <textarea name="note" rows={3} maxLength={3000} defaultValue={note} />
      </label>
      <button className="button button-primary" disabled={pending}>
        Bahoni saqlash
      </button>
      {state?.error && <p role="alert">{state.error}</p>}
      {state?.success && <p role="status">{state.success}</p>}
    </form>
  );
}
