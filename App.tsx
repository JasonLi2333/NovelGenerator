


import React from 'react';
import useBookGenerator from './hooks/useBookGenerator';
import { GenerationStep } from './types';
import UserInput from './components/UserInput';
import ProgressBar from './components/ProgressBar';
import BookDisplay from './components/BookDisplay';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Button } from './components/common/Button';
import ApprovalView from './components/ApprovalView';
import StreamingContentView from './components/StreamingContentView';
import AgentActivityLog from './components/AgentActivityLog';
import FeatureGrid from './components/FeatureGrid';
import SaveStatusIndicator from './components/SaveStatusIndicator';

const App: React.FC = () => {
  const {
    storyPremise,
    setStoryPremise,
    numChapters,
    setNumChapters,
    storySettings,
    setStorySettings,
    startGeneration,
    continueGeneration,
    regenerateOutline,
    isLoading,
    currentStep,
    error,
    finalBookContent,
    finalMetadataJson,
    generatedChapters,
    currentChapterProcessing,
    totalChaptersToProcess,
    resetGenerator,
    currentStoryOutline,
    setCurrentStoryOutline,
    currentChapterPlan,
    isResumable,
    agentLogs,
    lastSavedAt,
  } = useBookGenerator();

  // Debug logging
  console.log('🎨 App render - currentStep:', currentStep, 'isLoading:', isLoading);

  const handleStartGeneration = () => {
    if (storyPremise && numChapters >= 3) {
      startGeneration(storyPremise, numChapters);
    } else if (isResumable) {
      // For resuming, premise and chapters are already in state
      startGeneration(storyPremise, numChapters);
    } else {
      // Basic validation feedback, can be improved
      alert("Please provide a story premise and at least 3 chapters.");
    }
  };
  
  const handleContinue = () => {
    continueGeneration();
  };

  const handleRegenerateOutline = () => {
    regenerateOutline();
  };

  const handleReset = () => {
    resetGenerator();
  };

  const showProgress = (isLoading || isResumable) && 
                       currentStep !== GenerationStep.Idle && 
                       currentStep !== GenerationStep.Done &&
                       currentStep !== GenerationStep.Error &&
                       currentStep !== GenerationStep.WaitingForOutlineApproval;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-sky-900 text-slate-100 flex flex-col items-center p-4 md:p-8 selection:bg-sky-500 selection:text-white">
      <header className="w-full max-w-4xl mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400 py-2">
            网文生成器
          </h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg animate-pulse">
            v4.1
          </span>
        </div>
        <p className="text-slate-400 mt-2 text-sm md:text-base">
          一杯茶的功夫，成为网文大神。<br />一句话设定，生成百万字长文。
        </p>
      </header>

      <main className="w-full max-w-4xl bg-slate-800 shadow-2xl rounded-lg p-6 md:p-8 animate-fade-in">
        {error && (
          <div className="mb-4 p-4 bg-red-700 border border-red-500 text-white rounded-md">
            <p className="font-semibold">错误：</p>
            <p>{error}</p>
            <button
              onClick={handleReset}
              className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-400 rounded text-sm"
            >
              重试
            </button>
          </div>
        )}

        {(() => {
          console.log('🔍 Checking Idle condition:', currentStep === GenerationStep.Idle, !finalBookContent, !isResumable);
          return currentStep === GenerationStep.Idle && !finalBookContent && !isResumable;
        })() &&(
          <>
            <UserInput
              storyPremise={storyPremise}
              setStoryPremise={setStoryPremise}
              numChapters={numChapters}
              setNumChapters={setNumChapters}
              genre={storySettings.genre || 'fantasy'}
              setGenre={(genre) => setStorySettings({ ...storySettings, genre })}
              onSubmit={handleStartGeneration}
              isLoading={isLoading}
            />
            <div className="mt-12 border-t border-slate-700 pt-6">
              <p className="text-[10px] text-slate-500 mb-4 text-left leading-relaxed">
                * 创作时间：根据长度，从几分钟到几小时不等。每章都经过多轮AI精修，确保专业品质。耐心成就完美。
              </p>
              <p className="text-[10px] text-slate-500 mb-2 text-left">** 技术流程：</p>
              <div className="text-[10px] text-slate-500 leading-relaxed text-left space-y-1">
                <p>专家协作：三个AI专家（结构、角色、场景）顺序工作，每个都接收完整上下文和前序输出。</p>
                <p>槽位架构：结构代理创建带嵌入槽位的文本框架，各专家填充对话、动作、描写。</p>
                <p>实时验证：生成过程中自动检查重复模式、语气一致性、内容平衡。</p>
                <p>持久上下文：故事上下文数据库追踪所有章节的角色状态、情节线索、世界事实，确保连贯性。</p>
                <p>综合整合：高级合并引擎解决冲突，生成过渡，执行槽位替换和后备处理。</p>
                <p>多轮精修：轻度润色 → 重复修复 → 连贯性检查 → 专业级打磨，达到出版品质。</p>
              </div>
            </div>
          </>
        )}
        
        {(() => {
          const shouldShow = currentStep === GenerationStep.GeneratingOutline;
          console.log('🔍 Checking GeneratingOutline condition:', currentStep === GenerationStep.GeneratingOutline, 'shouldShow:', shouldShow);
          return shouldShow;
        })() && (
          <div className="text-center py-12">
            <LoadingSpinner />
            <p className="mt-4 text-sky-300 text-lg">正在生成故事大纲...</p>
            <p className="mt-2 text-slate-400 text-sm">这可能需要10-30秒</p>
          </div>
        )}

        {currentStep === GenerationStep.WaitingForOutlineApproval && !isLoading && (
            <ApprovalView
              title="审阅并编辑故事大纲"
              content={currentStoryOutline}
              onContentChange={setCurrentStoryOutline}
              onApprove={handleContinue}
              onRegenerate={handleRegenerateOutline}
              isLoading={isLoading}
            />
        )}


        {showProgress && (
           <div className="text-center">
            {isLoading && <LoadingSpinner />}
            
            {isResumable && !isLoading && (
              <div className="my-6 p-4 border border-sky-700 bg-sky-900/30 rounded-md">
                  <p className="text-lg text-sky-300 mb-4">您有一部作品正在创作中。</p>
                  <Button onClick={handleStartGeneration} variant="primary">
                      继续创作
                  </Button>
              </div>
            )}
            
            <ProgressBar
              currentStep={currentStep}
              currentChapterProcessing={currentChapterProcessing}
              totalChaptersToProcess={totalChaptersToProcess}
            />
            
            {/* Save status indicator */}
            {generatedChapters.length > 0 && (
              <SaveStatusIndicator 
                generatedChapters={generatedChapters}
                savedAt={lastSavedAt}
              />
            )}
            
            {currentStep === GenerationStep.GeneratingChapters && generatedChapters.length > 0 && currentChapterProcessing > 0 ? (
                <StreamingContentView
                    title={`正在创作第 ${currentChapterProcessing} 章：${generatedChapters[currentChapterProcessing - 1]?.title || '...'}`}
                    content={generatedChapters[currentChapterProcessing - 1]?.content || ''}
                />
            ) : (
              <>
                {currentStoryOutline && (
                  <div className="mt-4 p-4 bg-slate-700 rounded-md max-h-60 overflow-y-auto text-left">
                    <h3 className="font-semibold mb-2 text-sky-400">故事大纲（进行中）：</h3>
                    <pre className="whitespace-pre-wrap text-sm text-slate-300">{currentStoryOutline.slice(0,1000)}...</pre>
                  </div>
                )}
                {currentChapterPlan && (
                  <div className="mt-4 p-4 bg-slate-700 rounded-md max-h-60 overflow-y-auto text-left">
                    <h3 className="font-semibold mb-2 text-sky-400">章节计划（进行中）：</h3>
                    <pre className="whitespace-pre-wrap text-sm text-slate-300">{currentChapterPlan.slice(0,1000)}...</pre>
                  </div>
                )}
                {generatedChapters.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-700 rounded-md max-h-60 overflow-y-auto text-left">
                    <h3 className="font-semibold mb-2 text-sky-400">章节生成进度：</h3>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                      {generatedChapters.map((ch, idx) => (
                        <li key={idx}>第 {idx + 1} 章：{ch.title || `生成中...`} ({(ch.content?.length || 0) > 0 ? '已生成' : '待处理'})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Agent Activity Log */}
            {agentLogs.length > 0 && (
              <AgentActivityLog logs={agentLogs} />
            )}
          </div>
        )}


        {!isLoading && finalBookContent && finalMetadataJson && (
          <>
            <BookDisplay
              bookContent={finalBookContent}
              metadataJson={finalMetadataJson}
              onReset={handleReset}
            />
            
            {/* Show agent logs after completion too */}
            {agentLogs.length > 0 && (
              <AgentActivityLog logs={agentLogs} />
            )}
          </>
        )}
      </main>
      <footer className="w-full max-w-4xl mt-8">
        <div className="text-center text-slate-500 text-[10px]">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <a 
              href="https://github.com/KazKozDev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 transition-colors duration-200 underline decoration-dotted"
            >
              KazKozDev
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;