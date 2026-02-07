// Utility to detect required number of answers from question text
export function getRequiredAnswerCount(questionText: string): number {
  const lowerText = questionText.toLowerCase();
  
  // Match patterns like "name two", "name three", "what are three", etc.
  const patterns = [
    { regex: /\bname\s+one\b|\bname\s+1\b/i, count: 1 },
    { regex: /\bname\s+two\b|\bname\s+2\b/i, count: 2 },
    { regex: /\bname\s+three\b|\bname\s+3\b/i, count: 3 },
    { regex: /\bname\s+four\b|\bname\s+4\b/i, count: 4 },
    { regex: /\bname\s+five\b|\bname\s+5\b/i, count: 5 },
    { regex: /\bname\s+six\b|\bname\s+6\b/i, count: 6 },
    { regex: /\bwhat\s+is\s+one\b|\bwhat\s+is\s+1\b/i, count: 1 },
    { regex: /\bwhat\s+are\s+two\b|\bwhat\s+are\s+2\b/i, count: 2 },
    { regex: /\bwhat\s+are\s+three\b|\bwhat\s+are\s+3\b/i, count: 3 },
    { regex: /\bwhat\s+are\s+four\b|\bwhat\s+are\s+4\b/i, count: 4 },
    { regex: /\bwhat\s+are\s+five\b|\bwhat\s+are\s+5\b/i, count: 5 },
    { regex: /\bwhat\s+are\s+six\b|\bwhat\s+are\s+6\b/i, count: 6 },
  ];
  
  for (const { regex, count } of patterns) {
    if (regex.test(questionText)) {
      return count;
    }
  }
  
  return 1; // Default: single answer required
}

// Check if all selected answers are correct
// For questions with required count (e.g., "name two"): must select exactly that many, all correct
// For questions without required count: any selection allowed, but ALL must be correct
export function validateMultipleAnswers(
  selectedAnswers: string[],
  correctAnswers: string[],
  requiredCount: number
): { isCorrect: boolean; isComplete: boolean } {
  // For "name X" questions, must meet minimum count
  // For regular questions, just need at least 1 selection
  const isComplete = requiredCount > 1 
    ? selectedAnswers.length >= requiredCount
    : selectedAnswers.length >= 1;
  
  // Check if ALL selected answers are in the correct answers list
  // If ANY selected answer is wrong, the result is wrong
  const allCorrect = selectedAnswers.length > 0 && selectedAnswers.every(answer => 
    correctAnswers.includes(answer)
  );
  
  return {
    isCorrect: allCorrect,
    isComplete,
  };
}
