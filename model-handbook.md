# AI 模型使用手册 (Model Handbook)

本文档记录项目中所有可用 LLM 模型的技术规格、限制和官方状态。

---

## 目录

- [⚠️ 重要：JSON Schema 必读规范](#️-重要json-schema-必读规范)
- [OpenAI 模型](#openai-模型)
- [Google Gemini 系列](#google-gemini-系列)
- [xAI Grok 系列](#xai-grok-系列)
- [DeepSeek 系列](#deepseek-系列)
- [API 兼容性](#api-兼容性)
- [功能支持对比](#功能支持对比)
  - [JSON 输出支持](#json-输出支持)
  - [JSON Schema 关键规范](#️-json-schema-关键规范必读)
- [免费额度对比](#免费额度对比)
- [模型性价比对比](#模型性价比对比)
- [模型选择建议](#模型选择建议)
- [当前模型配置方案](#当前模型配置方案)
- [模型生命周期状态](#模型生命周期状态)
- [已知问题](#已知问题)
- [参考资料](#参考资料)

---

## ⚠️ 重要：JSON Schema 必读规范

> **🚨 关键规则：OpenAI 的所有 `object` 类型必须包含 `additionalProperties: false`**

如果不遵守此规则，会导致：
- ❌ HTTP 400 错误
- ❌ 无限重试循环
- ❌ 浪费大量时间和API调用

详见：[JSON Schema 关键规范](#️-json-schema-关键规范必读)

---

## OpenAI 模型

**Base URL:** `https://api.openai.com/v1`

**免费额度说明：**
- **GPT-5 / GPT-4 / O 系列**：250,000 tokens/天
- **Mini/Nano 系列**：25,000,000 tokens/天

### GPT-5 系列

#### gpt-5-2025-08-07

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 400,000 tokens |
| **最大输出** | 128,000 tokens |
| **当前配置** | 32,768 tokens |
| **知识截止** | 2024年9月30日 |
| **价格** | 输入: $1.25/1M tokens<br>输出: $10.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses |
| **特性** | 支持结构化输出<br>支持函数调用<br>支持 Reasoning.effort 配置 |

---

#### gpt-5-chat-latest

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 16,384 tokens |
| **当前配置** | 65,536 tokens (超出官方限制) |
| **知识截止** | 2024年9月30日 |
| **价格** | 输入: $1.25/1M tokens<br>输出: $10.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses |
| **特性** | ChatGPT 同款模型<br>对话优化<br>支持结构化输出<br>支持函数调用 |

---

### GPT-4 系列

#### gpt-4.1-2025-04-14

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,047,576 tokens (~1M) |
| **最大输出** | 32,768 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年6月1日 |
| **价格** | 输入: $2.00/1M tokens<br>缓存输入: $0.50/1M tokens<br>输出: $8.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/assistants<br>v1/batch |
| **特性** | 支持结构化输出<br>支持函数调用<br>支持微调和蒸馏<br>低延迟（非推理模型） |
| **生命周期** | ⚠️ ChatGPT 将于 2026年2月13日退役<br>API 暂时保留 |

---

#### gpt-4o 系列

GPT-4o（"o" 代表 "omni"）多模态模型，支持文本和图像输入。

**通用规格（所有快照版本）：**
- 上下文窗口：128,000 tokens
- 最大输出：16,384 tokens
- 知识截止：2023年10月1日
- 价格：输入 $2.50/1M tokens，缓存输入 $1.25/1M tokens，输出 $10.00/1M tokens

---

##### gpt-4o-2024-11-20

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 16,384 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2023年10月1日 |
| **价格** | 输入: $2.50/1M tokens<br>缓存输入: $1.25/1M tokens<br>输出: $10.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持文本+图像输入<br>支持结构化输出<br>支持函数调用<br>支持流式传输<br>支持预测输出 |
| **当前用途** | consistency_review_llm |
| **生命周期** | ⚠️ ChatGPT 将于 2026年2月13日退役<br>API 暂时保留 |

---

##### gpt-4o-2024-08-06

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 16,384 tokens |
| **知识截止** | 2023年10月1日 |
| **价格** | 同 gpt-4o-2024-11-20 |
| **官方状态** | 已经被gpt-4o-2024-11-20 取代没有参考价值 |

---

##### gpt-4o-2024-05-13

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 16,384 tokens |
| **知识截止** | 2023年10月1日 |
| **价格** | 同 gpt-4o-2024-11-20 |
| **官方状态** | 已经停用 没有参考价值 |

---

### O 系列推理模型

#### o3-2025-04-16

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 200,000 tokens |
| **最大输出** | 100,000 tokens |
| **当前配置** | 32,768 tokens |
| **知识截止** | 2024年6月1日 |
| **价格** | **标准 tokens:**<br>输入: $2.00/1M tokens<br>缓存输入: $0.50/1M tokens<br>输出: $8.00/1M tokens<br><br>**推理 tokens:**<br>输入: $1.00/1M tokens<br>缓存输入: $0.25/1M tokens<br>输出: $4.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/assistants<br>v1/batch |
| **特性** | 支持推理 token<br>支持文本+图像输入<br>支持结构化输出<br>支持函数调用 |
| **官方状态** | 已被 GPT-5 取代（官方说明） |

**推理 token 说明：**
- 模型使用额外的"推理 token"进行内部推理
- 推理 token 价格低于标准 token（输入 $1 vs $2，输出 $4 vs $8）
- 总成本 = 标准 token 成本 + 推理 token 成本

---

#### o1 系列

o1 系列使用强化学习训练，具有内部思维链推理能力。

**通用规格（所有快照版本）：**
- 上下文窗口：200,000 tokens
- 最大输出：100,000 tokens
- 知识截止：2023年10月1日
- 价格：输入 $15/1M tokens，缓存输入 $7.50/1M tokens，输出 $60/1M tokens

---

##### o1-2024-12-17

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 200,000 tokens |
| **最大输出** | 100,000 tokens |
| **当前配置** | 32,768 tokens |
| **知识截止** | 2023年10月1日 |
| **价格** | 输入: $15.00/1M tokens<br>缓存输入: $7.50/1M tokens<br>输出: $60.00/1M tokens |
| **免费额度** | 250,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/assistants<br>v1/batch |
| **特性** | 强化学习训练<br>内部思维链推理<br>支持推理 token<br>支持文本+图像输入<br>支持结构化输出<br>支持函数调用 |

---

### Mini/Nano 轻量模型

#### gpt-5-mini-2025-08-07

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 400,000 tokens |
| **最大输出** | 128,000 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年5月31日 |
| **价格** | 输入: $0.25/1M tokens<br>缓存输入: $0.025/1M tokens<br>输出: $2.00/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持推理 token<br>支持文本+图像输入<br>支持结构化输出<br>支持函数调用 |

**价格对比（每 1M tokens）：**

| 模型 | 输入价格 | 输出价格 |
|------|---------|---------|
| GPT-5 | $1.25 | $10.00 |
| **GPT-5 mini** | **$0.25** | **$2.00** |
| GPT-5 nano | $0.05 | $0.40 |

---

#### gpt-5-nano-2025-08-07

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 400,000 tokens |
| **最大输出** | 128,000 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年5月31日 |
| **价格** | 输入: $0.05/1M tokens<br>缓存输入: $0.005/1M tokens<br>输出: $0.40/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持推理 token<br>支持文本+图像输入<br>支持结构化输出<br>支持函数调用 |
| **官方定位** | 总结、分类任务 |

---

#### gpt-4.1-mini-2025-04-14

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,047,576 tokens (~1M) |
| **最大输出** | 32,768 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年6月1日 |
| **价格** | 输入: $0.40/1M tokens<br>缓存输入: $0.10/1M tokens<br>输出: $1.60/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持微调<br>低延迟<br>支持结构化输出<br>支持函数调用 |
| **生命周期** | ⚠️ ChatGPT 将于 2026年2月13日退役<br>API 暂时保留 |

**价格对比（每 1M tokens）：**

| 模型 | 输入价格 | 输出价格 | 上下文 | 最大输出 |
|------|---------|---------|--------|---------|
| GPT-5 mini | $0.25 | $2.00 | 400K | 128K |
| **GPT-4.1 mini** | **$0.40** | **$1.60** | **1M** | 32K |
| GPT-4o mini | $0.15 | $0.60 | 128K | 16K |

---

#### gpt-4.1-nano-2025-04-14

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,047,576 tokens (~1M) |
| **最大输出** | 32,768 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年6月1日 |
| **价格** | 输入: $0.10/1M tokens<br>缓存输入: $0.025/1M tokens<br>输出: $0.40/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持微调<br>支持结构化输出<br>支持函数调用 |

**价格对比（每 1M tokens）：**

| 模型 | 输入价格 | 输出价格 | 上下文窗口 | 最大输出 |
|------|---------|---------|-----------|---------|
| GPT-5 nano | $0.05 | $0.40 | 400K | 128K |
| **GPT-4.1 nano** | **$0.10** | **$0.40** | **1M** | 32K |
| GPT-4.1 mini | $0.40 | $1.60 | 1M | 32K |


---

#### o4-mini-2025-04-16

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 200,000 tokens |
| **最大输出** | 100,000 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2024年6月1日 |
| **价格** | **标准 tokens:**<br>输入: $1.10/1M tokens<br>缓存输入: $0.275/1M tokens<br>输出: $4.40/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持推理 token<br>支持文本+图像输入<br>支持微调 |
| **官方状态** | 已被 GPT-5 mini 取代（官方说明） |
| **生命周期** | ⚠️ ChatGPT 将于 2026年2月13日退役<br>API 暂时保留 |

---

#### gpt-4o-mini-2024-07-18

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 16,384 tokens |
| **当前配置** | 16,384 tokens |
| **知识截止** | 2023年10月1日 |
| **价格** | 输入: $0.15/1M tokens<br>缓存输入: $0.075/1M tokens<br>输出: $0.60/1M tokens |
| **免费额度** | 25,000,000 tokens/天 |
| **API 支持** | v1/chat/completions<br>v1/responses<br>v1/realtime<br>v1/assistants<br>v1/batch |
| **特性** | 支持文本+图像输入<br>支持微调<br>支持蒸馏<br>支持结构化输出<br>支持函数调用 |

**价格对比（每 1M tokens）：**

| 模型 | 输入价格 | 输出价格 | 上下文 | 最大输出 | 知识截止 |
|------|---------|---------|--------|---------|---------|
| GPT-5 nano | $0.05 | $0.40 | 400K | 128K | 2024-05 |
| GPT-4.1 nano | $0.10 | $0.40 | 1M | 32K | 2024-06 |
| **GPT-4o mini** | **$0.15** | **$0.60** | 128K | 16K | 2023-10 |
| GPT-5 mini | $0.25 | $2.00 | 400K | 128K | 2024-05 |

---

## Google Gemini 系列

**Base URL:** `https://generativelanguage.googleapis.com`

### Gemini 3 系列

#### gemini-3-pro-preview

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $2.00/1M tokens (≤200k prompts)<br>输入: $4.00/1M tokens (>200k prompts)<br>输出: $12.00/1M tokens (≤200k prompts)<br>输出: $18.00/1M tokens (>200k prompts)<br>Context caching: $0.20/1M tokens (≤200k)<br>Context caching: $0.40/1M tokens (>200k)<br>Storage: $4.50/1M tokens/hour |
| **价格 (Batch)** | 输入: $1.00/1M tokens (≤200k)<br>输入: $2.00/1M tokens (>200k)<br>输出: $6.00/1M tokens (≤200k)<br>输出: $9.00/1M tokens (>200k) |
| **免费额度** | 不支持 |
| **特性** | 多模态理解<br>支持思考 token（thinking tokens）<br>支持 Grounding with Google Search |
| **官方定位** | 最佳多模态理解模型 |

---

#### gemini-3-flash-preview

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $0.50/1M tokens (text/image/video)<br>输入: $1.00/1M tokens (audio)<br>输出: $3.00/1M tokens<br>Context caching: $0.05/1M tokens (text/image/video)<br>Context caching: $0.10/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.25/1M tokens (text/image/video)<br>输入: $0.50/1M tokens (audio)<br>输出: $1.50/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 多模态输入<br>支持思考 token<br>支持 Grounding with Google Search |
| **官方定位** | 高速度与高智能平衡 |

---

### Gemini 2.5 系列

#### gemini-2.5-pro

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $1.25/1M tokens (≤200k prompts)<br>输入: $2.50/1M tokens (>200k prompts)<br>输出: $10.00/1M tokens (≤200k prompts)<br>输出: $15.00/1M tokens (>200k prompts)<br>Context caching: $0.125/1M tokens (≤200k)<br>Context caching: $0.25/1M tokens (>200k)<br>Storage: $4.50/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.625/1M tokens (≤200k)<br>输入: $1.25/1M tokens (>200k)<br>输出: $5.00/1M tokens (≤200k)<br>输出: $7.50/1M tokens (>200k) |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 支持思考 token<br>支持 Grounding with Google Search<br>支持 Grounding with Google Maps |
| **官方定位** | 编码和复杂推理任务 |

---

#### gemini-2.5-flash

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $0.30/1M tokens (text/image/video)<br>输入: $1.00/1M tokens (audio)<br>输出: $2.50/1M tokens<br>Context caching: $0.03/1M tokens (text/image/video)<br>Context caching: $0.10/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.15/1M tokens (text/image/video)<br>输入: $0.50/1M tokens (audio)<br>输出: $1.25/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 混合推理模型<br>支持思考预算（thinking budgets）<br>支持 Grounding with Google Search<br>支持 Grounding with Google Maps |
| **官方定位** | 首个混合推理模型 |

---

#### gemini-2.5-flash-preview-09-2025

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $0.30/1M tokens (text/image/video)<br>输入: $1.00/1M tokens (audio)<br>输出: $2.50/1M tokens<br>Context caching: $0.03/1M tokens (text/image/video)<br>Context caching: $0.10/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.15/1M tokens (text/image/video)<br>输入: $0.50/1M tokens (audio)<br>输出: $1.25/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 基于 2.5 Flash<br>支持思考 token<br>支持 Grounding with Google Search |
| **官方定位** | 大规模处理、低延迟、高容量任务 |

---

#### gemini-2.5-flash-lite

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $0.10/1M tokens (text/image/video)<br>输入: $0.30/1M tokens (audio)<br>输出: $0.40/1M tokens<br>Context caching: $0.01/1M tokens (text/image/video)<br>Context caching: $0.03/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.05/1M tokens (text/image/video)<br>输入: $0.15/1M tokens (audio)<br>输出: $0.20/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 支持思考 token<br>支持 Grounding with Google Search<br>支持 Grounding with Google Maps |
| **官方定位** | 最小、最经济的规模化使用模型 |

---

#### gemini-2.5-flash-lite-preview-09-2025

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 65,536 tokens |
| **知识截止** | 2025年1月 |
| **价格 (Standard)** | 输入: $0.10/1M tokens (text/image/video)<br>输入: $0.30/1M tokens (audio)<br>输出: $0.40/1M tokens<br>Context caching: $0.01/1M tokens (text/image/video)<br>Context caching: $0.03/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.05/1M tokens (text/image/video)<br>输入: $0.15/1M tokens (audio)<br>输出: $0.20/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 基于 2.5 Flash lite<br>支持思考 token<br>支持 Grounding with Google Search |
| **官方定位** | 优化成本效益、高吞吐量和高质量 |

---

### Gemini 2.0 系列

#### gemini-2.0-flash

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 8,192 tokens |
| **知识截止** | 2024年8月 |
| **价格 (Standard)** | 输入: $0.10/1M tokens (text/image/video)<br>输入: $0.70/1M tokens (audio)<br>输出: $0.40/1M tokens<br>Context caching: $0.025/1M tokens (text/image/video)<br>Context caching: $0.175/1M tokens (audio)<br>Storage: $1.00/1M tokens/hour |
| **价格 (Batch)** | 输入: $0.05/1M tokens (text/image/video)<br>输入: $0.35/1M tokens (audio)<br>输出: $0.20/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 多模态<br>支持 Grounding with Google Search<br>支持 Grounding with Google Maps<br>支持图像生成 |
| **官方定位** | 最平衡的多模态模型，为 Agents 时代而生 |
| **官方状态** | 2026年3月31日下线（已弃用） |

---

#### gemini-2.0-flash-lite

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 1,048,576 tokens (~1M) |
| **最大输出** | 8,192 tokens |
| **知识截止** | 2024年8月 |
| **官方状态** | 2026年3月31日下线（已弃用） |
| **价格 (Standard)** | 输入: $0.075/1M tokens<br>输出: $0.30/1M tokens |
| **价格 (Batch)** | 输入: $0.0375/1M tokens<br>输出: $0.15/1M tokens |
| **免费额度** | Standard 模式支持免费 |
| **特性** | 不支持 Context caching |
| **官方定位** | 最小、最经济的规模化使用模型 |

---

## xAI Grok 系列

**Base URL:** `https://api.x.ai/v1`

**API 格式**：与 OpenAI 完全兼容（使用 `/v1/chat/completions` 端点）

### 模型别名

Grok 提供自动更新的模型别名：
- `grok-4-latest` - 自动指向最新的 Grok 4 版本
- `grok-4-1-fast` - 指向 Grok 4.1 Fast 的稳定版本

### Grok 4.1 系列

#### grok-4-1-fast-reasoning

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 2,000,000 tokens |
| **最大输出** | 8,192 tokens |
| **知识截止** | 2024年11月 |
| **价格** | 输入: $0.20/1M tokens<br>Cached Input: $0.05/1M tokens<br>输出: $0.50/1M tokens<br>Live Search: $25.00/1K sources |
| **Rate Limits** | 480 RPM<br>4,000,000 TPM |
| **特性** | 支持推理<br>Function calling<br>Structured outputs<br>多模态 |
| **官方定位** | 前沿多模态模型，优化高性能代理工具调用 |
| **备注** | Cached Input 节省 75% 成本<br>超过 128K 上下文有额外定价 |

---

#### grok-4-1-fast-non-reasoning

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 2,000,000 tokens |
| **最大输出** | 8,192 tokens |
| **知识截止** | 2024年11月 |
| **价格** | 输入: $0.20/1M tokens<br>Cached Input: $0.05/1M tokens<br>输出: $0.50/1M tokens<br>Live Search: $25.00/1K sources |
| **Rate Limits** | 480 RPM<br>4,000,000 TPM |
| **特性** | 不支持推理<br>Function calling<br>Structured outputs<br>多模态 |
| **官方定位** | 非推理版本 |
| **备注** | Cached Input 节省 75% 成本<br>超过 128K 上下文有额外定价 |

---


### 专用模型

#### grok-code-fast-1

| 属性 | 数值/说明 |
|------|----------|
| **上下文窗口** | 256,000 tokens |
| **最大输出** | 未公开 |
| **知识截止** | 未公开 |
| **价格** | 输入: $0.20/1M tokens<br>输出: $1.50/1M tokens |
| **Rate Limits** | 480 RPM<br>2,000,000 TPM |
| **特性** | 支持文本和图像输入 |
| **官方定位** | 代码优化模型 |

**价格对比（每 1M tokens）：**

| 模型 | 输入 | Cached Input | 输出 | 上下文窗口 |
|------|------|-------------|------|-----------|
| grok-4-1-fast-reasoning | $0.20 | $0.05 | $0.50 | 2M |
| grok-4-1-fast-non-reasoning | $0.20 | $0.05 | $0.50 | 2M |
| grok-3-mini | $0.30 | - | $0.50 | 131K |
| grok-code-fast-1 | $0.20 | - | $1.50 | 256K |

---

## DeepSeek 系列

**Base URL:** `https://api.deepseek.com`

**特别优势：** 🇨🇳 **中文文章效果最佳**

DeepSeek 模型在中文内容生成方面表现优异，特别适合中文小说创作。

### DeepSeek-V3.2 系列

#### deepseek-chat

| 属性 | 数值/说明 |
|------|----------|
| **模型版本** | DeepSeek-V3.2 (Non-thinking Mode) |
| **Base URL** | https://api.deepseek.com |
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 默认: 4,096 tokens<br>最大: 8,192 tokens |
| **知识截止** | 未公开 |
| **价格** | 输入 (Cache Hit): $0.028/1M tokens<br>输入 (Cache Miss): $0.28/1M tokens<br>输出: $0.42/1M tokens |
| **特性** | Json Output<br>Tool Calls<br>Chat Prefix Completion (Beta)<br>FIM Completion (Beta) |
| **语言优势** | 🇨🇳 中文效果最佳 |
| **备注** | Cache Hit 可节省 90% 输入成本 |

---

#### deepseek-reasoner

| 属性 | 数值/说明 |
|------|----------|
| **模型版本** | DeepSeek-V3.2 (Thinking Mode) |
| **Base URL** | https://api.deepseek.com |
| **上下文窗口** | 128,000 tokens |
| **最大输出** | 默认: 32,768 tokens<br>最大: 65,536 tokens |
| **知识截止** | 未公开 |
| **价格** | 输入 (Cache Hit): $0.028/1M tokens<br>输入 (Cache Miss): $0.28/1M tokens<br>输出: $0.42/1M tokens |
| **特性** | Json Output<br>Tool Calls<br>Chat Prefix Completion (Beta)<br>不支持 FIM Completion |
| **官方定位** | 思考模式，支持在工具使用中进行推理 |
| **语言优势** | 🇨🇳 中文效果最佳 |
| **备注** | 输出包含思考 tokens<br>Cache Hit 可节省 90% 输入成本 |

---

#### DeepSeek-V3.2-Speciale

| 属性 | 数值/说明 |
|------|----------|
| **模型版本** | DeepSeek-V3.2-Speciale |
| **Base URL** | https://api.deepseek.com/v3.2_speciale_expires_on_20251215 |
| **上下文窗口** | 未公开 |
| **最大输出** | 未公开 |
| **知识截止** | 未公开 |
| **价格** | 与 DeepSeek-V3.2 相同 |
| **特性** | 不支持 Tool Calls |
| **官方定位** | 最大化推理能力<br>对标 Gemini-3.0-Pro<br>在 IMO, CMO, ICPC, IOI 达到金牌水平 |
| **可用性** | 临时端点，2025年12月15日 15:59 UTC 到期<br>仅 API 可用 |

**价格对比（每 1M tokens）：**

| 模型 | 输入 (Cache Hit) | 输入 (Cache Miss) | 输出 |
|------|-----------------|------------------|------|
| deepseek-chat | $0.028 | $0.28 | $0.42 |
| deepseek-reasoner | $0.028 | $0.28 | $0.42 |
| DeepSeek-V3.2-Speciale | $0.028 | $0.28 | $0.42 |

---

## API 兼容性

### OpenAI 兼容 API

以下平台使用 **OpenAI 兼容的 API 格式**，可以轻松切换：

| 平台 | Base URL | 兼容性 |
|------|---------|--------|
| **OpenAI** | `https://api.openai.com/v1` | 原生 |
| **xAI Grok** | `https://api.x.ai/v1` | ✅ 完全兼容 |
| **DeepSeek** | `https://api.deepseek.com` | ✅ 完全兼容 |
| **Google Gemini** | `https://generativelanguage.googleapis.com` | ❌ 不同格式 |

### 切换成本

**低成本（OpenAI 兼容）：**
- OpenAI ↔ Grok：仅需更改 Base URL 和 API Key
- OpenAI ↔ DeepSeek：仅需更改 Base URL 和 API Key
- 代码几乎无需修改

**高成本（需要适配）：**
- OpenAI ↔ Gemini：需要修改请求/响应格式
- 需要适配不同的参数名称和结构

### API 调用示例

#### OpenAI / Grok / DeepSeek（兼容格式）
```bash
curl https://api.x.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "grok-4-latest",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

#### Gemini（不同格式）
```bash
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Hello"}]
    }]
  }'
```

---

## 功能支持对比

### JSON 输出支持

所有主流模型都支持结构化 JSON 输出，可用于确保模型生成符合指定格式的响应。

#### 快速对比

| 平台 | 支持情况 | 不支持的模型 |
|------|---------|-------------|
| **OpenAI** | ✅ 几乎全部支持 | ❌ o1-mini-2024-09-12 |
| **Google Gemini** | ✅ 全部支持 | 无 |
| **xAI Grok** | ✅ 全部支持 | 无 |
| **DeepSeek** | ✅ 大部分支持 | ❌ DeepSeek-V3.2-Speciale |

#### OpenAI 模型

| 模型系列 | JSON 输出支持 | 备注 |
|---------|-------------|------|
| GPT-5 系列 | ✅ 完全支持 | 支持结构化输出 (Structured outputs) |
| GPT-4.1 系列 | ✅ 完全支持 | 支持结构化输出 + 函数调用 |
| GPT-4o 系列 | ✅ 完全支持 | 支持结构化输出 + 流式传输 |
| O3 系列 | ✅ 完全支持 | 支持结构化输出 + 推理 token |
| O1 系列 | ✅ 完全支持 | 支持结构化输出 |
| **o1-mini** | ❌ **不支持** | 不支持结构化输出和函数调用 |
| Mini/Nano 系列 | ✅ 完全支持 | 支持结构化输出 |

#### Google Gemini 模型

| 模型系列 | JSON 输出支持 | 备注 |
|---------|-------------|------|
| Gemini 3.0 系列 | ✅ 完全支持 | 全 JSON Schema 支持（2025年11月增强）|
| Gemini 2.5 系列 | ✅ 完全支持 | 支持 `anyOf`, `$ref`, 属性排序等高级特性 |
| Gemini 2.0 系列 | ✅ 完全支持 | 基础 JSON Schema 支持（2026年3月31日下线）|

**Gemini 特性：**
- 通过 `response_mime_type: "application/json"` 启用
- 支持 `response_json_schema` 定义结构
- 与 Pydantic (Python) 和 Zod (TypeScript) 开箱即用

#### xAI Grok 模型

| 模型系列 | JSON 输出支持 | 备注 |
|---------|-------------|------|
| Grok 4.1 Fast 系列 | ✅ 完全支持 | Structured outputs + Function calling |

| Grok Code Fast | ✅ 完全支持 | Structured outputs |

#### DeepSeek 模型

| 模型 | JSON 输出支持 | 备注 |
|------|-------------|------|
| deepseek-chat | ✅ 完全支持 | Json Output + Tool Calls |
| deepseek-reasoner | ✅ 完全支持 | Json Output + Tool Calls + 思考模式 |
| DeepSeek-V3.2-Speciale | ❌ 不支持 | 不支持 Tool Calls |

---

### JSON 输出使用示例

#### OpenAI 格式（标准 JSON Schema）

**API 请求格式：**
```json
{
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "chapter_structure",
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "title": {"type": "string"},
          "content": {"type": "string"},
          "word_count": {"type": "number"}
        },
        "required": ["title", "content", "word_count"]
      }
    }
  }
}
```

**TypeScript 代码示例：**
```typescript
// ✅ 正确：使用 'object' as const 字符串字面量
const schema = {
  type: 'object' as const,
  additionalProperties: false,  // 🚨 关键！必须添加
  properties: {
    title: { type: 'string' as const },
    content: { type: 'string' as const },
    word_count: { type: 'number' as const }
  },
  required: ['title', 'content', 'word_count']
};

// ✅ 正确：使用 Gemini 的 SchemaType 枚举（会自动转换）
import { SchemaType } from '@google/generative-ai';

const schema = {
  type: SchemaType.OBJECT,
  additionalProperties: false,  // 🚨 关键！必须添加
  properties: {
    title: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING },
    word_count: { type: SchemaType.NUMBER }
  },
  required: ['title', 'content', 'word_count']
};
```

#### Gemini 格式
```json
{
  "generationConfig": {
    "response_mime_type": "application/json",
    "response_schema": {
      "type": "object",
      "properties": {
        "title": {"type": "string"},
        "content": {"type": "string"},
        "word_count": {"type": "number"}
      }
    }
  }
}
```

> **注意：** Gemini 对 `additionalProperties` 不是强制要求，但建议添加以保持一致性和可移植性。

**TypeScript 代码示例（使用 SchemaType 枚举）：**
```typescript
import { SchemaType } from '@google/generative-ai';

const geminiSchema = {
  type: SchemaType.OBJECT,
  additionalProperties: false,  // 建议添加
  properties: {
    title: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING },
    word_count: { type: SchemaType.NUMBER }
  },
  required: ['title', 'content', 'word_count']
};
```

#### DeepSeek 格式
```json
{
  "response_format": {
    "type": "json_object"
  }
}
```

---

## ⚠️ JSON Schema 关键规范（必读）

### OpenAI Structured Output 强制要求

**所有 `object` 类型必须显式设置 `additionalProperties: false`**

#### ❌ 错误示例（会导致 HTTP 400 错误）
```typescript
const schema = {
  type: 'object',
  // ❌ 缺少 additionalProperties: false
  properties: {
    title: { type: 'string' },
    content: { type: 'string' }
  },
  required: ['title', 'content']
};
```

**错误信息：**
```
Invalid schema for response_format 'response': 
In context=(), 'additionalProperties' is required to be supplied and to be false.
```

#### ✅ 正确示例
```typescript
const schema = {
  type: 'object',
  additionalProperties: false,  // ✅ 必须添加
  properties: {
    title: { type: 'string' },
    content: { type: 'string' }
  },
  required: ['title', 'content']
};
```

### 嵌套对象规则

**所有嵌套的 `object` 类型也需要 `additionalProperties: false`**

#### ✅ 完整正确示例
```typescript
const schema = {
  type: 'object',
  additionalProperties: false,  // ✅ 外层 object
  properties: {
    chapters: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,  // ✅ 嵌套 object
        properties: {
          title: { type: 'string' },
          scenes: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,  // ✅ 更深层嵌套
              properties: {
                name: { type: 'string' },
                duration: { type: 'string' }
              },
              required: ['name', 'duration']
            }
          }
        },
        required: ['title', 'scenes']
      }
    }
  },
  required: ['chapters']
};
```

### 不同模型的行为差异

| 模型 | 缺少 `additionalProperties` 时的行为 |
|------|-------------------------------------|
| **OpenAI (GPT-4/5/Nano/Mini)** | ❌ 立即返回 HTTP 400 错误 |
| **Gemini** | ⚠️ 可能宽容处理，但建议添加 |
| **DeepSeek** | ✅ 使用 `json_object` 模式，不需要 |

### 最佳实践检查清单

在编写任何 JSON Schema 时，务必检查：

- [ ] ✅ 所有 `type: 'object'` 都添加了 `additionalProperties: false`
- [ ] ✅ 所有 `type: SchemaType.OBJECT` 都添加了 `additionalProperties: false`
- [ ] ✅ 嵌套的 object（如 items 中的 object）也添加了
- [ ] ✅ 使用 `required` 数组明确必填字段
- [ ] ✅ 所有字段都有清晰的 `description`

### 常见错误场景

#### 场景1：嵌套对象遗漏
```typescript
// ❌ 错误
{
  type: 'object',
  additionalProperties: false,  // ✅ 外层有
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',  // ❌ 这里忘记加了！
        properties: { ... }
      }
    }
  }
}
```

#### 场景2：多处定义不一致
```typescript
// ❌ 部分有，部分没有
const schema1 = { type: 'object', additionalProperties: false, ... };  // ✅
const schema2 = { type: 'object', properties: { ... } };  // ❌ 遗漏
```

### 调试技巧

如果遇到 JSON Schema 错误：

1. **查看浏览器控制台错误信息**（按 ⌘+Option+J 或 F12）
   ```
   ❌ Error: Invalid schema for response_format 'response'...
   'additionalProperties' is required to be supplied and to be false.
   ```

2. **查看错误堆栈**，找到具体的文件和函数名
   ```
   at analyzeAndDecide (editingAgent.ts:100)
   at agentEditChapter (editingAgent.ts:371)
   ```

3. **搜索该文件中的所有 schema 定义**
   ```bash
   # 方法1：搜索 'object' 字符串格式
   grep -n "type:.*'object'" utils/editingAgent.ts
   
   # 方法2：搜索 SchemaType.OBJECT 枚举格式
   grep -n "type: SchemaType.OBJECT" hooks/useBookGenerator.ts
   ```

4. **逐一检查是否有 `additionalProperties: false`**
   ```bash
   # 检查是否所有 object 类型都有 additionalProperties
   grep -A 1 "type:.*'object'" utils/editingAgent.ts | grep additionalProperties
   ```

5. **批量查找所有缺少 additionalProperties 的 schema**
   ```bash
   # 找到所有 object 定义
   grep -rn "type: 'object'" . --include="*.ts" --include="*.tsx"
   
   # 然后手动检查每一处是否有 additionalProperties: false
   ```

### 快速修复模板

遇到错误时，使用此模板快速修复：

```typescript
// ❌ 原代码
const schema = {
  type: 'object',
  properties: { ... }
};

// ✅ 修复后
const schema = {
  type: 'object',
  additionalProperties: false,  // ← 添加这一行
  properties: { ... }
};
```

### 实际项目示例

**示例：章节分析 Schema（来自 useBookGenerator.ts）**

```typescript
import { SchemaType } from '@google/generative-ai';

const analysisSchema = { 
  type: SchemaType.OBJECT,
  additionalProperties: false,  // ✅ 必须
  properties: { 
    summary: { 
      type: SchemaType.STRING, 
      description: "A concise summary of the chapter's events" 
    }, 
    timeElapsed: { 
      type: SchemaType.STRING, 
      description: "How much time passed during this chapter" 
    }, 
    tensionLevel: { 
      type: SchemaType.INTEGER, 
      description: "Tension level from 1-10" 
    },
    keyEvents: { 
      type: SchemaType.ARRAY, 
      items: { type: SchemaType.STRING }, 
      description: "List of 3-5 key events that occurred in this chapter" 
    }
  }, 
  required: ["summary", "timeElapsed", "tensionLevel", "keyEvents"]
};
```

**示例：编辑决策 Schema（来自 editingAgent.ts）**

```typescript
const responseSchema = {
  type: 'object' as const,
  additionalProperties: false,  // ✅ 必须
  properties: {
    strategy: { 
      type: 'string' as const, 
      enum: ['targeted-edit', 'regenerate', 'polish', 'skip'] 
    },
    reasoning: { type: 'string' as const },
    confidence: { 
      type: 'number' as const, 
      description: 'Confidence level 0-100' 
    }
  },
  required: ['strategy', 'reasoning', 'confidence']
};
```

### 自动化检查脚本（建议）

可以在项目中添加 pre-commit hook 检查：

```bash
#!/bin/bash
# 检查是否有 object 类型的 schema 缺少 additionalProperties

echo "🔍 Checking JSON Schema definitions..."

# 查找所有包含 type: 'object' 的行
files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

for file in $files; do
  # 检查是否有 type: 'object' 但后面没有 additionalProperties
  if grep -q "type:.*'object'" "$file"; then
    if ! grep -A 2 "type:.*'object'" "$file" | grep -q "additionalProperties"; then
      echo "⚠️ Warning: $file may have schema without additionalProperties"
    fi
  fi
done

echo "✅ Schema check complete"
```

### FAQ - 常见问题

#### Q1: 为什么 Gemini 不报错，但 OpenAI 会报错？
**A:** OpenAI 的 Structured Output 严格执行 JSON Schema 规范，要求所有 object 必须显式声明 `additionalProperties: false`。Gemini 相对宽容，即使缺少也能工作，但这会导致代码在切换模型时出现兼容性问题。

**最佳实践：** 始终添加 `additionalProperties: false`，确保跨模型兼容性。

---

#### Q2: 什么时候会触发重试？
**A:** 当 OpenAI API 返回错误时，`openaiCompatProvider.ts` 会自动重试（最多8次），使用指数退避策略：
- 尝试1失败 → 等待 3s
- 尝试2失败 → 等待 6s
- 尝试3失败 → 等待 12s
- ...累计可能等待 6 分钟以上

**解决方案：** 修复 schema 定义，而不是依赖重试。

---

#### Q3: 我改了代码为什么还报错？
**A:** 浏览器可能使用了缓存的旧代码。

**解决方案：**
1. 硬刷新浏览器（⌘+Shift+R 或 Ctrl+Shift+R）
2. 或重启开发服务器：
   ```bash
   # 停止当前服务器 (Ctrl+C)
   npm run dev
   ```

---

#### Q4: 如何快速定位所有需要修复的 schema？
**A:** 使用以下命令搜索：

```bash
# 搜索所有可能的 schema 定义
grep -rn "type: 'object'" . --include="*.ts" --include="*.tsx" | grep -v "additionalProperties"
grep -rn "type: SchemaType.OBJECT" . --include="*.ts" | grep -v "additionalProperties"

# 或使用 ripgrep（更快）
rg "type: 'object'" -A 1 | rg -v "additionalProperties"
```

---

#### Q5: 是否所有 schema 类型都需要 additionalProperties？
**A:** 不是。只有 `object` 类型需要：

| Schema Type | 需要 additionalProperties? |
|-------------|---------------------------|
| `object` | ✅ **必须** |
| `array` | ❌ 不需要 |
| `string` | ❌ 不需要 |
| `number` / `integer` | ❌ 不需要 |
| `boolean` | ❌ 不需要 |

---

#### Q6: 使用 Gemini 的 SchemaType 枚举会自动转换吗？
**A:** 是的！项目中有 `schemaAdapter.ts` 会自动处理转换。

```typescript
// 使用 Gemini 格式定义
const schema = {
  type: SchemaType.OBJECT,
  additionalProperties: false,  // 仍然需要添加！
  properties: { ... }
};

// schemaAdapter.geminiSchemaToStandard() 会转换为：
{
  type: 'object',
  additionalProperties: false,  // ✅ 保留
  properties: { ... }
}
```

**注意：** `additionalProperties` 会原样保留，所以 Gemini 格式的 schema 也要添加！

---

## 免费额度对比

### OpenAI 免费额度

| 模型系列 | 免费额度 | 推荐模型 |
|---------|---------|---------|
| **Mini/Nano 系列** | **25,000,000 tokens/天** | gpt-5-nano (128K输出, $0.40/M)<br>gpt-5-mini (128K输出, $2/M)<br>gpt-4.1-nano (32K输出, $0.40/M) |
| **GPT-5 / GPT-4 / O 系列** | **250,000 tokens/天** | gpt-5 (128K输出, $10/M)<br>gpt-4.1 (32K输出, $8/M)<br>o3 (100K输出, $8/M) |

### 使用建议

**日常开发/测试：**
- 使用 Mini/Nano 系列的 25M tokens/天免费额度
- 推荐：**gpt-5-nano** 或 **gpt-5-mini**

**生产环境/重要章节：**
- 使用 GPT-5 系列的 250K tokens/天免费额度
- 超出后考虑付费或切换到 DeepSeek

**中文内容：**
- 优先使用 **DeepSeek** 系列（中文效果最佳 + 超低价格）
- deepseek-chat: $0.42/M（Cache Hit 仅 $0.028/M）

---

## 模型性价比对比

### 按输出成本排序（每 1M tokens）

| 排名 | 模型 | 输出价格 | 输入价格 | 最大输出 | 上下文窗口 | 性价比说明 |
|------|------|---------|---------|---------|-----------|-----------|
| 1 | gemini-2.0-flash-lite | $0.15 | $0.0375 | 8K | 1M | 最便宜（Batch，已弃用） |
| 2 | gemini-2.5-flash-lite | $0.20 | $0.05 | 65K | 1M | 最便宜（Batch） |
| 3 | gemini-2.0-flash | $0.20 | $0.05 | 8K | 1M | Batch 价格（已弃用） |
| 4 | gpt-5-nano | $0.40 | $0.05 | 128K | 400K | 超长输出+低价 |
| 5 | gemini-2.5-flash-lite | $0.40 | $0.10 | 65K | 1M | 经济型 |
| 6 | gemini-2.0-flash | $0.40 | $0.10 | 8K | 1M | Standard（已弃用） |
| 7 | gpt-4.1-nano | $0.40 | $0.10 | 32K | 1M | 最大上下文 |
| 8 | deepseek-chat | $0.42 | $0.028* | 8K | 128K | 最便宜（Cache Hit） |
| 9 | deepseek-reasoner | $0.42 | $0.028* | 64K | 128K | 思考模式，Cache Hit 极便宜 |
| 10 | grok-4-1-fast | $0.50 | $0.20 | 8K | 2M | 超大上下文 |
| 11 | grok-3-mini | $0.50 | $0.30 | 未公开 | 131K | 轻量级 |
| 12 | gpt-4o-mini | $0.60 | $0.15 | 16K | 128K | 支持蒸馏 |
| 13 | gemini-2.5-flash | $1.25 | $0.15 | 65K | 1M | Batch 价格 |
| 14 | gpt-4.1-mini | $1.60 | $0.40 | 32K | 1M | 大上下文 |
| 15 | gpt-5-mini | $2.00 | $0.25 | 128K | 400K | 超长输出 |
| 16 | gemini-2.5-flash | $2.50 | $0.30 | 65K | 1M | 混合推理 |
| 17 | gemini-3-flash | $1.50 | $0.25 | 65K | 1M | Batch 最佳性价比 |
| 18 | gemini-3-flash | $3.00 | $0.50 | 65K | 1M | 高速智能平衡 |
| 19 | gemini-2.5-pro | $5.00 | $0.625 | 65K | 1M | Batch 价格 |
| 20 | gpt-4.1 | $8.00 | $2.00 | 32K | 1M | 非推理旗舰 |
| 21 | gpt-5 | $10.00 | $1.25 | 128K | 400K | 创作旗舰 |
| 22 | gpt-4o | $10.00 | $2.50 | 16K | 128K | 多模态 |
| 23 | gemini-2.5-pro | $10.00 | $1.25 | 65K | 1M | 编码推理 |
| 24 | gemini-3-pro | $6.00 | $1.00 | 65K | 1M | Batch 旗舰 |
| 25 | gemini-3-pro | $12.00 | $2.00 | 65K | 1M | 多模态理解旗舰 |

\* DeepSeek Cache Hit 价格，Cache Miss 为 $0.28

### 超长输出模型（≥64K）

| 模型 | 最大输出 | 输出价格 | 输入价格 | 上下文窗口 | 适合场景 |
|------|---------|---------|---------|-----------|---------|
| gpt-5 | 128K | $10.00 | $1.25 | 400K | 最长输出，顶级质量 |
| gpt-5-mini | 128K | $2.00 | $0.25 | 400K | 性价比最佳长文本 |
| gpt-5-nano | 128K | $0.40 | $0.05 | 400K | 经济型超长文本 |
| gemini-3-pro | 65K | $12.00 | $2.00 | 1M | 多模态理解 + 长文本 |
| gemini-3-flash | 65K | $3.00 | $0.50 | 1M | 快速 + 长文本 |
| gemini-2.5-pro | 65K | $10.00 | $1.25 | 1M | 推理 + 长文本 |
| gemini-2.5-flash | 65K | $2.50 | $0.30 | 1M | 混合推理 + 长文本 |
| gemini-2.5-flash-lite | 65K | $0.40 | $0.10 | 1M | **最便宜长文本** |
| deepseek-reasoner | 64K | $0.42 | $0.028* | 128K | 思考模式 + 长文本 |

\* DeepSeek Cache Hit 价格

---

## 模型选择建议

### 💰 免费额度优先考虑

如果在免费额度内使用，优先考虑以下模型：

**🎁 超大免费额度（25,000,000 tokens/天）：**
- **gpt-5-nano**：128K 输出，$0.40/M，最经济的超长输出
- **gpt-5-mini**：128K 输出，$2.00/M，性价比最佳
- **gpt-4.1-mini**：32K 输出，$1.60/M，1M 上下文
- **gpt-4.1-nano**：32K 输出，$0.40/M，1M 上下文
- **gpt-4o-mini**：16K 输出，$0.60/M，多模态
- **o4-mini / o1-mini**：推理模型（不推荐用于创作）

**📦 标准免费额度（250,000 tokens/天）：**
- **GPT-5 系列**：顶级质量，128K 输出
- **GPT-4.1**：1M 上下文
- **GPT-4o 系列**：多模态
- **O3 / O1 系列**：推理模型

### 🇨🇳 中文内容优先选择

**最佳中文效果：**
- **deepseek-chat**：$0.42/M，中文效果最佳，Cache Hit 仅 $0.028/M
- **deepseek-reasoner**：64K 输出，思考模式，中文效果最佳

---

### ⚠️ 生命周期优先考虑

在选择模型时，**优先避免即将退役的模型**：

**❌ 不推荐使用（即将退役）：**
- GPT-4o 系列（2026年2月13日 ChatGPT 退役）
- GPT-4.1 / GPT-4.1 mini（2026年2月13日 ChatGPT 退役）
- o4-mini（2026年2月13日 ChatGPT 退役）
- Gemini 2.0 系列（2026年3月31日完全下线）

**✅ 推荐使用（长期维护）：**
- GPT-5 全系列
- Gemini 2.5 / 3.0 系列
- Grok 4.1 系列
- DeepSeek V3.2 系列

---

### 按使用场景

#### 超长章节生成（20K+ 字）
- **中文最佳**：deepseek-reasoner (64K 输出，$0.42/M，中文效果最佳)
- **免费首选**：gpt-5-nano (128K 输出，$0.40/M，25M tokens/天免费)
- **性价比**：gpt-5-mini (128K 输出，$2/M，25M tokens/天免费)
- **最佳质量**：gpt-5 (128K 输出，$10/M，250K tokens/天免费)
- **备选**：gemini-2.5-flash-lite (65K 输出，$0.40/M)

#### 中等长度章节（5K-20K 字）
- **中文最佳**：deepseek-reasoner (64K 输出，$0.42/M，思考功能)
- **免费首选**：gpt-5-mini (128K 输出，$2/M，25M tokens/天免费)
- **推荐**：gemini-2.5-flash (65K 输出，$2.50/M，1M 上下文)
- **备选**：gemini-3-flash (65K 输出，$3.00/M，最新技术)

#### 短章节/辅助任务（<5K 字）
- **中文最佳**：deepseek-chat ($0.42/M，Cache Hit $0.028/M，中文效果最佳)
- **免费首选**：gpt-5-nano ($0.40/M，25M tokens/天免费)
- **快速**：grok-4-1-fast ($0.50/M，2M 上下文)
- **备选**：gemini-2.5-flash-lite ($0.40/M)

#### 大纲规划/架构设计
- **推荐**：gemini-2.5-pro (65K 输出，$10/M，1M 上下文，推理能力)
- **经济**：gpt-5-mini ($2/M，128K 输出)
- **快速**：gemini-3-flash ($3/M，高速智能平衡)

### 按预算选择

#### 极致经济（Cache 优化）
1. **deepseek-chat**: Cache Hit $0.028/M 输入，$0.42/M 输出（🇨🇳 中文最佳）
2. **gpt-5-nano**: $0.05 输入，$0.40 输出（25M tokens/天免费）
3. **gemini-2.5-flash-lite**: $0.10 输入，$0.40 输出
4. **grok-4-1-fast**: Cached $0.05 输入，$0.50 输出

#### 性价比平衡
1. **gpt-5-mini**: $0.25 输入，$2.00 输出，128K 输出
2. **gemini-2.5-flash**: $0.30 输入，$2.50 输出，65K 输出
3. **gemini-3-flash**: $0.50 输入，$3.00 输出，65K 输出

#### 顶级质量
1. **gpt-5**: $1.25 输入，$10.00 输出，128K 输出
2. **gemini-3-pro**: $2.00 输入，$12.00 输出，65K 输出
3. **gemini-2.5-pro**: $1.25 输入，$10.00 输出，65K 输出

### 特殊需求

#### 超大上下文（>500K）
- **最大**：grok-4-1-fast (2M 上下文)
- **推荐**：gemini 系列 (1M 上下文)
- **经济**：gpt-4.1-nano (1M 上下文，$0.10/$0.40)

#### 思考推理能力
- **deepseek-reasoner**: 思考模式，$0.42/M
- **gemini-2.5-flash**: 混合推理，$2.50/M
- **gemini-2.5-pro**: 高级推理，$10/M

#### 批量处理
- **Gemini Batch API**: 价格减半（如 gemini-2.5-flash-lite Batch $0.05/$0.20）
- **DeepSeek Cache**: Cache Hit 节省 90%

---

## 当前模型配置方案

| 环节 | 使用模型 |
|------|---------|
| prompt_draft_llm | gpt-5-2025-08-07 |
| chapter_outline_llm | gpt-5-2025-08-07 |
| architecture_llm | gpt-5-chat-latest |
| final_chapter_llm | gpt-5-2025-08-07 |
| consistency_review_llm | gpt-4o-2024-11-20 |

---

## 模型生命周期状态

### 即将退役的模型

#### OpenAI 模型（ChatGPT 退役，API 暂时保留）
- **退役日期**：2026年2月13日
- **影响范围**：仅 ChatGPT，API 暂时不受影响
- **退役模型**：
  - GPT-4o 全系列
  - GPT-4.1
  - GPT-4.1 mini
  - o4-mini
- **官方说明**："In the API, there are no changes at this time"
- **迁移建议**：建议迁移到 GPT-5 系列

#### Google Gemini 2.0 系列
- **模型**：gemini-2.0-flash, gemini-2.0-flash-lite
- **下线日期**：2026年3月31日
- **影响范围**：完全下线
- **迁移建议**：迁移到 Gemini 2.5 或 3.0 系列

#### DeepSeek-V3.2-Speciale
- **到期时间**：2025年12月15日 15:59 UTC
- **状态**：临时研究端点

### 已弃用的模型
- **o1-mini-2024-09-12**：功能受限，不推荐使用

---

## 已知问题

### ~~1. max_tokens 写死 16384（已修复）~~
- **问题**：所有模型的 max_tokens 曾被写死为 16,384
- **影响**：DeepSeek-chat (max 8K) 和 Grok (max 8K) 超出限制；GPT-5 (max 128K) 等模型潜力被浪费
- **状态**：✅ 已修复。新增 `services/llm/modelDefaults.ts` 模型映射表，每个模型使用各自的推荐 maxTokens

### 2. gpt-5-chat-latest 配置超限
- **问题**：gpt-5-chat-latest 官方最大输出仅 16,384 tokens
- **影响**：不要为该模型配置超过 16,384 的 maxTokens，否则会被 API 自动截断

### ~~3. 推理模型不支持 temperature（已修复）~~
- **问题**：GPT-5 全系列（gpt-5、gpt-5-mini、gpt-5-nano）和 O 系列（o1、o3、o4-mini）是推理模型，不支持自定义 `temperature` 和 `top_p` 参数，传入会报 400 错误
- **影响**：使用 FREE 策略（全部使用 gpt-5-mini）时，所有带 temperature 的请求都会失败
- **状态**：✅ 已修复。`openaiCompatProvider.ts` 现在自动检测推理模型并跳过 temperature/top_p 参数
- **支持 temperature 的模型**：GPT-4.1 系列、GPT-4o 系列、DeepSeek、Gemini、Grok
- **不支持 temperature 的模型**：GPT-5 全系列、O1/O3/O4 系列

### 4. O 系列模型
- **问题**：o1、o3、o4 不适合写作，且被GPT5碾压
- **影响**：不使用o模型

### 5. 模型退役风险
- **GPT-4o/4.1 系列**：虽然 API 暂时可用，但未来可能退役
- **建议**：优先使用 GPT-5 系列以避免未来迁移

### ~~6. JSON Schema 缺少 additionalProperties（已修复）~~
- **问题**：多处 JSON Schema 定义中缺少 `additionalProperties: false`
- **影响**：
  - OpenAI API 返回 HTTP 400 错误
  - 触发无限重试循环（最多8次重试，指数退避）
  - 单次生成可能卡住 3-5 分钟
  - 影响文件：`useBookGenerator.ts`、`editingAgent.ts`
- **错误信息**：
  ```
  Invalid schema for response_format 'response': 
  In context=(), 'additionalProperties' is required to be supplied and to be false.
  ```
- **状态**：✅ 已修复。所有 schema 的 object 类型都已添加 `additionalProperties: false`
- **修复位置**：
  - `hooks/useBookGenerator.ts` - 12处 schema 定义
  - `utils/editingAgent.ts` - 2处 schema 定义
- **预防措施**：已在本文档添加 [JSON Schema 关键规范](#️-json-schema-关键规范必读) 章节

---

## 参考资料

### OpenAI
- [API 文档](https://platform.openai.com/docs)
- [模型列表](https://platform.openai.com/docs/models)
- [定价页面](https://openai.com/api/pricing/)

### Google Gemini
- [API 文档](https://ai.google.dev/gemini-api/docs)
- [模型列表](https://ai.google.dev/gemini-api/docs/models/gemini)
- [定价页面](https://ai.google.dev/gemini-api/docs/pricing)

### xAI Grok
- [API 文档](https://docs.x.ai/)
- [定价页面](https://docs.x.ai/docs/pricing)

### DeepSeek
- [API 文档](https://api-docs.deepseek.com/)
- [定价页面](https://api-docs.deepseek.com/quick_start/pricing)

