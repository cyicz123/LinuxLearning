#include "db/database.h"
#include "spdlog/spdlog.h"

namespace linux_learning_platform {

Database::Database(std::shared_ptr<Config> config) : config_(config) {
  try {
    // 初始化MySQL驱动
    driver_ = get_driver_instance();

    // 创建连接
    connection_.reset(driver_->connect(config_->getDatabaseHost(),
                                       config_->getDatabaseUser(),
                                       config_->getDatabasePassword()));

    // 设置数据库
    connection_->setSchema(config_->getDatabaseName());

    spdlog::info("数据库连接成功");
  } catch (sql::SQLException &e) {
    spdlog::error("数据库连接失败: {}", e.what());
    throw;
  }
}

Database::~Database() {
  if (connection_) {
    connection_->close();
  }
}

sql::Connection *Database::getConnection() { return connection_.get(); }

bool Database::testConnection() {
  try {
    if (!connection_ || connection_->isClosed()) {
      return false;
    }

    std::unique_ptr<sql::Statement> stmt(connection_->createStatement());
    std::unique_ptr<sql::ResultSet> res(stmt->executeQuery("SELECT 1"));
    return true;
  } catch (sql::SQLException &e) {
    spdlog::error("数据库连接测试失败: {}", e.what());
    return false;
  }
}

} // namespace linux_learning_platform