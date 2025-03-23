import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { ArrowLeft, Save, Trash2, UserPlus } from 'lucide-react';

interface Teacher {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  created_at: string;
  course_count: number;
  student_count: number;
}

export default function AdminTeacherDetailPage() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 获取教师详情
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/admin/teachers/${teacherId}`);
        const data = await response.json();

        if (data.code === 200) {
          setTeacher(data.data);
        } else {
          setError(data.message || '获取教师信息失败');
        }
      } catch (err) {
        setError('获取教师信息时发生错误');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  // 处理保存
  const handleSave = async () => {
    if (!teacher) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/v1/admin/teachers/${teacher.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: teacher.username,
          email: teacher.email,
          phone: teacher.phone,
          bio: teacher.bio,
        }),
      });

      const data = await response.json();

      if (data.code === 200) {
        toast.success('保存成功');
        setEditing(false);
      } else {
        toast.error(data.message || '保存失败');
      }
    } catch (error) {
      console.error('保存时发生错误:', error);
      toast.error('保存时发生错误');
    } finally {
      setSaving(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!teacher) return;

    if (!confirm('确定要删除此教师吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/teachers/${teacher.user_id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.code === 200) {
        toast.success('删除成功');
        navigate('/admin/teachers');
      } else {
        toast.error(data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除时发生错误:', error);
      toast.error('删除时发生错误');
    }
  };

  // 处理重置密码
  const handleResetPassword = async () => {
    if (!teacher) return;

    if (!confirm('确定要重置此教师的密码吗？')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/teachers/${teacher.user_id}/reset-password`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.code === 200) {
        toast.success('密码重置成功');
      } else {
        toast.error(data.message || '密码重置失败');
      }
    } catch (error) {
      console.error('重置密码时发生错误:', error);
      toast.error('重置密码时发生错误');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-6 px-4">
          <div className="text-center text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-6 px-4">
          <div className="text-center text-red-500">{error || '教师不存在'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/teachers')}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">教师详情</CardTitle>
            <div className="flex space-x-2">
              {!editing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                    className="flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetPassword}
                    className="flex items-center"
                  >
                    重置密码
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex items-center"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="flex items-center"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex items-center space-x-4">
                {teacher.avatar ? (
                  <img
                    src={teacher.avatar}
                    alt={teacher.username}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserPlus className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium">{teacher.username}</h3>
                  <p className="text-sm text-gray-500">{teacher.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">用户名</Label>
                  <Input
                    id="username"
                    value={teacher.username}
                    onChange={(e) => setTeacher({ ...teacher, username: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={teacher.email}
                    onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={teacher.phone}
                    onChange={(e) => setTeacher({ ...teacher, phone: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div>
                  <Label>创建时间</Label>
                  <Input
                    value={new Date(teacher.created_at).toLocaleString()}
                    disabled
                  />
                </div>
                <div>
                  <Label>课程数</Label>
                  <Input
                    value={teacher.course_count}
                    disabled
                  />
                </div>
                <div>
                  <Label>学生数</Label>
                  <Input
                    value={teacher.student_count}
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">简介</Label>
                <Textarea
                  id="bio"
                  value={teacher.bio}
                  onChange={(e) => setTeacher({ ...teacher, bio: e.target.value })}
                  disabled={!editing}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 