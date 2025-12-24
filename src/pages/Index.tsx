import { Play, History, BookOpen, Bookmark, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HomeCard } from '@/components/HomeCard';
import { Layout } from '@/components/Layout';
import { useApp } from '@/contexts/AppContext';
import { questions, categories } from '@/data/questions';

const Index = () => {
  const navigate = useNavigate();
  const { testResults, learningList, seenQuestions } = useApp();
  
  const lastScore = testResults[0]?.score;
  const lastTotal = testResults[0]?.totalQuestions;
  const learningCount = learningList.filter(l => l.status === 'still-learning').length;

  return (
    <Layout>
      <div className="px-4 py-6 max-w-3xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <span className="text-4xl">🇺🇸</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            US Citizenship Test Prep
          </h1>
          <p className="text-muted-foreground">
            Master all 128 official 2025 USCIS civics questions
          </p>
        </div>
        {/* Disclaimer Banner */}
        <div className="mb-6 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground text-center">
            This app is not affiliated with or endorsed by the U.S. government or USCIS. 
            Questions are based on{' '}
            <a 
              href="https://www.uscis.gov/citizenship/find-study-materials-and-resources/study-for-the-test"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              official USCIS materials
            </a>
          </p>
        </div>
        {/* Progress Overview */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-xl p-4 text-center card-shadow">
            <p className="text-2xl font-bold text-primary">{seenQuestions.length}</p>
            <p className="text-xs text-muted-foreground">Questions Seen</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center card-shadow">
            <p className="text-2xl font-bold text-success">
              {lastScore !== undefined ? `${lastScore}/${lastTotal}` : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Last Score</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center card-shadow">
            <p className="text-2xl font-bold text-warning">{learningCount}</p>
            <p className="text-xs text-muted-foreground">To Review</p>
          </div>
        </div>

        {/* Main Navigation Cards */}
        <div className="space-y-4">
          <HomeCard
            to="/practice"
            icon={<Play size={24} className="text-primary-foreground" />}
            title="Start Practice Test"
            description="20 random questions from the official USCIS list"
            variant="primary"
          />

          <HomeCard
            to="/results"
            icon={<History size={24} className="text-primary" />}
            title="View Past Results"
            description={`${testResults.length} test${testResults.length !== 1 ? 's' : ''} saved • Review your progress`}
          />

          <HomeCard
            to="/study"
            icon={<BookOpen size={24} className="text-primary" />}
            title="All Questions"
            description={`Study all ${questions.length} official USCIS questions by topic`}
          />

          <HomeCard
            to="/learning"
            icon={<Bookmark size={24} className="text-primary" />}
            title="Learning List"
            description={`${learningList.length} questions saved for focused review`}
            badge={learningCount > 0 ? `${learningCount} to learn` : undefined}
          />

          {/* Weak Areas - show only if there are test results */}
          {testResults.length > 0 && (
            <HomeCard
              to="/weak-areas"
              icon={<Target size={24} className="text-primary" />}
              title="Practice Weak Areas"
              description="Focus on questions you've missed before"
            />
          )}
        </div>

        {/* Categories Preview */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-foreground mb-4">Study by Topic</h2>
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(categories).map(([key, category]) => {
              const categoryQuestions = questions.filter(q => q.category === key);
              const seenCount = categoryQuestions.filter(q => 
                seenQuestions.includes(q.id)
              ).length;
              
              return (
                <button
                  key={key}
                  onClick={() => navigate(`/study?category=${key}`)}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl card-shadow hover:bg-accent transition-colors text-left"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {seenCount}/{categoryQuestions.length} studied
                    </p>
                  </div>
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(seenCount / categoryQuestions.length) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
