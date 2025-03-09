import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  className?: string;
  iconClassName?: string;
  showAfter?: number; // 滚动多少像素后显示按钮
}

export default function ScrollToTop({
  className = '',
  iconClassName = '',
  showAfter = 300
}: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件，决定是否显示按钮
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfter]);

  // 回到顶部的函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className={`flex items-center justify-center p-3 rounded-full bg-green-600 text-white shadow-md hover:bg-green-700 transition-all hover:shadow-lg ${className}`}
      aria-label="回到顶部"
    >
      <ChevronUp className={`h-5 w-5 ${iconClassName}`} />
    </button>
  );
} 