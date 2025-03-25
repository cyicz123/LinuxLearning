# routes目录的CMakeLists.txt

# 收集routes目录下的源文件
file(GLOB ROUTES_SOURCES "*.cpp")
file(GLOB ROUTES_HEADERS "*.h" "*.hpp")

target_sources(linux_learning_platform PRIVATE ${ROUTES_SOURCES})

# 设置包含目录
target_include_directories(linux_learning_platform
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}
)
