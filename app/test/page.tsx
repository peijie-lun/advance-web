'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { Card, CardActions, CardHeader, CardContent } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

// 可重用的卡片元件：固定五個欄位
function InfoCard({ title, department, studentId, name, interest, specialty }) {
  const [count, setCount] = useState(0);

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader title={title} />
      <CardContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Count: {count}
        </Typography>

        <Typography variant="body2">系級：{department}</Typography>
        <Typography variant="body2">學號：{studentId}</Typography>
        <Typography variant="body2">姓名：{name}</Typography>
        <Typography variant="body2">興趣：{interest}</Typography>
        <Typography variant="body2">專長：{specialty}</Typography>
      </CardContent>

    </Card>
  );
}

export default function StudentsPage() {
  // 三張卡片（每張內容不同）
  const students = [
    {
      title: '第一張卡片',
      department: '資訊管理學系 三年級',
      studentId: '412401056',
      name: '陳姵潔',
      interest: '聽歌 追劇 睡覺',
      specialty: '目前沒想到',
    },
    {
      title: '第二張卡片',
      department: '資訊管理學系 五年級',
      studentId: '410402549',
      name: '林芃秀',
      interest: '聽音樂、看電影、睡覺',
      specialty: '資訊安全',
    },
    {
      title: '第三張卡片',
      department: '資訊管理學系 六年級',
      studentId: '409402348',
      name: '陳偉倫',
      interest: '音樂、程式競賽',
      specialty: '演算法、資料結構',
    },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        學生資料卡
      </Typography>

      {students.map((s, idx) => (
        <InfoCard key={idx} {...s} />
      ))}
    </Container>
  );
}
