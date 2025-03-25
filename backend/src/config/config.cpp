#include "config.h"

#include <fstream>
#include <spdlog/spdlog.h>

namespace linux_learning_platform {

Config::Config(const std::string &configPath) {
  try {
    std::ifstream configFile(configPath);
    if (configFile.is_open()) {
      std::string content((std::istreambuf_iterator<char>(configFile)),
                          std::istreambuf_iterator<char>());
      auto json = crow::json::load(content);
      if (!json) {
        throw std::runtime_error("无效的JSON格式");
      }
      configData = std::move(json);
      spdlog::info("配置文件加载成功: {}", configPath);
    } else {
      spdlog::warn("无法打开配置文件: {}，将使用默认配置", configPath);
      // 创建默认配置
      crow::json::wvalue defaultConfig;
      defaultConfig["server"]["port"] = DEFAULT_PORT;
      defaultConfig["server"]["host"] = DEFAULT_HOST;
      defaultConfig["server"]["worker_threads"] = DEFAULT_WORKER_THREADS;

      defaultConfig["database"]["host"] = "localhost";
      defaultConfig["database"]["port"] = 3306;
      defaultConfig["database"]["user"] = "root";
      defaultConfig["database"]["password"] = "password";
      defaultConfig["database"]["dbname"] = "linux_learning_platform";

      defaultConfig["jwt"]["secret"] = DEFAULT_JWT_SECRET;
      defaultConfig["jwt"]["expiry_seconds"] = DEFAULT_JWT_EXPIRY;
      defaultConfig["jwt"]["refresh_expiry_seconds"] =
          DEFAULT_JWT_REFRESH_EXPIRY;

      defaultConfig["docker"]["socket"] = DEFAULT_DOCKER_SOCKET;
      defaultConfig["docker"]["base_port"] = DEFAULT_DOCKER_BASE_PORT;
      defaultConfig["docker"]["base_image_ubuntu"] = "ubuntu:latest";
      defaultConfig["docker"]["base_image_centos"] = "centos:latest";
      defaultConfig["docker"]["container_memory_limit"] = "512m";
      defaultConfig["docker"]["container_cpu_limit"] = "1.0";

      defaultConfig["storage"]["upload_dir"] =
          "/var/lib/linux_learning/uploads";
      defaultConfig["storage"]["max_upload_size"] = DEFAULT_MAX_UPLOAD_SIZE;

      defaultConfig["logging"]["level"] = "info";
      defaultConfig["logging"]["file"] = "/var/log/linux_learning/app.log";
      defaultConfig["logging"]["max_size"] = DEFAULT_LOG_MAX_SIZE;
      defaultConfig["logging"]["max_files"] = DEFAULT_LOG_MAX_FILES;

      configData = crow::json::load(defaultConfig.dump());
    }
  } catch (const std::exception &e) {
    spdlog::error("加载配置文件时发生错误: {}", e.what());
    // 使用默认配置
    crow::json::wvalue defaultConfig;
    defaultConfig["server"]["port"] = DEFAULT_PORT;
    defaultConfig["server"]["host"] = DEFAULT_HOST;
    defaultConfig["server"]["worker_threads"] = DEFAULT_WORKER_THREADS;

    defaultConfig["jwt"]["secret"] = DEFAULT_JWT_SECRET;
    defaultConfig["jwt"]["expiry_seconds"] = DEFAULT_JWT_EXPIRY;
    defaultConfig["jwt"]["refresh_expiry_seconds"] = DEFAULT_JWT_REFRESH_EXPIRY;

    configData = crow::json::load(defaultConfig.dump());
  }
}

// 服务器配置
int Config::getServerPort() const {
  try {
    return configData["server"]["port"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取服务器端口配置失败，使用默认值: {}", DEFAULT_PORT);
    return DEFAULT_PORT;
  }
}

std::string Config::getServerHost() const {
  try {
    return std::string(configData["server"]["host"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取服务器主机配置失败，使用默认值: {}", DEFAULT_HOST);
    return DEFAULT_HOST;
  }
}

int Config::getServerWorkerThreads() const {
  try {
    return configData["server"]["worker_threads"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取服务器工作线程数配置失败，使用默认值: {}",
                 DEFAULT_WORKER_THREADS);
    return DEFAULT_WORKER_THREADS;
  }
}

// 数据库配置
std::string Config::getDatabaseHost() const {
  try {
    return std::string(configData["database"]["host"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取数据库主机配置失败，使用默认值: localhost");
    return "localhost";
  }
}

int Config::getDatabasePort() const {
  try {
    return configData["database"]["port"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取数据库端口配置失败，使用默认值: 3306");
    return 3306;
  }
}

std::string Config::getDatabaseUser() const {
  try {
    return std::string(configData["database"]["user"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取数据库用户名配置失败，使用默认值: root");
    return "root";
  }
}

std::string Config::getDatabasePassword() const {
  try {
    return std::string(configData["database"]["password"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取数据库密码配置失败，使用默认值: password");
    return "password";
  }
}

std::string Config::getDatabaseName() const {
  try {
    return std::string(configData["database"]["dbname"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取数据库名称配置失败，使用默认值: linux_learning_platform");
    return "linux_learning_platform";
  }
}

// JWT配置
std::string Config::getJwtSecret() const {
  try {
    return std::string(configData["jwt"]["secret"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取JWT密钥配置失败，使用默认值");
    return DEFAULT_JWT_SECRET;
  }
}

int Config::getJwtExpirySeconds() const {
  try {
    return configData["jwt"]["expiry_seconds"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取JWT有效期配置失败，使用默认值: {}秒", DEFAULT_JWT_EXPIRY);
    return DEFAULT_JWT_EXPIRY;
  }
}

int Config::getJwtRefreshExpirySeconds() const {
  try {
    return configData["jwt"]["refresh_expiry_seconds"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取JWT刷新有效期配置失败，使用默认值: {}秒",
                 DEFAULT_JWT_REFRESH_EXPIRY);
    return DEFAULT_JWT_REFRESH_EXPIRY;
  }
}

// Docker配置
std::string Config::getDockerSocket() const {
  try {
    return std::string(configData["docker"]["socket"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取Docker socket配置失败，使用默认值: {}",
                 DEFAULT_DOCKER_SOCKET);
    return DEFAULT_DOCKER_SOCKET;
  }
}

int Config::getDockerBasePort() const {
  try {
    return configData["docker"]["base_port"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取Docker基础端口配置失败，使用默认值: {}",
                 DEFAULT_DOCKER_BASE_PORT);
    return DEFAULT_DOCKER_BASE_PORT;
  }
}

std::string Config::getDockerBaseImageUbuntu() const {
  try {
    return std::string(configData["docker"]["base_image_ubuntu"].s());
  } catch (const std::exception &e) {
    spdlog::warn(
        "获取Docker Ubuntu基础镜像配置失败，使用默认值: ubuntu:latest");
    return "ubuntu:latest";
  }
}

std::string Config::getDockerBaseImageCentos() const {
  try {
    return std::string(configData["docker"]["base_image_centos"].s());
  } catch (const std::exception &e) {
    spdlog::warn(
        "获取Docker CentOS基础镜像配置失败，使用默认值: centos:latest");
    return "centos:latest";
  }
}

std::string Config::getDockerContainerMemoryLimit() const {
  try {
    return std::string(configData["docker"]["container_memory_limit"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取Docker容器内存限制配置失败，使用默认值: 512m");
    return "512m";
  }
}

std::string Config::getDockerContainerCpuLimit() const {
  try {
    return std::string(configData["docker"]["container_cpu_limit"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取Docker容器CPU限制配置失败，使用默认值: 1.0");
    return "1.0";
  }
}

// 存储配置
std::string Config::getStorageUploadDir() const {
  try {
    return std::string(configData["storage"]["upload_dir"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取存储上传目录配置失败，使用默认值: "
                 "/var/lib/linux_learning/uploads");
    return "/var/lib/linux_learning/uploads";
  }
}

size_t Config::getStorageMaxUploadSize() const {
  try {
    return static_cast<size_t>(configData["storage"]["max_upload_size"].i());
  } catch (const std::exception &e) {
    spdlog::warn("获取存储最大上传大小配置失败，使用默认值: {}字节",
                 DEFAULT_MAX_UPLOAD_SIZE);
    return DEFAULT_MAX_UPLOAD_SIZE;
  }
}

// 日志配置
std::string Config::getLoggingLevel() const {
  try {
    return std::string(configData["logging"]["level"].s());
  } catch (const std::exception &e) {
    spdlog::warn("获取日志级别配置失败，使用默认值: info");
    return "info";
  }
}

std::string Config::getLoggingFile() const {
  try {
    return std::string(configData["logging"]["file"].s());
  } catch (const std::exception &e) {
    spdlog::warn(
        "获取日志文件配置失败，使用默认值: /var/log/linux_learning/app.log");
    return "/var/log/linux_learning/app.log";
  }
}

size_t Config::getLoggingMaxSize() const {
  try {
    return static_cast<size_t>(configData["logging"]["max_size"].i());
  } catch (const std::exception &e) {
    spdlog::warn("获取日志最大大小配置失败，使用默认值: {}字节",
                 DEFAULT_LOG_MAX_SIZE);
    return DEFAULT_LOG_MAX_SIZE;
  }
}

int Config::getLoggingMaxFiles() const {
  try {
    return configData["logging"]["max_files"].i();
  } catch (const std::exception &e) {
    spdlog::warn("获取日志最大文件数配置失败，使用默认值: {}",
                 DEFAULT_LOG_MAX_FILES);
    return DEFAULT_LOG_MAX_FILES;
  }
}

} // namespace linux_learning_platform