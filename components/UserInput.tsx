import React from 'react';
import { Button } from './common/Button';
import { TextArea } from './common/TextArea';
import { Input } from './common/Input';
import { Select } from './common/Select';
import { MIN_CHAPTERS } from '../constants';
import { GENRE_CONFIGS } from '../utils/genrePrompts';

interface UserInputProps {
  storyPremise: string;
  setStoryPremise: (value: string) => void;
  numChapters: number;
  setNumChapters: (value: number) => void;
  genre: string;
  set类型: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const UserInput: React.FC<UserInputProps> = ({
  storyPremise,
  setStoryPremise,
  numChapters,
  setNumChapters,
  genre,
  set类型,
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numChapters >= MIN_CHAPTERS) {
      onSubmit();
    } else {
      alert(`请输入至少 ${MIN_CHAPTERS} 章.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="storyPremise" className="block text-sm font-medium text-sky-300 mb-1">
          故事设定
        </label>
        <TextArea
          id="storyPremise"
          value={storyPremise}
          onChange={(e) => setStoryPremise(e.target.value)}
          placeholder="输入一段话描述你的故事构想（例如：一位修仙者意外获得上古传承，从此踏上逆天改命之路...）"
          rows={5}
          required
          maxLength={1200} 
          className="bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500"
        />
        <p className="text-xs text-slate-400 mt-1">最多1200字符。尽量详细描述</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-sky-300 mb-1">
            类型
          </label>
          <Select
            id="genre"
            value={genre}
            onChange={(e) => set类型(e.target.value)}
            className="bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500"
          >
            {Object.entries(GENRE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.name} - {config.description}
              </option>
            ))}
          </Select>
          <p className="text-xs text-slate-400 mt-1">选择故事类型</p>
        </div>

        <div>
          <label htmlFor="numChapters" className="block text-sm font-medium text-sky-300 mb-1">
            章节数量
          </label>
          <Input
            id="numChapters"
            type="number"
            value={numChapters}
            onChange={(e) => setNumChapters(Math.max(MIN_CHAPTERS, parseInt(e.target.value, 10) || MIN_CHAPTERS))}
            min={MIN_CHAPTERS}
            required
            className="bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500"
          />
           <p className="text-xs text-slate-400 mt-1">最少 {MIN_CHAPTERS} 章</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || !storyPremise || numChapters < MIN_CHAPTERS} variant="primary">
          {isLoading ? '正在构思您的故事...' : '开始创作'}
        </Button>
      </div>
       <div className="mt-12 pt-12 border-t border-slate-700 space-y-8 text-slate-300">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-2">
            如何开始
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">01. 从你的构想开始</h3>
            <p className="text-sm text-slate-400">
              选择类型，设定章节数，分享你的故事构想。就这么简单。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">02. AI智能架构设计</h3>
            <p className="text-sm text-slate-400">
              AI构建完整的故事架构——情节推进、角色成长、情感节奏。每个细节在动笔前就已规划完毕。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">03. 您始终掌控全局</h3>
            <p className="text-sm text-slate-400">
              审阅大纲，精心修改，满意后确认。这是您的故事，我们只是帮您实现它。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">04. 三位专家联手打造</h3>
            <p className="text-sm text-slate-400">
              结构、角色、场景。三个专业AI代理各司其职，实时协作，精准创作每一章。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">05. 内置质量保障</h3>
            <p className="text-sm text-slate-400">
              每章都经过多轮编辑润色、一致性检查、叙事流畅度分析。捕捉人工容易遗漏的问题。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">06. 专业级最终打磨</h3>
            <p className="text-sm text-slate-400">
              节奏、潜台词、情感共鸣。精修每一个句子，直到您的故事不仅读起来流畅，更能打动人心。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-sky-300">07. 多格式导出</h3>
            <p className="text-sm text-slate-400">
              支持PDF、TXT或EPUB格式下载。随时分享或进一步编辑您的作品。
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserInput;
