
export const geminiService = {
  /**
   * Generates a quiz based on a given topic using backend API
   */
  async generateQuiz(topic: string, count: number = 5) {
    const response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, count })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate quiz');
    }
    
    return data.questions;
  },

  /**
   * Explains concepts using backend API
   */
  async explainConcept(concept: string) {
    const response = await fetch('/api/explain-concept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to explain concept');
    }
    
    return data.explanation;
  }
};
