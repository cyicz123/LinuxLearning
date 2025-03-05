import { Link } from 'react-router';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">欢迎使用Linux操作系统学习平台</h1>
          <p className="mt-4 text-lg text-gray-600">请登录或注册以开始您的学习之旅</p>
        </div>
      </div>
    </div>
  );
}
