cmake_minimum_required(VERSION 3.10)
project(LinuxLearningPlatform VERSION 1.0)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 设置导出编译数据库
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

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

# MySQL 配置 - 使用系统安装的MySQL Connector/C++
message(STATUS "使用系统安装的MySQL Connector/C++")

# 查找MySQL Connector/C++
find_path(MYSQL_INCLUDE_DIR
    NAMES mysql_connection.h
    PATHS /usr/include/mysql /usr/include/mysql-cppconn /usr/include/mysql-cppconn-8 /usr/local/include/mysql-cppconn
    PATH_SUFFIXES mysql-connector-c++ mysql
)

find_library(MYSQLCPPCONN_LIBRARY
    NAMES mysqlcppconn
    PATHS /usr/lib /usr/lib64 /usr/local/lib /usr/local/lib64
)

find_library(MYSQLCPPCONN8_LIBRARY
    NAMES mysqlcppconn8
    PATHS /usr/lib /usr/lib64 /usr/local/lib /usr/local/lib64
)

# 检查是否找到了库
if(NOT MYSQL_INCLUDE_DIR)
    message(FATAL_ERROR "未找到MySQL Connector/C++头文件，请安装libmysqlcppconn-dev包")
endif()

if(NOT MYSQLCPPCONN_LIBRARY)
    message(FATAL_ERROR "未找到libmysqlcppconn库，请安装libmysqlcppconn-dev包")
endif()

message(STATUS "找到MySQL包含目录: ${MYSQL_INCLUDE_DIR}")
message(STATUS "找到MySQL库: ${MYSQLCPPCONN_LIBRARY}")
if(MYSQLCPPCONN8_LIBRARY)
    message(STATUS "找到MySQL8库: ${MYSQLCPPCONN8_LIBRARY}")
    set(MYSQL_LIBRARIES ${MYSQLCPPCONN_LIBRARY} ${MYSQLCPPCONN8_LIBRARY})
else()
    message(STATUS "未找到MySQL8库，仅使用基础库")
    set(MYSQL_LIBRARIES ${MYSQLCPPCONN_LIBRARY})
endif()

# 添加项目源代码目录
add_subdirectory(src)

# 添加第三方依赖
add_subdirectory(lib)

# 启用测试
enable_testing()
add_subdirectory(tests)

message(STATUS "Configuration completed for Linux Learning Platform")
message(STATUS "MySQL include directory: ${MYSQL_INCLUDE_DIR}")
message(STATUS "MySQL libraries: ${MYSQL_LIBRARIES}") 