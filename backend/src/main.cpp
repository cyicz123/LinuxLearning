#include <memory>
#include <string>

#include "spdlog/spdlog.h"
#include <crow.h>

// 项目自定义头文件
#include "config/config.h"
#include "routes/route_manager.h"
// #include "api/api_manager.h"
// #include "db/database.h"

// 主程序入口
int main(int argc, char *argv[]) {
  // 初始化日志系统
  spdlog::info("Linux学习平台后端启动中...");

  // 解析命令行参数
  std::string configPath = "config/default_config.json";
  if (argc > 1) {
    configPath = argv[1];
  }

  // 加载配置文件
  auto config = std::make_shared<linux_learning_platform::Config>(configPath);

  // 设置Crow应用
  crow::SimpleApp app;

  // TODO: 初始化数据库连接
  // auto database = std::make_shared<Database>(config);

  // 注册所有路由
  linux_learning_platform::RouteManager::registerRoutes(app);

  // 启动Crow应用
  spdlog::info("Linux学习平台后端已启动，监听端口: {}",
               config->getServerPort());
  app.port(config->getServerPort()).multithreaded().run();

  return 0;
}