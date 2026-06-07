import { useState } from "react";
import { PenSquare } from "lucide-react";

import { generateArticle } from "../../../services/aiToolsService";

export default function ArticleWriter() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("students");
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await generateArticle({ topic, audience });
      setArticle(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[360px,1fr] gap-8">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">Article Writer</h1>
          <p className="text-slate-500 mt-2">Draft knowledge-sharing articles for the alumni and student community.</p>

          <div className="space-y-5 mt-8">
            <div>
              <label className="text-sm font-bold text-slate-700">Topic</label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g. Cracking product-based interviews"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700">Audience</label>
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="w-full mt-2 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="students">Students</option>
                <option value="alumni">Alumni</option>
                <option value="mixed campus community">Mixed Campus Community</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-2xl bg-slate-900 text-white font-bold py-4 hover:bg-red-600 disabled:bg-slate-300 transition-colors"
            >
              {loading ? "Drafting..." : "Generate Article"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          {article ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                  <PenSquare size={22} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{article.title}</h2>
                  <p className="text-slate-500 text-sm">Generated article draft</p>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700 bg-slate-50 rounded-2xl p-6">{article.body}</pre>
            </>
          ) : (
            <div className="h-full min-h-[420px] flex items-center justify-center text-slate-400">
              Your generated article will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
