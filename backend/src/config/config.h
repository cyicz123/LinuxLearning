#pragma once
#include <crow.h>
#include <string>

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
  explicit Config(const std::string &configPath);

  // 服务器配置
  int getServerPort() const;
  std::string getServerHost() const;
  int getServerWorkerThreads() const;

  // 数据库配置
  std::string getDatabaseHost() const;
  int getDatabasePort() const;
  std::string getDatabaseUser() const;
  std::string getDatabasePassword() const;
  std::string getDatabaseName() const;

  // JWT配置
  std::string getJwtSecret() const;
  int getJwtExpirySeconds() const;
  int getJwtRefreshExpirySeconds() const;

  // Docker配置
  std::string getDockerSocket() const;
  int getDockerBasePort() const;
  std::string getDockerBaseImageUbuntu() const;
  std::string getDockerBaseImageCentos() const;
  std::string getDockerContainerMemoryLimit() const;
  std::string getDockerContainerCpuLimit() const;

  // 存储配置
  std::string getStorageUploadDir() const;
  size_t getStorageMaxUploadSize() const;

  // 日志配置
  std::string getLoggingLevel() const;
  std::string getLoggingFile() const;
  size_t getLoggingMaxSize() const;
  int getLoggingMaxFiles() const;

private:
  crow::json::rvalue configData; ///< 配置数据

  // 默认配置值
  static constexpr int DEFAULT_PORT = 8080;
  static constexpr int DEFAULT_JWT_EXPIRY = 3600;           // 1小时
  static constexpr int DEFAULT_JWT_REFRESH_EXPIRY = 604800; // 7天
  static constexpr const char *DEFAULT_JWT_SECRET = "your-secret-key";
  static constexpr const char *DEFAULT_HOST = "0.0.0.0";
  static constexpr int DEFAULT_WORKER_THREADS = 4;
  static constexpr const char *DEFAULT_DOCKER_SOCKET = "/var/run/docker.sock";
  static constexpr int DEFAULT_DOCKER_BASE_PORT = 30000;
  static constexpr size_t DEFAULT_MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
  static constexpr size_t DEFAULT_LOG_MAX_SIZE = 10 * 1024 * 1024;    // 10MB
  static constexpr int DEFAULT_LOG_MAX_FILES = 5;
};

} // namespace linux_learning_platform