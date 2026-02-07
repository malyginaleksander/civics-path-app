import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Volume2, VolumeX, Bookmark, BookmarkCheck, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, shuffleArray } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useApp } from '@/contexts/AppContext';
import { getRequiredAnswerCount, validateMultipleAnswers } from '@/lib/questionUtils';
import { getDynamicAnswers } from '@/lib/dynamicAnswers';

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
  const { isInLearningList, addToLearningList, removeFromLearningList, settings } = useApp();
  const navigate = useNavigate();

  const requiredCount = getRequiredAnswerCount(question.question);

  // Get dynamic answers if applicable
  const dynamicData = useMemo(() => {
    return getDynamicAnswers(question, settings.selectedState, settings.customOfficials);
  }, [question.id, settings.selectedState, settings.customOfficials]);

  // Use dynamic answers if available, otherwise use question's answers
  const effectiveAnswers = dynamicData?.answers || question.answers;
  const effectiveCorrectAnswers = dynamicData?.correctAnswers || question.correctAnswers;
  const needsStateSelection = dynamicData?.needsStateSelection || false;

  // Shuffle answers once when question changes (using question.id as dependency)
  const shuffledAnswers = useMemo(() => {
    return shuffleArray(effectiveAnswers);
  }, [question.id, effectiveAnswers]);

  // For single select
  const isCorrectSingle = selectedAnswer ? effectiveCorrectAnswers.includes(selectedAnswer) : false;
  
  // For multi select
  const { isCorrect: isCorrectMulti, isComplete } = validateMultipleAnswers(
    selectedAnswers,
    effectiveCorrectAnswers,
    requiredCount
  );

  const isCorrect = isMultiSelect ? isCorrectMulti : isCorrectSingle;
  const inLearningList = isInLearningList(question.id);

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      const textToSpeak = showResult 
        ? `${question.question}. The correct answer is: ${effectiveCorrectAnswers.slice(0, requiredCount).join(', ')}`
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
          {question.dynamicAnswer && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded">
              Answer varies • Updated Jan 2025
            </span>
          )}
          {isMultiSelect && !showResult && (
            <p className="text-sm text-primary mt-2">
              {requiredCount > 1 
                ? `Select ${requiredCount} answers (${selectedAnswers.length}/${requiredCount} selected)`
                : `Select answer(s) and tap Submit (${selectedAnswers.length} selected)`
              }
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

      {/* State selection needed warning */}
      {needsStateSelection && (
        <div className="mb-4 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">State selection required</p>
            <p className="text-sm text-muted-foreground mt-1">
              {dynamicData?.hint || "Please select your state in Settings to see the correct answers."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/settings')}
            >
              Go to Settings
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {shuffledAnswers.map((answer, index) => {
          const isSelected = isMultiSelect 
            ? selectedAnswers.includes(answer) 
            : selectedAnswer === answer;
          const isCorrectAnswer = effectiveCorrectAnswers.includes(answer);
          
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
      {isMultiSelect && !showResult && selectedAnswers.length >= 1 && onSubmitMultipleAnswers && (
        <Button
          onClick={onSubmitMultipleAnswers}
          className="w-full mb-4"
          size="lg"
          disabled={requiredCount > 1 && selectedAnswers.length < requiredCount}
        >
          Submit Answer{selectedAnswers.length > 1 ? 's' : ''}
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
