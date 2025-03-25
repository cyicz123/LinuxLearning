#include <iostream>
#include <memory>
#include <string>

#include "crow.h"
#include "nlohmann/json.hpp"
#include "spdlog/spdlog.h"

// 项目自定义头文件，将在实现时添加
// #include "config/config.h"
// #include "api/api_manager.h"
// #include "db/database.h"

using json = nlohmann::json;

// 主程序入口
int main(int argc, char* argv[]) {
    // 初始化日志系统
    spdlog::info("Linux学习平台后端启动中...");
    
    // 解析命令行参数
    std::string configPath = "config/default_config.json";
    if (argc > 1) {
        configPath = argv[1];
    }
    
    // 设置Crow应用
    crow::SimpleApp app;
    
    // 配置CORS（跨域资源共享）
    // 我们将通过中间件或者直接在路由中设置CORS头
    
    // TODO: 加载配置文件
    // auto config = std::make_shared<Config>(configPath);
    
    // TODO: 初始化数据库连接
    // auto database = std::make_shared<Database>(config);
    
    // 注册认证相关路由
    #include "auth/auth_controller.h"
    
    CROW_ROUTE(app, "/api/v1/auth/register")
    .methods("POST"_method)
    ([](const crow::request& req) {
        return AuthController::registerUser(req);
    });
    
    // 健康检查路由
    CROW_ROUTE(app, "/health")
    ([](const crow::request& req, crow::response& res) {
        json response;
        response["status"] = "ok";
        response["message"] = "服务运行正常";
        
        // 手动设置CORS头
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.add_header("Access-Control-Max-Age", "3600");
        
        res.write(response.dump());
        res.end();
    });
    
    // OPTIONS请求处理（预检请求）
    CROW_ROUTE(app, "/<path>")
    .methods("OPTIONS"_method)
    ([](const crow::request& req, crow::response& res, const std::string& path) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.add_header("Access-Control-Max-Age", "3600");
        res.end();
    });
    
    // 启动Crow应用
    spdlog::info("Linux学习平台后端已启动，监听端口: {}", 8080);
    app.port(8080).multithreaded().run();
    
    return 0;
} 