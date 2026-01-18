import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Volume2, VolumeX, Bookmark, BookmarkCheck, Check } from 'lucide-react';
import { Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, shuffleArray } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useApp } from '@/contexts/AppContext';
import { getRequiredAnswerCount, validateMultipleAnswers } from '@/lib/questionUtils';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  selectedAnswers?: string[];
  onSelectAnswer?: (answer: string) => void;
  onSelectMultipleAnswers?: (answers: string[]) => void;
  onSubmitMultipleAnswers?: () => void;
  showResult?: boolean;
  showExplanation?: boolean;
  isStudyMode?: boolean;
  questionNumber?: number;
  isMultiSelect?: boolean;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  selectedAnswers = [],
  onSelectAnswer,
  onSelectMultipleAnswers,
  onSubmitMultipleAnswers,
  showResult = false,
  showExplanation: initialShowExplanation = false,
  isStudyMode = false,
  questionNumber,
  isMultiSelect = false,
}: QuestionCardProps) => {
  const [showExplanation, setShowExplanation] = useState(initialShowExplanation);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { isInLearningList, addToLearningList, removeFromLearningList } = useApp();

  const requiredCount = getRequiredAnswerCount(question.question);

  // Shuffle answers once when question changes (using question.id as dependency)
  const shuffledAnswers = useMemo(() => {
    return shuffleArray(question.answers);
  }, [question.id]);

  // For single select
  const isCorrectSingle = selectedAnswer ? question.correctAnswers.includes(selectedAnswer) : false;
  
  // For multi select
  const { isCorrect: isCorrectMulti, isComplete } = validateMultipleAnswers(
    selectedAnswers,
    question.correctAnswers,
    requiredCount
  );

  const isCorrect = isMultiSelect ? isCorrectMulti : isCorrectSingle;
  const inLearningList = isInLearningList(question.id);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToSpeak = showResult 
        ? `${question.question}. The correct answer is: ${question.correctAnswers.slice(0, requiredCount).join(', ')}`
        : question.question;
      speak(textToSpeak);
    }
  };

  const toggleLearningList = () => {
    if (inLearningList) {
      removeFromLearningList(question.id);
    } else {
      addToLearningList(question.id);
    }
  };

  const handleAnswerClick = (answer: string) => {
    if (showResult || isStudyMode) return;

    if (isMultiSelect && onSelectMultipleAnswers) {
      // Toggle selection for multi-select
      if (selectedAnswers.includes(answer)) {
        onSelectMultipleAnswers(selectedAnswers.filter(a => a !== answer));
      } else {
        onSelectMultipleAnswers([...selectedAnswers, answer]);
      }
    } else if (onSelectAnswer) {
      onSelectAnswer(answer);
    }
  };

  return (
    <Card className="p-5 card-shadow animate-fade-in">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          {questionNumber && (
            <span className="text-sm font-medium text-muted-foreground mb-2 block">
              Question {questionNumber}
            </span>
          )}
          <h3 className="text-lg font-semibold text-foreground leading-relaxed">
            {question.question}
          </h3>
          {isMultiSelect && !showResult && (
            <p className="text-sm text-primary mt-2">
              Select {requiredCount} answer{requiredCount > 1 ? 's' : ''} ({selectedAnswers.length}/{requiredCount} selected)
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSpeak}
            className="shrink-0"
          >
            {isSpeaking ? (
              <VolumeX size={20} className="text-primary" />
            ) : (
              <Volume2 size={20} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLearningList}
            className="shrink-0"
          >
            {inLearningList ? (
              <BookmarkCheck size={20} className="text-primary" />
            ) : (
              <Bookmark size={20} />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {shuffledAnswers.map((answer, index) => {
          const isSelected = isMultiSelect 
            ? selectedAnswers.includes(answer) 
            : selectedAnswer === answer;
          const isCorrectAnswer = question.correctAnswers.includes(answer);
          
          let answerStyle = 'bg-secondary hover:bg-accent border-transparent';
          
          if (showResult) {
            if (isCorrectAnswer) {
              answerStyle = 'bg-success/10 border-success text-success';
            } else if (isSelected && !isCorrectAnswer) {
              answerStyle = 'bg-destructive/10 border-destructive text-destructive';
            } else {
              answerStyle = 'bg-secondary border-transparent opacity-60';
            }
          } else if (isSelected) {
            answerStyle = 'bg-primary/10 border-primary text-primary';
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(answer)}
              disabled={showResult || isStudyMode}
              className={cn(
                'w-full p-4 rounded-lg text-left transition-all duration-200 border-2 flex items-center justify-between',
                answerStyle,
                !showResult && !isStudyMode && 'cursor-pointer active:scale-[0.98]'
              )}
            >
              <span className="font-medium">{answer}</span>
              {isMultiSelect && isSelected && !showResult && (
                <Check size={20} className="text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Submit button for multi-select */}
      {isMultiSelect && !showResult && selectedAnswers.length >= requiredCount && onSubmitMultipleAnswers && (
        <Button
          onClick={onSubmitMultipleAnswers}
          className="w-full mb-4"
          size="lg"
        >
          Submit Answers
        </Button>
      )}

      {(showResult || isStudyMode) && (
        <div>
          <Button
            variant="ghost"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full justify-between"
          >
            <span className="font-medium">
              {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
            </span>
            {showExplanation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
          
          {showExplanation && (
            <div className="mt-3 p-4 bg-muted rounded-lg animate-fade-in">
              <p className="text-muted-foreground leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
