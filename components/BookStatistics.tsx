import React, { useMemo } from 'react';

interface BookStatisticsProps {
  bookContent: string;
  metadata: any;
}

const BookStatistics: React.FC<BookStatisticsProps> = ({ bookContent, metadata }) => {
  const stats = useMemo(() => {
    // Calculate character count (Chinese uses characters, not words)
    const 字符 = bookContent.replace(/\s/g, '').length;
    const totalWords = 字符; // For Chinese, use character count as word count
    
    // Calculate reading time (average 500 characters per minute for Chinese)
    const readingTimeMinutes = Math.ceil(字符 / 500);
    
    // Get chapter count
    const chapterMatches = bookContent.match(/^##\s+Chapter\s+\d+/gm);
    const chapterCount = chapterMatches ? chapterMatches.length : 0;
    
    // Calculate average words per chapter
    const avgWordsPerChapter = chapterCount > 0 ? Math.round(totalWords / chapterCount) : 0;
    
    // Calculate dialogue ratio (approximate - count lines with quotes)
    const dialogueLines = bookContent.split('\n').filter(line => 
      line.includes('"') || line.includes('"') || line.includes('"')
    ).length;
    const totalLines = bookContent.split('\n').filter(line => line.trim().length > 0).length;
    const dialogueRatio = totalLines > 0 ? Math.round((dialogueLines / totalLines) * 100) : 0;
    
    // Get tension levels from metadata
    const emotionalArc = metadata?.emotional_arc_by_chapter || {};
    const tensionLevels = Object.values(emotionalArc).map((entry: any) => 
      typeof entry.tensionLevel === 'number' ? entry.tensionLevel : parseInt(entry.tensionLevel) || 5
    );
    const avgTension = tensionLevels.length > 0 
      ? (tensionLevels.reduce((a: number, b: number) => a + b, 0) / tensionLevels.length).toFixed(1)
      : '5.0';
    
    return {
      totalWords,
      字符,
      readingTimeMinutes,
      chapterCount,
      avgWordsPerChapter,
      dialogueRatio,
      avgTension,
      tensionLevels
    };
  }, [bookContent, metadata]);

  const formatReadingTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 总字数 */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-sky-500/30 p-4 rounded-lg shadow-lg hover:border-sky-500/50 transition-colors">
        <div className="text-sky-300 text-sm font-medium mb-1">总字数</div>
        <div className="text-white text-3xl font-bold">{stats.totalWords.toLocaleString()}</div>
        <div className="text-slate-400 text-xs mt-1">{stats.字符.toLocaleString()} 字符</div>
      </div>

      {/* 阅读时长 */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-sky-500/30 p-4 rounded-lg shadow-lg hover:border-sky-500/50 transition-colors">
        <div className="text-sky-300 text-sm font-medium mb-1">阅读时长</div>
        <div className="text-white text-3xl font-bold">{formatReadingTime(stats.readingTimeMinutes)}</div>
        <div className="text-slate-400 text-xs mt-1">~500字/分钟</div>
      </div>

      {/* 章节 */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-sky-500/30 p-4 rounded-lg shadow-lg hover:border-sky-500/50 transition-colors">
        <div className="text-sky-300 text-sm font-medium mb-1">章节</div>
        <div className="text-white text-3xl font-bold">{stats.chapterCount}</div>
        <div className="text-slate-400 text-xs mt-1">{stats.avgWordsPerChapter.toLocaleString()} 字平均</div>
      </div>

      {/* 对话 Ratio */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-sky-500/30 p-4 rounded-lg shadow-lg hover:border-sky-500/50 transition-colors">
        <div className="text-sky-300 text-sm font-medium mb-1">对话</div>
        <div className="text-white text-3xl font-bold">{stats.dialogueRatio}%</div>
        <div className="text-slate-400 text-xs mt-1">内容占比</div>
      </div>
    </div>
  );
};

export default BookStatistics;
