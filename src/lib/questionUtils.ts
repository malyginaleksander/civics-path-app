// Utility to detect required number of answers from question text
export function getRequiredAnswerCount(questionText: string): number {
  const lowerText = questionText.toLowerCase();
  
  // Match patterns like "name two", "name three", "what are three", etc.
  const patterns = [
    { regex: /name\s+one|name\s+1/i, count: 1 },
    { regex: /name\s+two|name\s+2/i, count: 2 },
    { regex: /name\s+three|name\s+3/i, count: 3 },
    { regex: /name\s+four|name\s+4/i, count: 4 },
    { regex: /name\s+five|name\s+5/i, count: 5 },
    { regex: /what\s+is\s+one|what\s+is\s+1/i, count: 1 },
    { regex: /what\s+are\s+two|what\s+are\s+2/i, count: 2 },
    { regex: /what\s+are\s+three|what\s+are\s+3/i, count: 3 },
    { regex: /what\s+are\s+four|what\s+are\s+4/i, count: 4 },
    { regex: /what\s+are\s+five|what\s+are\s+5/i, count: 5 },
  ];
  
  for (const { regex, count } of patterns) {
    if (regex.test(questionText)) {
      return count;
    }
  }
  
  return 1; // Default: single answer required
}

// Check if all selected answers are correct and meet the minimum count
export function validateMultipleAnswers(
  selectedAnswers: string[],
  correctAnswers: string[],
  requiredCount: number
): { isCorrect: boolean; isComplete: boolean } {
  // Check if we have enough selections
  const isComplete = selectedAnswers.length >= requiredCount;
  
  // Check if ALL selected answers are in the correct answers list
  const allCorrect = selectedAnswers.every(answer => 
    correctAnswers.includes(answer)
  );
  
  return {
    isCorrect: isComplete && allCorrect,
    isComplete,
  };
}
