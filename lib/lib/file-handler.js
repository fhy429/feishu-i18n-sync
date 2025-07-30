const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const logger = require('./logger');

// 读取本地国际化文件
function readLocalI18nFiles(config) {
  const result = {};
  const localesDir = config.paths?.inputDir || 'src/locales';
  
  // 支持的语言目录映射
  const langDirMap = {
    'zh': 'zh-CN',
    'en': 'en-US'
  };

  // 初始化结果结构
  Object.values(langDirMap).forEach(langCode => {
    result[langCode] = {};
  });

  // 遍历语言目录
  Object.entries(langDirMap).forEach(([dirName, langCode]) => {
    const langPath = path.join(process.cwd(), localesDir, dirName);
    if (!fs.existsSync(langPath)) {
      logger.warn(`语言目录不存在: ${langPath}`);
      return;
    }

    // 读取目录下的所有TS文件
    const files = fs.readdirSync(langPath).filter(file => file.endsWith('.ts'));
    files.forEach(file => {
      const filePath = path.join(langPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const prefix = file.replace('.ts', '');

      // 解析TS文件，提取翻译内容
      const ast = parser.parse(fileContent, { sourceType: 'module', plugins: ['typescript'] });

      let translateObj = null;
      traverse(ast, {
        VariableDeclarator(path) {
          if (path.node.id.name === 'translation' && path.node.init.type === 'ObjectExpression') {
            translateObj = path.node.init;
          }
        }
      });
      
      if (translateObj) {
        // 将AST对象转换为普通对象
        const obj = astToObject(translateObj);
        // 按文件存储数据
        result[langCode][prefix] = obj;
      }
    });
  });
  
  return result;
}

// 将AST对象转换为普通对象
function astToObject(node) {
  if (node.type === 'ObjectExpression') {
    const obj = {};
    node.properties.forEach(prop => {
      if (prop.key && prop.value) {
        const key = prop.key.name || prop.key.value;
        if (prop.value.type === 'ObjectExpression') {
          obj[key] = astToObject(prop.value);
        } else if (prop.value.type === 'StringLiteral') {
          obj[key] = prop.value.value;
        } else {
          // 其他类型可能需要进一步处理
          obj[key] = prop.value.value || '';
        }
      }
    });
    return obj;
  }
  return {};
}

// 写入JSON文件
function writeI18nFiles(i18nData, config) {
  const outputDir = config.paths?.outputDir || './i18n-output';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  Object.entries(i18nData).forEach(([lang, data]) => {
    // 创建语言目录 (zh-CN -> zh, en-US -> en)
    const langDir = lang === 'zh-CN' ? 'zh' : 'en';
    const langPath = path.join(outputDir, langDir);

    if (!fs.existsSync(langPath)) {
      fs.mkdirSync(langPath, { recursive: true });
    }

    // 直接使用数据，不需要按前缀拆分
    Object.entries(data).forEach(([prefix, content]) => {
      const filePath = path.join(langPath, `${prefix}.ts`);

      // 生成AST
      const ast = createTranslationAst(content);

      // 生成代码
      const { code } = generate(ast, {
        compact: false,
        comments: true,
        retainLines: false,
        quotes: 'single',
        jsescOption: {
          minimal: true,
          json: true
        }
      });

      // 写入文件
      try {
        fs.writeFileSync(filePath, code, 'utf8');
        logger.info(`成功更新国际化文件: ${filePath}`);
      } catch (err) {
        logger.error(`写入文件 ${filePath} 失败:`, err.message);
      }
    });
  });
}

// 创建翻译对象的AST
function createTranslationAst(data) {
  // 创建对象表达式
  const objectExpression = createObjectExpression(data);

  // 创建变量声明: const translation = { ... };
  const variableDeclaration = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.identifier('translation'),
      objectExpression
    )
  ]);

  // 创建导出语句: export default translation;
  const exportDefault = t.exportDefaultDeclaration(
    t.identifier('translation')
  );

  // 创建程序节点
  return t.program([
    variableDeclaration,
    exportDefault
  ]);
}

// 递归创建对象表达式
function createObjectExpression(obj) {
  const properties = [];
  
  Object.entries(obj).forEach(([key, value]) => {
    let valueNode;
    
    if (typeof value === 'object' && value !== null) {
      // 递归创建嵌套对象
      valueNode = createObjectExpression(value);
    } else {
      // 创建字符串字面量
      valueNode = t.stringLiteral(value.toString());
    }
    
    // 创建对象属性
    properties.push(
      t.objectProperty(
        t.identifier(key),
        valueNode
      )
    );
  });
  
  return t.objectExpression(properties);
}

module.exports = {
  readLocalI18nFiles,
  writeI18nFiles
};
