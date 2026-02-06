import React from 'react';

const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: '01',
      title: '专家联合创作',
      description: '三个AI专家。结构、角色、场景。各司其职，精益求精。'
    },
    {
      icon: '02',
      title: '精确架构',
      description: '每个元素都精心布局。对话、动作、氛围浑然一体。'
    },
    {
      icon: '03',
      title: '完美执行',
      description: '实时质量检查。语气一致。完美平衡。零妥协。'
    },
    {
      icon: '04',
      title: '无限记忆',
      description: '每个角色。每条线索。每个细节。永不遗忘。'
    },
    {
      icon: '05',
      title: '无缝整合',
      description: '没有粗糙边缘。没有突兀过渡。只有流畅自然的叙事。'
    },
    {
      icon: '06',
      title: '精修至完美',
      description: '一层又一层。一遍又一遍。直到每个字都恰到好处。'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-lg p-5 hover:border-sky-500/50 hover:bg-slate-700/70 transition-all duration-300 group"
        >
          <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="text-sky-300 font-semibold text-base mb-2">
            {feature.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;
