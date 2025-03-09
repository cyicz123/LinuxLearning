import { Button } from './ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  const maxVisiblePages = 5;

  // 计算显示的页码范围
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* 首页按钮 */}
      {startPage > 1 && (
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          className="mx-1"
        >
          首页
        </Button>
      )}

      {/* 上一页按钮 */}
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="mx-1"
      >
        上一页
      </Button>

      {/* 页码按钮 */}
      {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className="mx-1"
        >
          {page}
        </Button>
      ))}

      {/* 下一页按钮 */}
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="mx-1"
      >
        下一页
      </Button>

      {/* 末页按钮 */}
      {endPage < totalPages && (
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          className="mx-1"
        >
          末页
        </Button>
      )}
    </div>
  );
} 