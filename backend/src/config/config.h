#pragma once

#include <string>
#include <memory>
#include <nlohmann/json.hpp>

namespace linux_learning_platform {

/**
 * @brief 系统配置类
 * 
 * 负责从配置文件加载系统配置
 */
class Config {
public:
    /**
     * @brief 构造函数，从指定路径加载配置
     * 
     * @param configPath 配置文件路径
     */
    explicit Config(const std::string& configPath);

    /**
     * @brief 获取服务器端口号
     * 
     * @return int 端口号
     */
    int getServerPort() const;

    /**
     * @brief 获取数据库配置
     * 
     * @param key 配置键名
     * @return std::string 配置值
     */
    std::string getDatabaseConfig(const std::string& key) const;

    /**
     * @brief 获取JWT密钥
     * 
     * @return std::string JWT密钥
     */
    std::string getJwtSecret() const;

    /**
     * @brief 获取JWT有效期（秒）
     * 
     * @return int JWT有效期
     */
    int getJwtExpirySeconds() const;

    /**
     * @brief 获取Docker相关配置
     * 
     * @param key 配置键名
     * @return std::string 配置值
     */
    std::string getDockerConfig(const std::string& key) const;

private:
    nlohmann::json configData; ///< 配置数据
    
    // 默认配置值
    static constexpr int DEFAULT_PORT = 8080;
    static constexpr int DEFAULT_JWT_EXPIRY = 86400; // 24小时
    static constexpr const char* DEFAULT_JWT_SECRET = "linux_learning_platform_secret_key";
};

} // namespace linux_learning_platform 