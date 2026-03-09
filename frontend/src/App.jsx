import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { LoadingState } from './components/LoadingState';
import { CampaignResults } from './components/CampaignResults';
import { Carousel } from './components/Carousel';
import './index.css';

const airtableHeaders = { Authorization: `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" };
const CM_API_KEY = "cba51a66a63440ba80682d11085d75cb586c5f7258e4667c9913a8033b1fde831ccd44b80307121d13b702103930d6a2";
const CM_TEMPLATE_ID = "61e541ce-f916-42f8-a7e2-9b508ad69f0f";
const CM_TEST_URLS = { hook: "https://www.dropbox.com/scl/fi/yi8111ze639m34vsb3myi/vv2.1.0.mp4?rlkey=5d2oowmfcp7v8yqx3lar8018d&st=qcqc3b6e&dl=1", body: "https://www.dropbox.com/scl/fi/j2866nqgpc2efqrlq96j2/vv2.1.1.mp4?rlkey=abicjhgh50z70247xpnnrr00d&st=xs6hsan6&dl=1", cta: "https://www.dropbox.com/scl/fi/8tv5g95063ox1dthth2vh/vv2.1.2.mp4?rlkey=v3whqd3304719xwcivb92vuo1&st=8xv3vw8b&dl=1" };

function App() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cmTestStatus, setCmTestStatus] = useState("idle");
  const [cmTestResult, setCmTestResult] = useState(null);

  const handleCmTest = async () => {
    setCmTestStatus("loading"); setCmTestResult(null);
    try {
      const res = await fetch("https://api.creatomate.com/v2/renders", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${CM_API_KEY}` }, body: JSON.stringify({ template_id: CM_TEMPLATE_ID, modifications: { "Hook.source": CM_TEST_URLS.hook, "Body.source": CM_TEST_URLS.body, "CTA.source": CM_TEST_URLS.cta } }) });
      const data = await res.json();
      if (!res.ok) { setCmTestResult({ error: JSON.stringify(data, null, 2) }); setCmTestStatus("error"); }
      else { const render = Array.isArray(data) ? data[0] : data; setCmTestResult(render); setCmTestStatus("success"); }
    } catch (e) { setCmTestResult({ error: e.message }); setCmTestStatus("error"); }
  };

  const generate = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          style: 'professional',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to generate');
      }

      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl space-y-10">

          <header className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800">
              <Sparkles size={12} className="text-yellow-400" />
              <span className="text-xs font-medium text-neutral-400">Powered by AWS Bedrock</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 pb-2">
              AdForge
            </h1>
            <p className="text-lg text-neutral-400 max-w-md mx-auto leading-relaxed">
              Transform product photos into world-class marketing campaigns in seconds.
            </p>
          </header>

              <div style={{ marginTop: 12, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 11, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 2 }}>🧪 Creatomate Test</div><div style={{ fontSize: 11, color: "#9CA3AF" }}>Fires a real render with the 3 test clips. Takes ~60 seconds.</div></div>
                  <button onClick={handleCmTest} disabled={cmTestStatus === "loading"} style={{ padding: "10px 20px", borderRadius: 9, border: "none", background: cmTestStatus === "loading" ? "#9CA3AF" : "#111", color: "#fff", fontWeight: 600, fontSize: 12, cursor: cmTestStatus === "loading" ? "not-allowed" : "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 8 }}>
                    {cmTestStatus === "loading" && <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />}
                    {cmTestStatus === "loading" ? "Sending..." : "Fire Test Render"}
                  </button>
                </div>
                {cmTestStatus === "success" && cmTestResult && <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 9, background: "#F0FFF4", border: "1px solid #86EFAC" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", marginBottom: 8 }}>✅ Render queued!</div><a href={cmTestResult.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#2563EB", wordBreak: "break-all", display: "block", padding: "8px 10px", background: "#fff", borderRadius: 6, border: "1px solid #BFDBFE" }}>{cmTestResult.url}</a></div>}}
                {cmTestStatus === "error" && cmTestResult && <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 9, background: "#FEF2F2", border: "1px solid #FCA5A5" }}><div style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>❌ Error</div><pre style={{ fontSize: 11, color: "#7F1D1D", whiteSpace: "pre-wrap", margin: 0 }}>{cmTestResult.error}</pre></div>}}
              </div>

          {result ? (
            <CampaignResults data={result} onReset={reset} />
          ) : loading ? (
            <LoadingState />
          ) : (
            <div className="space-y-8">
              <UploadZone onImageSelect={setImage} disabled={loading} />

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {image && (
                <div className="text-center pt-2">
                  <button onClick={generate} className="btn-primary px-8 py-4 text-lg shadow-lg shadow-white/10">
                    Generate Campaign
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!result && !loading && !image && (
        <div className="border-t border-neutral-900 bg-neutral-950/50 backdrop-blur-3xl">
          <Carousel />
        </div>
      )}

      <footer className="py-8 text-center text-xs text-neutral-600">
        Built with <span className="text-neutral-400">AWS Bedrock</span> • Nova Lite • Nova Canvas
      </footer>
    </div>
  );
}

export default App;
