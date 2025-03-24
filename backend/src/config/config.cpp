#include "config/config.h"

#include <fstream>
#include <iostream>
#include <spdlog/spdlog.h>

namespace linux_learning_platform {

Config::Config(const std::string& configPath) {
    try {
        std::ifstream configFile(configPath);
        if (configFile.is_open()) {
            configFile >> configData;
            spdlog::info("配置文件加载成功: {}", configPath);
        } else {
            spdlog::warn("无法打开配置文件: {}，将使用默认配置", configPath);
            // 创建默认配置
            configData = {
                {"server", {
                    {"port", DEFAULT_PORT}
                }},
                {"database", {
                    {"host", "localhost"},
                    {"port", 3306},
                    {"user", "root"},
                    {"password", "password"},
                    {"dbname", "linux_learning_platform"}
                }},
                {"jwt", {
                    {"secret", DEFAULT_JWT_SECRET},
                    {"expiry_seconds", DEFAULT_JWT_EXPIRY}
                }},
                {"docker", {
                    {"socket", "/var/run/docker.sock"},
                    {"base_port", 10000},
                    {"base_image_ubuntu", "ubuntu:latest"},
                    {"base_image_centos", "centos:latest"}
                }}
            };
        }
    } catch (const std::exception& e) {
        spdlog::error("加载配置文件时发生错误: {}", e.what());
        // 使用默认配置
        configData = {
            {"server", {
                {"port", DEFAULT_PORT}
            }},
            {"jwt", {
                {"secret", DEFAULT_JWT_SECRET},
                {"expiry_seconds", DEFAULT_JWT_EXPIRY}
            }}
        };
    }
}

int Config::getServerPort() const {
    try {
        return configData.at("server").at("port").get<int>();
    } catch (const std::exception& e) {
        spdlog::warn("获取服务器端口配置失败，使用默认值: {}", DEFAULT_PORT);
        return DEFAULT_PORT;
    }
}

std::string Config::getDatabaseConfig(const std::string& key) const {
    try {
        if (key == "port") {
            return std::to_string(configData.at("database").at(key).get<int>());
        }
        return configData.at("database").at(key).get<std::string>();
    } catch (const std::exception& e) {
        spdlog::warn("获取数据库配置[{}]失败: {}", key, e.what());
        if (key == "host") return "localhost";
        if (key == "port") return "3306";
        if (key == "user") return "root";
        if (key == "password") return "password";
        if (key == "dbname") return "linux_learning_platform";
        return "";
    }
}

std::string Config::getJwtSecret() const {
    try {
        return configData.at("jwt").at("secret").get<std::string>();
    } catch (const std::exception& e) {
        spdlog::warn("获取JWT密钥配置失败，使用默认值");
        return DEFAULT_JWT_SECRET;
    }
}

int Config::getJwtExpirySeconds() const {
    try {
        return configData.at("jwt").at("expiry_seconds").get<int>();
    } catch (const std::exception& e) {
        spdlog::warn("获取JWT有效期配置失败，使用默认值: {}秒", DEFAULT_JWT_EXPIRY);
        return DEFAULT_JWT_EXPIRY;
    }
}

std::string Config::getDockerConfig(const std::string& key) const {
    try {
        if (key == "base_port") {
            return std::to_string(configData.at("docker").at(key).get<int>());
        }
        return configData.at("docker").at(key).get<std::string>();
    } catch (const std::exception& e) {
        spdlog::warn("获取Docker配置[{}]失败: {}", key, e.what());
        if (key == "socket") return "/var/run/docker.sock";
        if (key == "base_port") return "10000";
        if (key == "base_image_ubuntu") return "ubuntu:latest";
        if (key == "base_image_centos") return "centos:latest";
        return "";
    }
}

} // namespace linux_learning_platform 