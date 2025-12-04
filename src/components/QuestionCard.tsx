import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Volume2, VolumeX, Bookmark, BookmarkCheck } from 'lucide-react';
import { Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn, shuffleArray } from '@/lib/utils';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';

interface QuestionCardProps {
  question: Question;
  selectedAnswer?: string;
  onSelectAnswer?: (answer: string) => void;
  showResult?: boolean;
  showExplanation?: boolean;
  isStudyMode?: boolean;
  questionNumber?: number;
}

export const QuestionCard = ({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult = false,
  showExplanation: initialShowExplanation = false,
  isStudyMode = false,
  questionNumber,
}: QuestionCardProps) => {
  const [showExplanation, setShowExplanation] = useState(initialShowExplanation);
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const { isInLearningList, addToLearningList, removeFromLearningList } = useApp();

  // Shuffle answers once when question changes (using question.id as dependency)
  const shuffledAnswers = useMemo(() => {
    return shuffleArray(question.answers);
  }, [question.id]);

  const isCorrect = selectedAnswer === question.correctAnswers[0];
  const inLearningList = isInLearningList(question.id);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      toast.error('Text-to-speech not supported on this device');
      return;
    }
    
    if (isSpeaking) {
      stop();
    } else {
      speak(question.question);
    }
  };

  const toggleLearningList = () => {
    if (inLearningList) {
      removeFromLearningList(question.id);
    } else {
      addToLearningList(question.id);
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
          const isSelected = selectedAnswer === answer;
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
              onClick={() => !showResult && onSelectAnswer?.(answer)}
              disabled={showResult || isStudyMode}
              className={cn(
                'w-full p-4 rounded-lg text-left transition-all duration-200 border-2',
                answerStyle,
                !showResult && !isStudyMode && 'cursor-pointer active:scale-[0.98]'
              )}
            >
              <span className="font-medium">{answer}</span>
            </button>
          );
        })}
      </div>

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
