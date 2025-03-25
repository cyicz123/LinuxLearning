#pragma once

#include <crow.h>
#include <string>
#include <unordered_map>
#include <map>
#include "../models/user_model.h"

class AuthController {
public:
    static crow::response registerUser(const crow::request& req) {
        // 新增Content-Type验证
        if (req.get_header_value("Content-Type") != "application/json") {
            return createErrorResponse(415, "不支持的媒体类型", "Content-Type必须为application/json");
        }

        try {
            auto json = crow::json::load(req.body);
            if (!json) {
                return createErrorResponse(400, "请求参数错误", "无效的JSON格式");
            }

            std::unordered_map<std::string, std::vector<std::string>> errors;
            
            validateField(json, "username", 3, 20, "用户名", errors);
            validateField(json, "password", 6, 20, "密码", errors);
            validateEmail(json, errors);
            validateRole(json, errors);

            if (!errors.empty()) {
                return createErrorResponse(400, "请求参数错误", errors);
            }

            if (UserModel::usernameExists(std::string(json["username"].s()))) {
                return createErrorResponse(409, "用户名或邮箱已存在");
            }

            UserModel user = UserModel::fromJson(json);
            if (!user.save()) {
                return createErrorResponse(500, "服务器内部错误");
            }

            auto data = crow::json::wvalue();
            data["user_id"] = user.id;
            data["username"] = user.username;
            return createSuccessResponse(200, "注册成功", std::move(data));
        } catch (const std::exception& e) {
            return createErrorResponse(500, "服务器内部错误");
        }
    }

private:
    static void validateField(const crow::json::rvalue& json, 
                            const std::string& field,
                            size_t minLen, size_t maxLen,
                            const std::string& fieldName,
                            std::unordered_map<std::string, std::vector<std::string>>& errors) {
        if (!json.has(field)) {
            errors[field].push_back(fieldName + "不能为空");
        } else if (UserModel::getStringLength(json[field]) < minLen || 
                 UserModel::getStringLength(json[field]) > maxLen) {
            errors[field].push_back(fieldName + "长度必须在" + 
                                  std::to_string(minLen) + "-" + 
                                  std::to_string(maxLen) + "个字符之间");
        }
    }

    static void validateEmail(const crow::json::rvalue& json,
                            std::unordered_map<std::string, std::vector<std::string>>& errors) {
        if (!json.has("email")) {
            errors["email"].push_back("邮箱不能为空");
        } else if (!UserModel::isValidEmail(std::string(json["email"].s()))) {
            errors["email"].push_back("邮箱格式不正确");
        }
    }

    static void validateRole(const crow::json::rvalue& json,
                           std::unordered_map<std::string, std::vector<std::string>>& errors) {
        if (!json.has("role")) {
            errors["role"].push_back("角色不能为空");
        } else if (std::string(json["role"].s()) != "student") {
            errors["role"].push_back("只允许学生角色注册");
        }
    }

    static crow::response createSuccessResponse(int code, const std::string& message, 
                                              crow::json::wvalue&& data) {
        auto response = crow::json::wvalue();
        response["code"] = code;
        response["message"] = message;
        response["data"] = std::move(data);
        return crow::response(code, response);
    }

    static crow::response createErrorResponse(int code, const std::string& message, 
                                            const std::unordered_map<std::string, std::vector<std::string>>& errors) {
        auto response = crow::json::wvalue();
        response["code"] = code;
        response["message"] = message;
        
        auto errorData = crow::json::wvalue();
        for (const auto& [field, messages] : errors) {
            auto msgArray = crow::json::wvalue();
            for (size_t i = 0; i < messages.size(); ++i) {
                msgArray[i] = messages[i];
            }
            errorData[field] = std::move(msgArray);
        }
        response["data"]["errors"] = std::move(errorData);
        
        return crow::response(code, response);
    }

    static crow::response createErrorResponse(int code, const std::string& message, 
                                            const std::string& errorDetail = "") {
        auto response = crow::json::wvalue();
        response["code"] = code;
        response["message"] = message;
        if (!errorDetail.empty()) {
            response["data"]["error"] = errorDetail;
        }
        return crow::response(code, response);
    }
};