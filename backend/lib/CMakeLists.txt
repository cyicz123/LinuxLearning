# 第三方库目录
# 目前第三方库通过ExternalProject在主CMakeLists.txt中下载
# 此文件预留用于添加其他第三方库或本地依赖

# 如果有本地MySQL Connector/C++库，可以在此处设置
# set(MYSQL_CONNECTOR_DIR ${CMAKE_CURRENT_SOURCE_DIR}/mysql-connector-cpp)
# if(EXISTS ${MYSQL_CONNECTOR_DIR})
#     set(MYSQL_INCLUDE_DIR ${MYSQL_CONNECTOR_DIR}/include)
#     set(MYSQL_LIBRARIES ${MYSQL_CONNECTOR_DIR}/lib/libmysqlcppconn.so)
#     message(STATUS "Found local MySQL Connector/C++: ${MYSQL_CONNECTOR_DIR}")
# endif() 