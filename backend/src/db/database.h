#pragma once

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <memory>
#include <mysql_connection.h>

#include "config/config.h"

namespace linux_learning_platform {

class Database {
public:
  explicit Database(std::shared_ptr<Config> config);
  ~Database();

  // 获取数据库连接
  sql::Connection *getConnection();

  // 测试数据库连接
  bool testConnection();

private:
  std::shared_ptr<Config> config_;
  sql::Driver *driver_;
  std::unique_ptr<sql::Connection> connection_;
};

} // namespace linux_learning_platform