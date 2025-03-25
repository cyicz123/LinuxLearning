#pragma once

#include <crow.h>

namespace linux_learning_platform {

class RouteManager {
public:
  static void registerRoutes(crow::SimpleApp &app);
};

} // namespace linux_learning_platform