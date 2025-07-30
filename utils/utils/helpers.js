// 工具函数

// 深度合并对象
function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// 扁平化对象
function flattenObject(obj, prefix = '', result = {}, keepEmpty = false) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // 如果是对象，递归处理
        flattenObject(obj[key], newKey, result, keepEmpty);
      } else {
        // 如果是值，直接添加到结果中
        if (obj[key] !== '' || keepEmpty) {
          result[newKey] = obj[key];
        }
      }
    }
  }
  return result;
}

// 反扁平化对象
function unflattenObject(obj) {
  const result = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const keys = key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = obj[key];
    }
  }
  
  return result;
}

module.exports = {
  deepMerge,
  flattenObject,
  unflattenObject
};
