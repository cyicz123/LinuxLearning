# 工具模块CMakeLists.txt
file(GLOB UTILS_SOURCES "*.cpp")
file(GLOB UTILS_HEADERS "*.h" "*.hpp")

# 将源文件添加到父目录定义的可执行文件中
target_sources(linux_learning_platform PRIVATE ${UTILS_SOURCES})
