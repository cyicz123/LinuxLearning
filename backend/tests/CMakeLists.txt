# 测试目录CMakeLists.txt
# 使用Google Test进行测试

# 下载Google Test
include(ExternalProject)
ExternalProject_Add(
    googletest
    GIT_REPOSITORY https://github.com/google/googletest.git
    GIT_TAG release-1.12.1
    CMAKE_ARGS -DCMAKE_INSTALL_PREFIX=${CMAKE_BINARY_DIR}/gtest
    PREFIX ${CMAKE_CURRENT_BINARY_DIR}/gtest
    UPDATE_COMMAND ""
)

# 设置Google Test包含目录和库
ExternalProject_Get_Property(googletest source_dir)
set(GTEST_INCLUDE_DIR ${source_dir}/googletest/include)
set(GMOCK_INCLUDE_DIR ${source_dir}/googlemock/include)

ExternalProject_Get_Property(googletest binary_dir)
set(GTEST_LIBRARY_PATH ${binary_dir}/lib/${CMAKE_FIND_LIBRARY_PREFIXES}gtest${CMAKE_STATIC_LIBRARY_SUFFIX})
set(GTEST_MAIN_LIBRARY_PATH ${binary_dir}/lib/${CMAKE_FIND_LIBRARY_PREFIXES}gtest_main${CMAKE_STATIC_LIBRARY_SUFFIX})
set(GMOCK_LIBRARY_PATH ${binary_dir}/lib/${CMAKE_FIND_LIBRARY_PREFIXES}gmock${CMAKE_STATIC_LIBRARY_SUFFIX})
set(GMOCK_MAIN_LIBRARY_PATH ${binary_dir}/lib/${CMAKE_FIND_LIBRARY_PREFIXES}gmock_main${CMAKE_STATIC_LIBRARY_SUFFIX})

# 添加测试可执行文件
file(GLOB_RECURSE TEST_SOURCES "*.cpp")

add_executable(all_tests ${TEST_SOURCES})
add_dependencies(all_tests googletest)

# 包含目录
target_include_directories(all_tests
    PRIVATE
    ${CMAKE_SOURCE_DIR}/src
    ${CROW_INCLUDE_DIR}
    ${JSON_INCLUDE_DIR}
    ${JWT_CPP_INCLUDE_DIR}
    ${SPDLOG_INCLUDE_DIR}
    ${GTEST_INCLUDE_DIR}
    ${GMOCK_INCLUDE_DIR}
)

# 链接依赖库
target_link_libraries(all_tests
    PRIVATE
    ${GTEST_LIBRARY_PATH}
    ${GTEST_MAIN_LIBRARY_PATH}
    ${CMAKE_THREAD_LIBS_INIT}
    ${OPENSSL_LIBRARIES}
)

# 添加测试
add_test(NAME AllTests COMMAND all_tests)

# 示例测试文件 - 如果tests目录为空，可以创建一个简单测试
if(NOT TEST_SOURCES)
    file(WRITE ${CMAKE_CURRENT_SOURCE_DIR}/example_test.cpp
"#include <gtest/gtest.h>

TEST(ExampleTest, BasicAssertions) {
    EXPECT_TRUE(true);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
")
endif() 