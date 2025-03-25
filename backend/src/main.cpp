#include <memory>
#include <string>

#include <crow.h>
#include "spdlog/spdlog.h"

// 项目自定义头文件
#include "config/config.h"
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

// 配置CORS（跨域资源共享）
// 我们将通过中间件或者直接在路由中设置CORS头

// TODO: 初始化数据库连接
// auto database = std::make_shared<Database>(config);

// 注册认证相关路由
#include "auth/auth_controller.h"

  CROW_ROUTE(app, "/api/v1/auth/register")
      .methods("POST"_method)([](const crow::request &req) {
        (void)req; // 显式标记参数为故意未使用以避免警告
        return AuthController::registerUser(req);
      });

  // 健康检查路由
  CROW_ROUTE(app, "/health")
  ([](crow::response &res) {
    crow::json::wvalue response;
    response["status"] = "ok";
    response["message"] = "服务运行正常";

    // 手动设置CORS头
    res.add_header("Access-Control-Allow-Origin", "*");
    res.add_header("Access-Control-Allow-Methods",
                   "GET, POST, PUT, DELETE, OPTIONS");
    res.add_header("Access-Control-Allow-Headers",
                   "Authorization, Content-Type");
    res.add_header("Access-Control-Max-Age", "3600");

    res.write(response.dump());
    res.end();
  });

  // OPTIONS请求处理（预检请求）
  CROW_ROUTE(app, "/<path>")
      .methods("OPTIONS"_method)([](const crow::request &req, crow::response &res, std::string path) {
        (void)req; // 显式标记参数为故意未使用以避免警告
        (void)path; // 显式标记参数为故意未使用以避免警告
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods",
                       "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers",
                       "Authorization, Content-Type");
        res.add_header("Access-Control-Max-Age", "3600");
        res.end();
      });

  // 启动Crow应用
  spdlog::info("Linux学习平台后端已启动，监听端口: {}",
               config->getServerPort());
  app.port(config->getServerPort()).multithreaded().run();

  return 0;
}