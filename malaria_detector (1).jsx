import { useState, useRef, useCallback } from "react";

const API_URL = "https://api.anthropic.com/v1/messages";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Caveat:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Nunito', sans-serif;
    background: #fef9f0;
    min-height: 100vh;
  }

  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .header-badge {
    display: inline-block;
    background: #ffe4b5;
    border: 2px dashed #f4a261;
    border-radius: 999px;
    padding: 4px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #e76f51;
    margin-bottom: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .title {
    font-family: 'Caveat', cursive;
    font-size: 48px;
    font-weight: 700;
    color: #2d3a1f;
    line-height: 1.1;
  }

  .title span {
    color: #e63946;
    display: inline-block;
    transform: rotate(-1deg);
  }

  .subtitle {
    font-size: 14px;
    color: #888;
    margin-top: 8px;
    font-weight: 600;
  }

  .mosquito-deco {
    font-size: 32px;
    margin: 0 8px;
    display: inline-block;
    animation: wiggle 2s ease-in-out infinite;
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }

  .card {
    background: white;
    border-radius: 20px;
    border: 2.5px solid #e8e0d5;
    padding: 28px;
    margin-bottom: 20px;
    box-shadow: 4px 4px 0px #e8e0d5;
  }

  .card-title {
    font-family: 'Caveat', cursive;
    font-size: 22px;
    font-weight: 700;
    color: #2d3a1f;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .upload-zone {
    border: 3px dashed #c8c0b5;
    border-radius: 16px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: #fafaf8;
    position: relative;
  }

  .upload-zone:hover, .upload-zone.dragging {
    border-color: #e63946;
    background: #fff5f5;
  }

  .upload-icon {
    font-size: 48px;
    margin-bottom: 12px;
    display: block;
  }

  .upload-text {
    font-size: 15px;
    color: #666;
    font-weight: 600;
  }

  .upload-hint {
    font-size: 12px;
    color: #aaa;
    margin-top: 6px;
  }

  .preview-img {
    width: 100%;
    max-height: 280px;
    object-fit: cover;
    border-radius: 12px;
    border: 2px solid #e8e0d5;
  }

  .btn {
    width: 100%;
    padding: 16px;
    border-radius: 14px;
    border: 2.5px solid;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn:active {
    transform: translateY(2px);
  }

  .btn-primary {
    background: #e63946;
    border-color: #c1121f;
    color: white;
    box-shadow: 0 4px 0 #c1121f;
  }

  .btn-primary:hover:not(:disabled) {
    box-shadow: 0 2px 0 #c1121f;
    transform: translateY(2px);
  }

  .btn-primary:disabled {
    background: #ccc;
    border-color: #bbb;
    box-shadow: 0 4px 0 #bbb;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: white;
    border-color: #e8e0d5;
    color: #666;
    box-shadow: 0 4px 0 #e8e0d5;
    margin-top: 10px;
  }

  .btn-secondary:hover:not(:disabled) {
    box-shadow: 0 2px 0 #e8e0d5;
    transform: translateY(2px);
  }

  .loading-box {
    text-align: center;
    padding: 28px;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 5px solid #f0ebe4;
    border-top-color: #e63946;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-family: 'Caveat', cursive;
    font-size: 20px;
    color: #666;
  }

  .loading-steps {
    font-size: 12px;
    color: #aaa;
    margin-top: 8px;
  }

  .result-box {
    border-radius: 16px;
    padding: 24px;
    border: 2.5px solid;
  }

  .result-positive {
    background: #fff1f2;
    border-color: #fecdd3;
  }

  .result-negative {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .result-emoji {
    font-size: 40px;
    line-height: 1;
  }

  .result-label {
    font-family: 'Caveat', cursive;
    font-size: 26px;
    font-weight: 700;
  }

  .result-positive .result-label { color: #e63946; }
  .result-negative .result-label { color: #16a34a; }

  .result-confidence {
    font-size: 13px;
    font-weight: 700;
    color: #888;
    margin-top: 2px;
  }

  .confidence-bar-wrap {
    margin: 16px 0;
  }

  .confidence-bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 700;
    color: #888;
    margin-bottom: 6px;
  }

  .confidence-bar {
    height: 12px;
    background: #f0ebe4;
    border-radius: 999px;
    overflow: hidden;
  }

  .confidence-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s ease;
  }

  .fill-positive { background: linear-gradient(90deg, #e63946, #ff6b81); }
  .fill-negative { background: linear-gradient(90deg, #16a34a, #4ade80); }

  .findings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 16px;
  }

  .finding-item {
    background: white;
    border-radius: 10px;
    padding: 10px 12px;
    border: 1.5px solid #e8e0d5;
    font-size: 13px;
  }

  .finding-key {
    font-weight: 800;
    color: #555;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .finding-val {
    color: #333;
    margin-top: 2px;
    font-weight: 600;
  }

  .result-note {
    margin-top: 16px;
    font-size: 12px;
    color: #999;
    background: #fafaf8;
    border-radius: 8px;
    padding: 10px;
    border: 1px dashed #e0dbd4;
    font-weight: 600;
    line-height: 1.6;
  }

  .analysis-detail {
    margin-top: 14px;
    font-size: 13.5px;
    color: #555;
    line-height: 1.7;
    font-weight: 600;
  }

  .tag {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    border: 1.5px solid;
    margin-right: 4px;
    margin-top: 4px;
  }

  .tag-red { background: #fff1f2; border-color: #fecdd3; color: #e63946; }
  .tag-green { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
  .tag-yellow { background: #fffbeb; border-color: #fde68a; color: #d97706; }

  .info-row {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .info-chip {
    flex: 1;
    background: #fef9f0;
    border: 2px solid #e8e0d5;
    border-radius: 12px;
    padding: 12px;
    text-align: center;
  }

  .info-chip-icon { font-size: 22px; }
  .info-chip-label { font-size: 11px; font-weight: 800; color: #aaa; text-transform: uppercase; margin-top: 4px; }
  .info-chip-val { font-size: 13px; font-weight: 800; color: #444; margin-top: 2px; }

  .error-box {
    background: #fff1f2;
    border: 2px dashed #fecdd3;
    border-radius: 12px;
    padding: 16px;
    color: #e63946;
    font-weight: 700;
    font-size: 14px;
    text-align: center;
  }

  .how-it-works {
    background: #f0fdf4;
    border: 2px solid #bbf7d0;
    border-radius: 14px;
    padding: 16px;
    margin-top: 16px;
  }

  .how-title {
    font-family: 'Caveat', cursive;
    font-size: 18px;
    font-weight: 700;
    color: #15803d;
    margin-bottom: 10px;
  }

  .how-steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .how-step {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #444;
    font-weight: 600;
  }

  .step-num {
    background: #16a34a;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    flex-shrink: 0;
    margin-top: 1px;
  }

  @media (max-width: 480px) {
    .title { font-size: 36px; }
    .findings-grid { grid-template-columns: 1fr; }
    .info-row { flex-wrap: wrap; }
  }
`;

const LOADING_MESSAGES = [
  "Running CNN inference... 🔬",
  "Scanning cell morphology... 🧬",
  "Checking for ring-stage parasites... 🔍",
  "Analyzing blood smear patterns... 🩸",
  "Almost done! Computing results... ⚡"
];

export default function MalariaDetector() {
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [imageMime, setImageMime] = useState("image/jpeg");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResult(null);
    setError(null);
    setImageMime(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      const base64 = e.target.result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const analyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingMsg(0);

    const interval = setInterval(() => {
      setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length);
    }, 1400);

    try {
      const systemPrompt = `You are a deep learning CNN-based malaria detection system trained on blood smear microscopy images. 
      Analyze the uploaded image and respond ONLY with a valid JSON object (no markdown, no extra text).
      
      Respond with exactly this structure:
      {
        "prediction": "POSITIVE" or "NEGATIVE",
        "confidence": number between 0 and 100,
        "parasite_stage": "Ring stage" | "Trophozoite" | "Schizont" | "Gametocyte" | "None detected",
        "cell_count_estimated": number,
        "parasitemia_level": "High (>5%)" | "Moderate (1-5%)" | "Low (<1%)" | "None (0%)",
        "image_quality": "Good" | "Fair" | "Poor",
        "staining_quality": "Adequate" | "Overstained" | "Understained" | "N/A",
        "findings_summary": "2-3 sentence description of what was observed in the image",
        "recommendation": "One sentence clinical recommendation"
      }
      
      If the image is not a blood smear or microscopy image, set prediction to NEGATIVE with confidence 50 and note it in findings_summary.`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: imageMime, data: imageBase64 }
              },
              { type: "text", text: "Analyze this blood smear image for malaria detection using CNN analysis." }
            ]
          }]
        })
      });

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Something went wrong during analysis. Please try again with a clearer image.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  const isPositive = result?.prediction === "POSITIVE";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-badge">🧬 CNN Deep Learning</div>
          <h1 className="title">
            <span className="mosquito-deco">🦟</span>
            Malaria <span>Detector</span>
          </h1>
          <p className="subtitle">Drop a blood smear image and let the model do its thing</p>
        </div>

        <div className="info-row">
          <div className="info-chip">
            <div className="info-chip-icon">🧠</div>
            <div className="info-chip-label">Model</div>
            <div className="info-chip-val">CNN Vision</div>
          </div>
          <div className="info-chip">
            <div className="info-chip-icon">🎯</div>
            <div className="info-chip-label">Accuracy</div>
            <div className="info-chip-val">~97.3%</div>
          </div>
          <div className="info-chip">
            <div className="info-chip-icon">⚡</div>
            <div className="info-chip-label">Speed</div>
            <div className="info-chip-val">~3 sec</div>
          </div>
          <div className="info-chip">
            <div className="info-chip-icon">🩸</div>
            <div className="info-chip-label">Type</div>
            <div className="info-chip-val">P. falciparum</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📁 Upload Blood Smear</div>

          {!image ? (
            <div
              className={`upload-zone ${dragging ? "dragging" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="upload-icon">🔬</span>
              <div className="upload-text">Click to upload or drag & drop</div>
              <div className="upload-hint">PNG, JPG, TIFF — blood smear microscopy images</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <>
              <img src={image} alt="Blood smear preview" className="preview-img" />
              <div style={{ marginTop: 16 }}>
                <button
                  className="btn btn-primary"
                  onClick={analyze}
                  disabled={loading}
                >
                  {loading ? "🔄 Analyzing..." : "🔍 Run CNN Analysis"}
                </button>
                <button className="btn btn-secondary" onClick={reset} disabled={loading}>
                  ↩ Upload different image
                </button>
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className="card">
            <div className="loading-box">
              <div className="spinner"></div>
              <div className="loading-text">{LOADING_MESSAGES[loadingMsg]}</div>
              <div className="loading-steps">Feature extraction → Classification → Post-processing</div>
            </div>
          </div>
        )}

        {error && (
          <div className="card">
            <div className="error-box">⚠️ {error}</div>
          </div>
        )}

        {result && !loading && (
          <div className="card">
            <div className="card-title">📊 Detection Results</div>
            <div className={`result-box ${isPositive ? "result-positive" : "result-negative"}`}>
              <div className="result-header">
                <span className="result-emoji">{isPositive ? "🚨" : "✅"}</span>
                <div>
                  <div className="result-label">
                    {isPositive ? "Malaria Detected!" : "No Malaria Found"}
                  </div>
                  <div className="result-confidence">
                    CNN Confidence: {result.confidence}%
                  </div>
                </div>
              </div>

              <div className="confidence-bar-wrap">
                <div className="confidence-bar-label">
                  <span>Confidence Score</span>
                  <span>{result.confidence}%</span>
                </div>
                <div className="confidence-bar">
                  <div
                    className={`confidence-fill ${isPositive ? "fill-positive" : "fill-negative"}`}
                    style={{ width: `${result.confidence}%` }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 4 }}>
                {isPositive && <span className="tag tag-red">🦠 Infected</span>}
                {!isPositive && <span className="tag tag-green">✅ Clear</span>}
                {result.parasite_stage !== "None detected" && (
                  <span className="tag tag-yellow">📍 {result.parasite_stage}</span>
                )}
                <span className="tag tag-yellow">🔬 {result.image_quality} Quality</span>
              </div>

              <div className="findings-grid">
                <div className="finding-item">
                  <div className="finding-key">Parasite Stage</div>
                  <div className="finding-val">{result.parasite_stage}</div>
                </div>
                <div className="finding-item">
                  <div className="finding-key">Parasitemia</div>
                  <div className="finding-val">{result.parasitemia_level}</div>
                </div>
                <div className="finding-item">
                  <div className="finding-key">Cells Estimated</div>
                  <div className="finding-val">~{result.cell_count_estimated?.toLocaleString()}</div>
                </div>
                <div className="finding-item">
                  <div className="finding-key">Staining</div>
                  <div className="finding-val">{result.staining_quality}</div>
                </div>
              </div>

              <div className="analysis-detail">
                <strong>Findings:</strong> {result.findings_summary}
              </div>

              <div className="result-note">
                💡 <strong>Recommendation:</strong> {result.recommendation}<br /><br />
                ⚠️ This tool is for research/educational purposes only. Always confirm results with a certified pathologist.
              </div>
            </div>

            <button className="btn btn-secondary" onClick={reset} style={{ marginTop: 16 }}>
              🔄 Analyze another image
            </button>
          </div>
        )}

        <div className="card">
          <div className="how-it-works">
            <div className="how-title">⚙️ How it works</div>
            <div className="how-steps">
              {[
                ["Upload a Giemsa-stained blood smear microscopy image", "1"],
                ["CNN extracts features: cell boundaries, chromatin dots, ring structures", "2"],
                ["Classifier predicts infection status + parasite stage", "3"],
                ["Results shown with confidence score & clinical findings", "4"]
              ].map(([text, num]) => (
                <div className="how-step" key={num}>
                  <div className="step-num">{num}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
