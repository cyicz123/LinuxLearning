# 数据库模块CMakeLists.txt
file(GLOB DB_SOURCES "*.cpp")
file(GLOB DB_HEADERS "*.h" "*.hpp")

# 将源文件添加到父目录定义的可执行文件中
target_sources(linux_learning_platform PRIVATE ${DB_SOURCES})

# 添加MySQL相关的头文件
target_include_directories(linux_learning_platform PRIVATE ${MYSQL_INCLUDE_DIR})
