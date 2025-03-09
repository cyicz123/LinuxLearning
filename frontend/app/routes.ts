import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 使用展平的路由结构，这样可以避免嵌套路由的类型问题
export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/courses", "routes/courses.tsx"),
  route("/courses/:courseId", "routes/course-detail.tsx"),
  route("/courses/:courseId/resources", "routes/course-resources.tsx"),
  route("/courses/:courseId/images", "routes/course-images.tsx"),
  route("/containers", "routes/containers.tsx")
] satisfies RouteConfig;
