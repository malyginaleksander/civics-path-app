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
      return {
        answers: ["This varies by congressional district", "Check your local representative"],
        correctAnswers: ["Answers will vary by district"],
        needsStateSelection: false,
        hint: "Find your representative at house.gov",
      };

    // Q30: Speaker of the House
    case 30:
      return {
        answers: [federalOfficials.speakerOfHouse, "The Vice President", "The President", "The Chief Justice"],
        correctAnswers: [federalOfficials.speakerOfHouse, "Mike Johnson"],
        needsStateSelection: false,
      };

    // Q38: President
    case 38:
      return {
        answers: [federalOfficials.president, "The Vice President", "The Speaker", "The Chief Justice"],
        correctAnswers: [federalOfficials.president, "Donald Trump", "Donald J. Trump", "Trump"],
        needsStateSelection: false,
      };

    // Q39: Vice President
    case 39:
      return {
        answers: [federalOfficials.vicePresident, "The President", "The Speaker", "The Chief Justice"],
        correctAnswers: [federalOfficials.vicePresident, "JD Vance", "Vance", "J.D. Vance"],
        needsStateSelection: false,
      };

    // Q57: Chief Justice
    case 57:
      return {
        answers: [federalOfficials.chiefJustice, "The President", "The Vice President", "The Speaker"],
        correctAnswers: [federalOfficials.chiefJustice, "John Roberts", "Roberts"],
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
