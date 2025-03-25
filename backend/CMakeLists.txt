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

# MySQL Connector/C++ 配置
option(DOWNLOAD_MYSQL_CONNECTOR "Download and build MySQL Connector/C++ if not found on system" ON)

# 首先尝试查找系统安装的MySQL
find_package(MySQL QUIET)
if(MySQL_FOUND)
    message(STATUS "Found MySQL: ${MySQL_INCLUDE_DIRS}")
    set(MYSQL_INCLUDE_DIR ${MySQL_INCLUDE_DIRS})
    set(MYSQL_LIBRARIES ${MySQL_LIBRARIES})
else()
    # 尝试查找MySQL Connector/C++
    find_package(mysqlcppconn QUIET)
    if(mysqlcppconn_FOUND)
        message(STATUS "Found MySQL Connector/C++: ${mysqlcppconn_INCLUDE_DIRS}")
        set(MYSQL_INCLUDE_DIR ${mysqlcppconn_INCLUDE_DIRS})
        set(MYSQL_LIBRARIES ${mysqlcppconn_LIBRARIES})
    elseif(DOWNLOAD_MYSQL_CONNECTOR)
        message(STATUS "MySQL Connector/C++ not found, will download and build from source")
        
        # 下载并构建MySQL Connector/C++
        ExternalProject_Add(
            mysql_connector_cpp
            GIT_REPOSITORY https://github.com/mysql/mysql-connector-cpp.git
            GIT_TAG 8.0.25
            CMAKE_ARGS 
                -DCMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE}
                -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/mysql_connector
                -DWITH_BOOST=${CMAKE_BINARY_DIR}/boost
                -DBUILD_STATIC=ON
                -DWITH_SSL=${OPENSSL_ROOT_DIR}
                -DWITH_JDBC=ON
            INSTALL_COMMAND ${CMAKE_COMMAND} --build . --target install
            UPDATE_COMMAND ""
        )
        
        # 设置MySQL Connector/C++的包含目录和库目录
        set(MYSQL_INCLUDE_DIR ${CMAKE_BINARY_DIR}/mysql_connector/include)
        set(MYSQL_LIBRARIES 
            ${CMAKE_BINARY_DIR}/mysql_connector/lib/libmysqlcppconn-static.a 
            ${CMAKE_BINARY_DIR}/mysql_connector/lib/libmysqlcppconn8-static.a
        )
        
        # 添加依赖关系，确保mysql_connector_cpp在其他目标之前构建
        add_dependencies(mysql_connector_cpp OpenSSL::SSL)
    else()
        message(FATAL_ERROR "MySQL Connector/C++ not found and DOWNLOAD_MYSQL_CONNECTOR is OFF. Please install MySQL Connector/C++ or enable download option.")
    endif()
endif()

# 设置MySQL包含目录和库，供子目录使用
set(MYSQL_INCLUDE_DIR ${MYSQL_INCLUDE_DIR} CACHE PATH "MySQL include directory")
set(MYSQL_LIBRARIES ${MYSQL_LIBRARIES} CACHE STRING "MySQL libraries")

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