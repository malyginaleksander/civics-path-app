// Utility to get dynamic answers based on user's selected state
import { getStateData, federalOfficials, StateData } from '@/data/stateData';
import { Question } from '@/data/questions';

export interface DynamicAnswerResult {
  answers: string[];
  correctAnswers: string[];
  needsStateSelection: boolean;
  hint?: string;
  isCustom?: boolean; // True if using user's custom override
}

export interface CustomOfficials {
  governor?: string;
  senator1?: string;
  senator2?: string;
  representative?: string;
}

// Pool of political figure names used as distractors
const POLITICAL_FIGURE_POOL = [
  "JD Vance",
  "Mike Johnson", 
  "Donald J. Trump",
  "Marco Rubio",
  "John G. Roberts, Jr."
];

// Build answer options: correct answer + 3 distractors from the pool
function buildAnswerOptions(correctAnswer: string): string[] {
  // Filter out any name that matches the correct answer
  const distractors = POLITICAL_FIGURE_POOL.filter(
    name => name.toLowerCase() !== correctAnswer.toLowerCase()
  );
  // Take first 3 distractors and add the correct answer
  return [correctAnswer, ...distractors.slice(0, 3)];
}

// Get dynamic answers for a question based on user's state and custom overrides
export function getDynamicAnswers(
  question: Question,
  selectedState: string | null,
  customOfficials?: CustomOfficials | null
): DynamicAnswerResult | null {
  if (!question.dynamicAnswer) return null;

  const questionId = question.id;
  const stateData = selectedState ? getStateData(selectedState) : null;

  switch (questionId) {
    // Q23: Who is one of your state's U.S. senators now?
    case 23:
      if (!stateData) {
        return {
          answers: ["Select your state in Settings"],
          correctAnswers: [],
          needsStateSelection: true,
          hint: "Go to Settings → Test Options → Your State",
        };
      }
      // Use custom senators if provided
      const customSenators = [];
      if (customOfficials?.senator1) customSenators.push(customOfficials.senator1);
      if (customOfficials?.senator2) customSenators.push(customOfficials.senator2);
      const effectiveSenators = customSenators.length > 0 ? customSenators : stateData.senators;
      
      return {
        answers: [...effectiveSenators, "The President", "The Governor"],
        correctAnswers: effectiveSenators,
        needsStateSelection: false,
        isCustom: customSenators.length > 0,
      };

    // Q29: Name your U.S. representative
    case 29:
      // If user entered their representative, use it with distractors
      if (customOfficials?.representative) {
        return {
          answers: buildAnswerOptions(customOfficials.representative),
          correctAnswers: [customOfficials.representative],
          needsStateSelection: false,
          isCustom: true,
        };
      }
      // Otherwise show generic options that are all correct
      const representativeAnswers = ["This varies by congressional district", "Check your local representative"];
      return {
        answers: representativeAnswers,
        correctAnswers: representativeAnswers,
        needsStateSelection: false,
        hint: "Enter your representative in Settings for personalized answers",
      };

    // Q30: Speaker of the House
    case 30:
      return {
        answers: buildAnswerOptions(federalOfficials.speakerOfHouse),
        correctAnswers: [federalOfficials.speakerOfHouse, "Mike Johnson"],
        needsStateSelection: false,
      };

    // Q38: President
    case 38:
      return {
        answers: buildAnswerOptions(federalOfficials.president),
        correctAnswers: [federalOfficials.president, "Donald Trump", "Donald J. Trump", "Trump"],
        needsStateSelection: false,
      };

    // Q39: Vice President
    case 39:
      return {
        answers: buildAnswerOptions(federalOfficials.vicePresident),
        correctAnswers: [federalOfficials.vicePresident, "JD Vance", "Vance", "J.D. Vance"],
        needsStateSelection: false,
      };

    // Q57: Chief Justice
    case 57:
      return {
        answers: buildAnswerOptions(federalOfficials.chiefJustice),
        correctAnswers: [federalOfficials.chiefJustice, "John Roberts", "Roberts", "John G. Roberts, Jr."],
        needsStateSelection: false,
      };

    // Q61: Governor
    case 61:
      if (!stateData) {
        return {
          answers: ["Select your state in Settings"],
          correctAnswers: [],
          needsStateSelection: true,
          hint: "Go to Settings → Test Options → Your State",
        };
      }
      // Use custom governor if provided
      const effectiveGovernor = customOfficials?.governor || stateData.governor;
      return {
        answers: [effectiveGovernor, "The President", "The Mayor", "The Senator"],
        correctAnswers: [effectiveGovernor],
        needsStateSelection: false,
        isCustom: !!customOfficials?.governor,
      };

    // Q62: State Capital
    case 62:
      if (!stateData) {
        return {
          answers: ["Select your state in Settings"],
          correctAnswers: [],
          needsStateSelection: true,
          hint: "Go to Settings → Test Options → Your State",
        };
      }
      return {
        answers: [stateData.capital, "Washington D.C.", "New York City", "Los Angeles"],
        correctAnswers: [stateData.capital],
        needsStateSelection: false,
      };

    default:
      return null;
  }
}

// Check if a question requires state selection and state is not selected
export function questionNeedsState(questionId: number, selectedState: string | null): boolean {
  const stateQuestions = [23, 61, 62]; // Questions that need state selection
  return stateQuestions.includes(questionId) && !selectedState;
}
