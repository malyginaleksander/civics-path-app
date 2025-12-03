import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Play, TrendingDown } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getQuestionById, categories } from '@/data/questions';
import { cn } from '@/lib/utils';

const WeakAreas = () => {
  const navigate = useNavigate();
  const { testResults, learningList } = useApp();

  // Analyze wrong answers across all tests
  const weakQuestions = useMemo(() => {
    const wrongCounts: Record<number, number> = {};
    
    testResults.forEach(result => {
      result.answers.forEach(answer => {
        if (!answer.isCorrect) {
          wrongCounts[answer.questionId] = (wrongCounts[answer.questionId] || 0) + 1;
        }
      });
    });

    // Sort by wrong count (most wrong first)
    const sortedQuestions = Object.entries(wrongCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([id, count]) => ({
        questionId: Number(id),
        wrongCount: count,
        question: getQuestionById(Number(id)),
      }))
      .filter(q => q.question);

    return sortedQuestions;
  }, [testResults]);

  // Get "still learning" items from learning list
  const stillLearningIds = useMemo(() => {
    return learningList
      .filter(l => l.status === 'still-learning')
      .map(l => l.questionId);
  }, [learningList]);

  // Combine weak questions with learning list items
  const practiceQuestions = useMemo(() => {
    const allIds = new Set([
      ...weakQuestions.map(q => q.questionId),
      ...stillLearningIds,
    ]);
    return Array.from(allIds).slice(0, 20);
  }, [weakQuestions, stillLearningIds]);

  const startPractice = () => {
    if (practiceQuestions.length > 0) {
      navigate(`/practice?mode=wrong&questions=${practiceQuestions.join(',')}`);
    }
  };

  return (
    <Layout>
      <PageHeader title="Weak Areas" showBack />

      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* Header Stats */}
        <div className="bg-card rounded-2xl p-6 card-shadow mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Target size={24} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Focus Practice</h2>
              <p className="text-muted-foreground">
                Questions you've struggled with before
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-2xl font-bold text-destructive">{weakQuestions.length}</p>
              <p className="text-sm text-muted-foreground">Frequently Wrong</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-xl">
              <p className="text-2xl font-bold text-warning">{stillLearningIds.length}</p>
              <p className="text-sm text-muted-foreground">Still Learning</p>
            </div>
          </div>

          <Button 
            onClick={startPractice} 
            className="w-full"
            disabled={practiceQuestions.length === 0}
          >
            <Play size={20} className="mr-2" />
            Practice {practiceQuestions.length} Questions
          </Button>
        </div>

        {/* Weak Questions List */}
        {weakQuestions.length > 0 ? (
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">Most Missed Questions</h3>
            <div className="space-y-3">
              {weakQuestions.slice(0, 10).map((item) => {
                if (!item.question) return null;
                const category = categories[item.question.category];

                return (
                  <div 
                    key={item.questionId}
                    className="bg-card rounded-xl p-4 card-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10">
                        <TrendingDown size={16} className="text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{category.icon}</span>
                          <span className="text-xs text-muted-foreground">{category.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                            Wrong {item.wrongCount}x
                          </span>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed">
                          {item.question.question}
                        </p>
                        <p className="text-xs text-success mt-1">
                          Answer: {item.question.correctAnswers[0]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Target size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Weak Areas Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete more practice tests to identify questions you need to focus on
            </p>
            <Button onClick={() => navigate('/practice')}>
              Start Practice Test
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WeakAreas;
