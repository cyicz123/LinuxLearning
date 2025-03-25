# 源代码目录CMakeLists.txt

# 收集所有源文件
file(GLOB_RECURSE SOURCES "*.cpp")
file(GLOB_RECURSE HEADERS "*.h" "*.hpp")

# 创建应用程序主可执行文件
add_executable(linux_learning_platform main.cpp ${SOURCES})

# 添加子目录
add_subdirectory(api)
add_subdirectory(auth)
add_subdirectory(config)
add_subdirectory(controllers)
add_subdirectory(db)
add_subdirectory(docker)
add_subdirectory(middleware)
add_subdirectory(models)
add_subdirectory(utils)

# 添加依赖项目
add_dependencies(linux_learning_platform crow jwt_cpp spdlog)

# 包含目录
target_include_directories(linux_learning_platform
    PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}
    ${CROW_INCLUDE_DIR}
    ${JWT_CPP_INCLUDE_DIR}
    ${MYSQL_INCLUDE_DIR}
    ${SPDLOG_INCLUDE_DIR}
    ${OPENSSL_INCLUDE_DIR}
)

# 链接依赖库
target_link_libraries(linux_learning_platform
    PRIVATE
    ${CMAKE_THREAD_LIBS_INIT}
    ${OPENSSL_LIBRARIES}
    ${MYSQL_LIBRARIES}
)

# 安装目标
install(TARGETS linux_learning_platform
    RUNTIME DESTINATION bin
) 