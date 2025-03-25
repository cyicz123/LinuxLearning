#pragma once

#include <string>
#include <crow/json.h>
#include <vector>

class UserModel {
public:
    int id = 0;
    std::string username;
    std::string password;
    std::string email;
    std::string role;

    /**
     * 检查用户名是否已存在
     * @param username 用户名
     * @return 是否存在
     */
    static bool usernameExists(const std::string& username) {
        // 模拟实现，实际应从数据库查询
        return false;
    }

    /**
     * 保存用户到数据库
     * @return 是否成功
     */
    bool save() {
        // 模拟实现，实际应保存到数据库
        id = 1; // 模拟ID
        return true;
    }

    /**
     * 从JSON创建用户对象
     * @param json JSON对象
     * @return 用户对象
     */
    static UserModel fromJson(const crow::json::rvalue& json) {
        UserModel user;
        if (json.has("username")) user.username = std::string(json["username"].s());
        if (json.has("password")) user.password = std::string(json["password"].s());
        if (json.has("email")) user.email = std::string(json["email"].s());
        if (json.has("role")) user.role = std::string(json["role"].s());
        return user;
    }

    /**
     * 获取字符串长度
     * @param str 字符串引用
     * @return 长度
     */
    static size_t getStringLength(const crow::json::rvalue& str) {
        return std::string(str.s()).length();
    }

    /**
     * 验证邮箱格式
     * @param email 邮箱地址
     * @return 是否有效
     */
    static bool isValidEmail(const std::string& email) {
        return email.find('@') != std::string::npos && 
               email.find('.') != std::string::npos;
    }
};