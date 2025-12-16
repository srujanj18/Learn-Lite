export async function analyzeWithBart(content) {
  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    throw new Error("BART analysis failed");
  }

  const data = await res.json();
  return data.summary;
}
