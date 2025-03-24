# Linux学习平台 MySQL环境配置

## 目录结构
```
docker/
├── docker-compose.yml    # Docker Compose配置文件
├── mysql/
│   ├── conf.d/          # MySQL配置文件目录
│   │   └── my.cnf       # MySQL配置文件
│   ├── data/            # MySQL数据目录
│   └── init.sql         # 数据库初始化脚本
└── README.md            # 本文件
```

## 环境要求
- Docker 20.10+
- Docker Compose 2.0+

## 快速开始

1. 启动MySQL容器：
```bash
docker-compose up -d
```

2. 检查容器状态：
```bash
docker-compose ps
```

3. 查看容器日志：
```bash
docker-compose logs -f mysql
```

4. 连接到MySQL：
```bash
docker exec -it linux_learning_mysql mysql -u linux_learning -p
# 密码：linux123
```

## 数据库信息
- 数据库名：linux_learning_platform
- 用户名：linux_learning
- 密码：linux123
- 端口：3306

## 注意事项
1. 首次启动时，系统会自动执行`init.sql`脚本创建数据库和表
2. 数据持久化存储在`mysql/data`目录
3. 配置文件位于`mysql/conf.d`目录
4. 生产环境部署时请修改默认密码

## 常用命令

### 停止容器
```bash
docker-compose down
```

### 重启容器
```bash
docker-compose restart
```

### 查看容器日志
```bash
docker-compose logs -f mysql
```

### 进入容器
```bash
docker exec -it linux_learning_mysql bash
```

### 备份数据
```bash
docker exec linux_learning_mysql mysqldump -u linux_learning -p linux_learning_platform > backup.sql
```

### 恢复数据
```bash
docker exec -i linux_learning_mysql mysql -u linux_learning -p linux_learning_platform < backup.sql
```

## 故障排除
1. 如果容器无法启动，检查端口3306是否被占用
2. 如果数据库连接失败，检查用户名密码是否正确
3. 如果数据丢失，检查`mysql/data`目录权限是否正确
4. 查看容器日志获取详细错误信息 