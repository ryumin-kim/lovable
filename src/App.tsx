import { useState } from "react";

interface Choice {
  id: string;
  title: string;
  description: string;
}

export default function App() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState<"input" | "choice" | "result">("input");

  const sendQuestion = async () => {
    setLoading(true);
    const res = await fetch("https://n8n.modelgrade.net/webhook-test/generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: input }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.choices) {
      setChoices(data.choices);
      setStep("choice");
    } else if (data.description) {
      setResult(data);
      setStep("result");
    } else {
      alert("Unexpected response.");
    }
  };

  const sendChoice = async (choiceId: string) => {
    setLoading(true);
    const res = await fetch("https://n8n.modelgrade.net/webhook-test/generator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selected_id: choiceId }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.description) {
      setResult(data);
      setStep("result");
    } else {
      alert("Unexpected response.");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">n8n Workflow Painter</h1>

      {step === "input" && (
        <div className="flex flex-col gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your automation request..."
            className="border p-3 rounded w-full"
          />
          <button
            onClick={sendQuestion}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Generate Suggestions"}
          </button>
        </div>
      )}

      {step === "choice" && (
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-4">Choose a workflow:</h2>
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => sendChoice(choice.id)}
              className="border p-3 rounded hover:bg-gray-100 text-left"
              disabled={loading}
            >
              <div className="font-bold">{choice.title}</div>
              <div className="text-sm">{choice.description}</div>
            </button>
          ))}
        </div>
      )}

      {step === "result" && result && (
        <div className="flex flex-col gap-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Description</h2>
            <p>{result.description}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Workflow Diagram</h2>
            <pre className="bg-gray-100 p-3 rounded">{result.diagram}</pre>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Steps</h2>
            <ul className="list-decimal list-inside">
              {result.steps.map((step: string, idx: number) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Workflow JSON</h2>
            <pre className="bg-gray-100 p-3 rounded overflow-x-auto">{JSON.stringify(result.workflow, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
