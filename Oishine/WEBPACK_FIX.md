# OISHINE! 项目配置修复说明

## 问题描述
项目文件夹名称中的感叹号 (`!`) 导致了 Webpack 配置错误，因为 Webpack 将感叹号保留为加载器语法，不能在路径中使用。

## 错误信息
```
ValidationError: Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema.
 - configuration[0].cache.cacheDirectory: The provided value "C:\\Users\\Adit\\Music\\OISHINE!\\.next\\cache\\webpack" contains exclamation mark (!) which is not allowed because it's reserved for loader syntax.
```

## 解决方案

### 1. 修改 Next.js 配置 (`next.config.ts`)
- 使用轮询 (polling) 而不是文件系统事件来监听文件变化
- 在开发环境中禁用 Webpack 缓存以避免路径问题
- 设置适当的忽略模式来避免不必要的监听

### 2. 环境变量配置 (`.env.development`)
- 设置 `NEXT_WEBPACK_USEPOLLING=true` 启用轮询
- 设置 `NEXT_WEBPACK_CACHE_ENABLED=false` 禁用缓存
- 配置轮询间隔时间

### 3. Package.json 脚本更新
- 使用 `cross-env` 来处理跨平台环境变量
- 添加内存限制和轮询配置

### 4. 安装必要的依赖
```bash
npm install --save-dev cross-env
```

## 配置详情

### next.config.ts
```typescript
webpack: (config, { dev }) => {
  if (dev) {
    // 使用轮询而不是文件系统事件，处理路径中的特殊字符
    config.watchOptions = {
      poll: parseInt(process.env.WEBPACK_WATCH_OPTIONS_POLL || '1000'),
      aggregateTimeout: 300,
      ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
    };
    
    // 禁用缓存以避免路径中的感叹号问题
    if (process.env.NEXT_WEBPACK_CACHE_ENABLED === 'false') {
      config.cache = false;
    }
  }
  
  return config;
},
```

### .env.development
```env
NODE_ENV=development
NEXT_WEBPACK_USEPOLLING=true
WEBPACK_WATCH_OPTIONS_POLL=1000
NEXT_WEBPACK_CACHE_ENABLED=false
```

### package.json
```json
"dev": "cross-env NODE_OPTIONS=\"--max-old-space-size=4096\" NEXT_WEBPACK_USEPOLLING=true nodemon --exec \"npx tsx server.ts\" --watch server.ts --watch src --ext ts,tsx,js,jsx 2>&1 | tee dev.log"
```

## 使用说明

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问应用程序**：
   - 主页：http://localhost:3000
   - 管理员登录：http://localhost:3000/admin/login
   - 初始化管理员：http://localhost:3000/setup-admin

3. **查看日志**：
   ```bash
   tail -f dev.log
   ```

## 注意事项

- 这个解决方案专门针对路径中包含特殊字符（如感叹号）的情况
- 轮询可能会增加 CPU 使用率，但这是处理特殊字符路径的必要权衡
- 在生产环境中，建议将项目重命名为不包含特殊字符的名称

## 验证

服务器现在应该能够正常启动，没有 Webpack 配置错误。应用程序可以通过 http://localhost:3000 访问。