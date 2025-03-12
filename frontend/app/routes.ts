import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 使用展平的路由结构，这样可以避免嵌套路由的类型问题
export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/register", "routes/register.tsx"),
  route("/profile", "routes/profile.tsx"),
  route("/teacher", "routes/teacher.tsx"),
  route("/teacher/create-course", "routes/teacher/create-course.tsx"),
  route("/teacher/courses/:courseId/edit", "routes/teacher-course-detail.tsx"),
  route("/student", "routes/student.tsx"),
  route("/courses", "routes/courses.tsx"),
  route("/courses/:courseId", "routes/course-detail.tsx"),
  route("/courses/:courseId/resources", "routes/course-resources.tsx"),
  route("/courses/:courseId/images", "routes/course-images.tsx"),
  route("/containers", "routes/containers.tsx")
] satisfies RouteConfig;
