# Linux操作系统学习平台后端

本项目是Linux操作系统学习平台的后端服务，基于C++和Crow框架开发。

## 项目结构

```
backend/
├── build/           # 构建输出目录
├── lib/             # 第三方库目录
├── src/             # 源代码目录
│   ├── api/         # API路由定义
│   ├── auth/        # 认证相关代码
│   ├── config/      # 配置管理
│   ├── controllers/ # 控制器
│   ├── db/          # 数据库操作
│   ├── docker/      # Docker容器管理
│   ├── middleware/  # 中间件
│   ├── models/      # 数据模型
│   ├── utils/       # 工具函数
│   └── main.cpp     # 应用入口
└── tests/           # 测试代码
```

## 技术栈

- C++ 17
- Crow (HTTP服务器框架)
- jwt-cpp (JWT认证)
- spdlog (日志库)
- MySQL Connector/C++ (数据库访问)
- Docker API (容器管理)

## 构建与运行

### 依赖项

- CMake 3.10+
- C++17兼容的编译器
- OpenSSL
- MySQL/MariaDB

### 构建步骤

```bash
# 创建构建目录
mkdir -p backend/build
cd backend/build

# 配置项目
cmake ..

# 构建项目
cmake --build .

# 运行服务
./bin/linux_learning_platform
```

### 配置文件

配置文件位于`config/default_config.json`，可以通过命令行参数指定其他配置文件：

```bash
./bin/linux_learning_platform /path/to/config.json
```

## API文档

API文档将在项目进一步开发后提供。