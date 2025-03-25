#include "routes/route_manager.h"
#include "auth/auth_controller.h"

namespace linux_learning_platform {

void RouteManager::registerRoutes(crow::SimpleApp &app) {
  // 注册认证相关路由
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
      .methods("OPTIONS"_method)(
          [](const crow::request &req, crow::response &res, std::string path) {
            (void)req;  // 显式标记参数为故意未使用以避免警告
            (void)path; // 显式标记参数为故意未使用以避免警告
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods",
                           "GET, POST, PUT, DELETE, OPTIONS");
            res.add_header("Access-Control-Allow-Headers",
                           "Authorization, Content-Type");
            res.add_header("Access-Control-Max-Age", "3600");
            res.end();
          });
}

} // namespace linux_learning_platform