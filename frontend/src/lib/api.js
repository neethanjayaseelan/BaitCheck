// Backend API base URL (set VITE_API_URL in frontend/.env to override)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Asks the Flask API for the trained model's phishing probability (0 to 1).
// Throws if the backend is not running or returns an error.
export async function modelProbability(text) {
  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Backend request failed')
  return typeof data.probability === 'number' ? data.probability : parseFloat(data.score) / 100
}

// Blends the rule score (0 to 100) with the model's probability. The model can raise the
// score up to the average of the two, but never lowers what the rules found.
export function combineScores(ruleScore, probability) {
  return Math.max(ruleScore, Math.round((ruleScore + probability * 100) / 2))
}

// Turns the model's probability into a row for the findings list.
export function modelFinding(probability) {
  const percent = Math.round(probability * 100)
  const sev = probability > 0.7 ? 'high' : probability > 0.4 ? 'med' : 'low'
  return {
    sev,
    title: `Trained model: ${percent}% likely phishing`,
    detail:
      'A machine-learning model trained on labelled messages rated the wording of this email.',
    pts: percent,
  }
}
