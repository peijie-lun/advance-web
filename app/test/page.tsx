'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { grey, blue, purple, red, amber, pink } from '@mui/material/colors';
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import InterestsIcon from '@mui/icons-material/Interests';
import StarIcon from '@mui/icons-material/Star';
import { createClient } from '@supabase/supabase-js';
import ProtectedRoute from '@/components/ProtectedRoute';

// ✅ 初始化 Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Student {
  student_id: string;
  student_name: string;
  department: string;
  interest: string;
  specialty: string;
  created_at: string;
}

export default function TestPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [interest, setInterest] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // ✅ 抓取 Supabase 資料
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching students:', error.message);
      showSnackbar('載入學生資料失敗', 'error');
    } else {
      setStudents(data || []);
    }
  };

  // ✅ 處理學號格式（只允許數字）
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 9) {
      setStudentId(value);
    }
  };

  // ✅ 新增學生
  const handleAddStudent = async () => {
    setError('');

    if (!studentId.trim() || !name.trim() || !department.trim() || !interest.trim() || !specialty.trim()) {
      setError('請填寫所有欄位');
      return;
    }

    if (studentId.length !== 9) {
      setError('學號必須為 9 位數字');
      return;
    }

    // 檢查學號是否已存在
    const { data: existingStudent } = await supabase
      .from('students')
      .select('student_id')
      .eq('student_id', studentId)
      .single();

    if (existingStudent) {
      setError('此學號已存在');
      return;
    }

    const newStudent = {
      student_id: studentId.trim(),
      student_name: name.trim(),
      department: department.trim(),
      interest: interest.trim(),
      specialty: specialty.trim(),
    };

    const { data, error: insertError } = await supabase
      .from('students')
      .insert([newStudent])
      .select();

    if (insertError) {
      setError(`新增失敗：${insertError.message}`);
    } else if (data && data.length > 0) {
      setStudents((prev) => [data[0], ...prev]);
      resetForm();
      setOpen(false);
      showSnackbar('✅ 學生資料新增成功！', 'success');
    }
  };

  // ✅ 編輯學生
  const handleEditStudent = async () => {
    setError('');

    if (!name.trim() || !department.trim() || !interest.trim() || !specialty.trim()) {
      setError('請填寫所有欄位');
      return;
    }

    if (!currentStudent) return;

    const { error: updateError } = await supabase
      .from('students')
      .update({
        student_name: name.trim(),
        department: department.trim(),
        interest: interest.trim(),
        specialty: specialty.trim(),
      })
      .eq('student_id', currentStudent.student_id);

    if (updateError) {
      setError(`更新失敗：${updateError.message}`);
    } else {
      await fetchStudents();
      resetForm();
      setOpen(false);
      setEditMode(false);
      showSnackbar('✅ 學生資料更新成功！', 'success');
    }
  };

  // ✅ 刪除學生
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('student_id', studentToDelete.student_id);

    if (deleteError) {
      showSnackbar(`刪除失敗：${deleteError.message}`, 'error');
    } else {
      setStudents((prev) => prev.filter((s) => s.student_id !== studentToDelete.student_id));
      showSnackbar('🗑️ 學生資料已刪除', 'success');
    }

    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  // 開啟編輯對話框
  const openEditDialog = (student: Student) => {
    setCurrentStudent(student);
    setStudentId(student.student_id);
    setName(student.student_name);
    setDepartment(student.department);
    setInterest(student.interest);
    setSpecialty(student.specialty);
    setEditMode(true);
    setOpen(true);
  };

  // 開啟新增對話框
  const openAddDialog = () => {
    resetForm();
    setEditMode(false);
    setOpen(true);
  };

  // 重置表單
  const resetForm = () => {
    setStudentId('');
    setName('');
    setDepartment('');
    setInterest('');
    setSpecialty('');
    setError('');
    setCurrentStudent(null);
  };

  // 顯示提示訊息
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)',
          py: 6,
        }}
      >
        <Container>
          {/* 頁面標題 */}
          <Fade in={true} timeout={800}>
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
                background: `linear-gradient(135deg, ${blue[100]}, ${purple[50]})`,
                p: 4,
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, color: blue[900], mb: 1 }}>
                🎓 學生資料管理系統
              </Typography>
              <Typography variant="body1" sx={{ color: grey[700] }}>
                管理學生基本資料與個人資訊
              </Typography>
              <Chip
                label={`共 ${students.length} 位學生`}
                sx={{ mt: 2, bgcolor: 'white', fontWeight: 600 }}
              />
            </Box>
          </Fade>

          {/* 學生卡片 */}
          <Grid container spacing={3}>
            {students.map((student, index) => (
              <Grid item xs={12} md={6} lg={4} key={student.student_id}>
                <Fade in={true} timeout={800 + index * 100}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transition: 'all 0.3s ease',
                      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
                      },
                    }}
                  >
                    <CardContent>
                      {/* 標題列 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SchoolIcon sx={{ color: blue[600], mr: 1, fontSize: 28 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: blue[900] }}>
                            {student.student_id}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="編輯">
                            <IconButton
                              size="small"
                              onClick={() => openEditDialog(student)}
                              sx={{
                                color: amber[700],
                                '&:hover': { bgcolor: amber[50] },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="刪除">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setStudentToDelete(student);
                                setDeleteDialogOpen(true);
                              }}
                              sx={{
                                color: red[600],
                                '&:hover': { bgcolor: red[50] },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* 學生姓名 */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ color: purple[600], mr: 1, fontSize: 20 }} />
                        <Typography
                          variant="h6"
                          sx={{ color: blue[800], fontWeight: 600 }}
                        >
                          {student.student_name}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Stack spacing={1.5}>
                        {/* 系級 */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BadgeIcon sx={{ color: grey[600], fontSize: 18, mr: 1 }} />
                          <Typography variant="body2" sx={{ color: grey[700] }}>
                            {student.department}
                          </Typography>
                        </Box>

                        {/* 興趣 */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <InterestsIcon sx={{ color: pink[400], fontSize: 18, mr: 1, mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: grey[600], display: 'block' }}>
                              興趣
                            </Typography>
                            <Typography variant="body2" sx={{ color: grey[800] }}>
                              {student.interest}
                            </Typography>
                          </Box>
                        </Box>

                        {/* 專長 */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <StarIcon sx={{ color: amber[600], fontSize: 18, mr: 1, mt: 0.3 }} />
                          <Box>
                            <Typography variant="caption" sx={{ color: grey[600], display: 'block' }}>
                              專長
                            </Typography>
                            <Typography variant="body2" sx={{ color: grey[800] }}>
                              {student.specialty}
                            </Typography>
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* 空狀態 */}
          {students.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 80, color: grey[300], mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                尚無學生資料
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                點擊右下角的 ＋ 按鈕新增第一筆學生資料
              </Typography>
            </Box>
          )}

          {/* ➕ 浮動新增按鈕 */}
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              bgcolor: blue[500],
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: blue[600],
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
            onClick={openAddDialog}
          >
            <AddIcon />
          </Fab>

          {/* 🧾 Dialog：新增/編輯學生表單 */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
              {editMode ? '✏️ 編輯學生資料' : '➕ 新增學生資料'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
                <TextField
                  label="學號"
                  value={studentId}
                  onChange={handleStudentIdChange}
                  fullWidth
                  variant="outlined"
                  placeholder="請輸入 9 位數字學號"
                  required
                  disabled={editMode}
                  helperText={editMode ? '學號不可修改' : '請輸入 9 位數字'}
                />
                <TextField
                  label="姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  required
                />
                <TextField
                  label="系級"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  fullWidth
                  variant="outlined"
                  placeholder="例：資訊管理學系 三年級"
                  required
                />
                <TextField
                  label="興趣"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="例：聽歌、追劇、睡覺"
                  required
                />
                <TextField
                  label="專長"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="例：程式設計、資料分析"
                  required
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setOpen(false)} variant="outlined">
                取消
              </Button>
              <Button
                variant="contained"
                onClick={editMode ? handleEditStudent : handleAddStudent}
                sx={{
                  bgcolor: blue[500],
                  '&:hover': { bgcolor: blue[600] },
                }}
              >
                {editMode ? '更新' : '新增'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* 🗑️ 刪除確認對話框 */}
          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle sx={{ fontWeight: 700 }}>⚠️ 確認刪除</DialogTitle>
            <DialogContent>
              <Typography>
                確定要刪除學生 <strong>{studentToDelete?.student_name}</strong> ({studentToDelete?.student_id}) 的資料嗎？
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                此操作無法復原。
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                取消
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteStudent}
              >
                確認刪除
              </Button>
            </DialogActions>
          </Dialog>

          {/* 提示訊息 */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ProtectedRoute>
  );
}