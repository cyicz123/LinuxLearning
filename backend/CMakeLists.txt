cmake_minimum_required(VERSION 3.10)
project(LinuxLearningPlatform VERSION 1.0)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 设置编译选项
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wextra -Wpedantic")

# 设置构建类型
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

# 查找依赖包
find_package(OpenSSL REQUIRED)
find_package(Threads REQUIRED)

# 设置输出目录
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# 外部依赖 - 编译时下载
include(ExternalProject)

# Crow - C++ 微框架
ExternalProject_Add(
    crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG v1.0+5
    CMAKE_ARGS -DCROW_BUILD_EXAMPLES=OFF -DCROW_BUILD_TESTS=OFF
    INSTALL_COMMAND ""
    UPDATE_COMMAND ""
)
ExternalProject_Get_Property(crow source_dir)
set(CROW_INCLUDE_DIR ${source_dir}/include)

# nlohmann/json - JSON 处理库
ExternalProject_Add(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.2
    CMAKE_ARGS -DJSON_BuildTests=OFF
    INSTALL_COMMAND ""
    UPDATE_COMMAND ""
)
ExternalProject_Get_Property(nlohmann_json source_dir)
set(JSON_INCLUDE_DIR ${source_dir}/include)

# jwt-cpp - JWT 处理库
ExternalProject_Add(
    jwt_cpp
    GIT_REPOSITORY https://github.com/Thalhammer/jwt-cpp.git
    GIT_TAG v0.6.0
    CMAKE_ARGS -DJWT_BUILD_EXAMPLES=OFF
    INSTALL_COMMAND ""
    UPDATE_COMMAND ""
)
ExternalProject_Get_Property(jwt_cpp source_dir)
set(JWT_CPP_INCLUDE_DIR ${source_dir}/include)

# spdlog - 日志库
ExternalProject_Add(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG v1.10.0
    CMAKE_ARGS -DSPDLOG_BUILD_EXAMPLES=OFF -DSPDLOG_BUILD_TESTS=OFF
    INSTALL_COMMAND ""
    UPDATE_COMMAND ""
)
ExternalProject_Get_Property(spdlog source_dir)
set(SPDLOG_INCLUDE_DIR ${source_dir}/include)

# MySQL Connector/C++
find_package(MySQL QUIET)
if(NOT MySQL_FOUND)
    message(STATUS "MySQL not found, will try to use MySQL Connector/C++ from lib directory")
    # 可以在此处添加自定义 MySQL Connector/C++ 配置
endif()

# 添加项目源代码目录
add_subdirectory(src)

# 添加第三方依赖
add_subdirectory(lib)

# 启用测试
enable_testing()
add_subdirectory(tests)

message(STATUS "Configuration completed for Linux Learning Platform") 