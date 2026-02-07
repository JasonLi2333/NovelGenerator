/**
 * JSON Schema 适配器
 * 
 * Gemini 使用 SchemaType 枚举（如 SchemaType.OBJECT, SchemaType.STRING）
 * OpenAI/xAI 使用标准 JSON Schema 格式（"object", "string" 等）
 * DeepSeek 仅支持 json_object 模式，需要在 prompt 中说明格式
 */

import { SchemaType } from '@google/generative-ai';

/**
 * 将 Gemini SchemaType 格式转换为标准 JSON Schema
 * @param geminiSchema Gemini 的 schema 对象
 * @returns 标准 JSON Schema 对象
 */
export function geminiSchemaToStandard(geminiSchema: any): any {
  if (!geminiSchema) {
    return undefined;
  }

  // 递归转换 schema
  const convert = (schema: any): any => {
    if (!schema) return schema;

    const result: any = {};

    // 转换 type（SchemaType 枚举 -> 字符串）
    if (schema.type) {
      switch (schema.type) {
        case SchemaType.OBJECT:
          result.type = 'object';
          break;
        case SchemaType.ARRAY:
          result.type = 'array';
          break;
        case SchemaType.STRING:
          result.type = 'string';
          break;
        case SchemaType.NUMBER:
          result.type = 'number';
          break;
        case SchemaType.INTEGER:
          result.type = 'integer';
          break;
        case SchemaType.BOOLEAN:
          result.type = 'boolean';
          break;
        default:
          // 如果已经是字符串格式，直接使用
          result.type = schema.type;
      }
    }

    // 处理 properties
    if (schema.properties) {
      result.properties = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        result.properties[key] = convert(value);
      }
    }

    // 处理 items（数组元素）
    if (schema.items) {
      result.items = convert(schema.items);
    }

    // 处理 required
    if (schema.required) {
      result.required = schema.required;
    }

    // 处理 description
    if (schema.description) {
      result.description = schema.description;
    }

    // 处理 enum
    if (schema.enum) {
      result.enum = schema.enum;
    }

    // 处理其他属性
    const otherProps = ['format', 'minimum', 'maximum', 'minItems', 'maxItems', 
                        'minLength', 'maxLength', 'pattern', 'additionalProperties'];
    for (const prop of otherProps) {
      if (schema[prop] !== undefined) {
        result[prop] = schema[prop];
      }
    }

    return result;
  };

  return convert(geminiSchema);
}

/**
 * 将标准 JSON Schema 转换为 Gemini SchemaType 格式
 * @param standardSchema 标准 JSON Schema 对象
 * @returns Gemini 的 schema 对象
 */
export function standardSchemaToGemini(standardSchema: any): any {
  if (!standardSchema) {
    return undefined;
  }

  const convert = (schema: any): any => {
    if (!schema) return schema;

    const result: any = {};

    // 转换 type（字符串 -> SchemaType 枚举）
    if (schema.type) {
      switch (schema.type) {
        case 'object':
          result.type = SchemaType.OBJECT;
          break;
        case 'array':
          result.type = SchemaType.ARRAY;
          break;
        case 'string':
          result.type = SchemaType.STRING;
          break;
        case 'number':
          result.type = SchemaType.NUMBER;
          break;
        case 'integer':
          result.type = SchemaType.INTEGER;
          break;
        case 'boolean':
          result.type = SchemaType.BOOLEAN;
          break;
        default:
          result.type = schema.type;
      }
    }

    // 处理 properties
    if (schema.properties) {
      result.properties = {};
      for (const [key, value] of Object.entries(schema.properties)) {
        result.properties[key] = convert(value);
      }
    }

    // 处理 items
    if (schema.items) {
      result.items = convert(schema.items);
    }

    // 处理 required
    if (schema.required) {
      result.required = schema.required;
    }

    // 处理 description
    if (schema.description) {
      result.description = schema.description;
    }

    // 处理 enum
    if (schema.enum) {
      result.enum = schema.enum;
    }

    // 处理其他属性
    const otherProps = ['format', 'minimum', 'maximum', 'minItems', 'maxItems',
                        'minLength', 'maxLength', 'pattern', 'additionalProperties'];
    for (const prop of otherProps) {
      if (schema[prop] !== undefined) {
        result[prop] = schema[prop];
      }
    }

    return result;
  };

  return convert(standardSchema);
}

/**
 * 为 DeepSeek 生成 schema 说明文本
 * DeepSeek 不支持完整的 JSON Schema，需要在 prompt 中说明格式
 * @param schema 标准 JSON Schema
 * @returns Schema 说明文本
 */
export function schemaToPromptDescription(schema: any): string {
  if (!schema) {
    return '';
  }

  const describe = (schema: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    let description = '';

    if (schema.type === 'object' && schema.properties) {
      description += `${spaces}{\n`;
      const props = Object.entries(schema.properties);
      props.forEach(([key, value]: [string, any], index) => {
        const required = schema.required && schema.required.includes(key);
        description += `${spaces}  "${key}"${required ? ' (required)' : ' (optional)'}: `;
        if (value.description) {
          description += `// ${value.description}\n${spaces}  `;
        }
        if (value.type === 'object' || value.type === 'array') {
          description += describe(value, indent + 1);
        } else {
          description += `${value.type}`;
          if (value.enum) {
            description += ` (one of: ${value.enum.join(', ')})`;
          }
        }
        if (index < props.length - 1) {
          description += ',';
        }
        description += '\n';
      });
      description += `${spaces}}`;
    } else if (schema.type === 'array' && schema.items) {
      description += `[\n`;
      description += describe(schema.items, indent + 1);
      description += `\n${spaces}]`;
    } else {
      description += schema.type;
      if (schema.enum) {
        description += ` (one of: ${schema.enum.join(', ')})`;
      }
    }

    return description;
  };

  return `请严格按照以下 JSON 格式输出：\n\n${describe(schema)}\n\n确保输出的是有效的 JSON 格式。`;
}

/**
 * 检测 schema 中是否使用了 Gemini 的 SchemaType 枚举
 * @param schema Schema 对象
 * @returns 是否是 Gemini 格式
 */
export function isGeminiSchema(schema: any): boolean {
  if (!schema || typeof schema !== 'object') {
    return false;
  }

  // 检查是否使用了 SchemaType 枚举
  const checkType = (obj: any): boolean => {
    if (!obj) return false;
    
    // SchemaType 枚举值是 Symbol 类型
    if (obj.type && typeof obj.type === 'symbol') {
      return true;
    }

    // 递归检查 properties
    if (obj.properties) {
      for (const value of Object.values(obj.properties)) {
        if (checkType(value)) return true;
      }
    }

    // 递归检查 items
    if (obj.items && checkType(obj.items)) {
      return true;
    }

    return false;
  };

  return checkType(schema);
}
