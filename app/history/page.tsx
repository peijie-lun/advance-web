'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Fade from '@mui/material/Fade';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';

import {
  History as HistoryIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

type HistoryRow = {
  id: number;
  username: string;
  login_success: boolean;
  login_time: string; // timestamptz
};

export default function HistoryPage() {
  const router = useRouter();

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // UI states
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchHistory = async () => {
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('history')
      .select('id, username, login_success, login_time')
      .order('login_time', { ascending: false });

    if (error) {
      setErrorMsg(error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    setRows((data ?? []) as HistoryRow[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.username?.toLowerCase().includes(q));
  }, [rows, query]);

  const pagedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, rowsPerPage]);

  const emptyState = !loading && !errorMsg && filteredRows.length === 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
      }}
    >
      {/* 左上角返回 */}
      <Box sx={{ position: 'absolute', top: 20, left: 20 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/')}
          sx={{
            borderRadius: 3,
            textTransform: 'none',
            px: 2,
            fontWeight: 600,
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(6px)',
            borderColor: '#cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            '&:hover': {
              background: 'rgba(241,245,249,0.8)',
              borderColor: '#94a3b8',
            },
          }}
        >
          返回
        </Button>
      </Box>

      <Fade in timeout={800}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(255,255,255,0.5)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {/* Header */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: 'secondary.main',
                    width: 56,
                    height: 56,
                    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                  }}
                >
                  <HistoryIcon fontSize="large" />
                </Avatar>

                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#334155', lineHeight: 1.2 }}>
                    登入歷史紀錄
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    檢視 history table 的登入成功 / 失敗與時間
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  size="small"
                  placeholder="搜尋 username"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    minWidth: { xs: '100%', sm: 240 },
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Tooltip title="重新整理">
                  <span>
                    <Button
                      variant="contained"
                      onClick={fetchHistory}
                      disabled={loading}
                      startIcon={!loading ? <RefreshIcon /> : undefined}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: 'none',
                        whiteSpace: 'nowrap',
                        background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.28)',
                        '&:hover': { background: 'linear-gradient(45deg, #2563eb, #7c3aed)' },
                      }}
                    >
                      {loading ? <CircularProgress size={22} color="inherit" /> : '刷新'}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>

            {/* Body */}
            <Box sx={{ mt: 3 }}>
              {errorMsg ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderColor: '#fecaca',
                    bgcolor: '#fff1f2',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: '#991b1b' }}>載入失敗</Typography>
                  <Typography variant="body2" sx={{ color: '#7f1d1d', mt: 0.5 }}>
                    {errorMsg}
                  </Typography>
                  <Button
                    onClick={fetchHistory}
                    sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                    variant="outlined"
                  >
                    重試
                  </Button>
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    borderColor: 'rgba(148,163,184,0.35)',
                    background: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader size="small" aria-label="history table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#334155', bgcolor: 'rgba(248,250,252,0.9)' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#334155', bgcolor: 'rgba(248,250,252,0.9)' }}>Username</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#334155', bgcolor: 'rgba(248,250,252,0.9)' }}>結果</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#334155', bgcolor: 'rgba(248,250,252,0.9)' }}>登入時間</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ py: 6 }}>
                              <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center">
                                <CircularProgress size={26} />
                                <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
                                  載入中…
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ) : emptyState ? (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ py: 6 }}>
                              <Typography align="center" color="text.secondary" sx={{ fontWeight: 700 }}>
                                查無資料
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          pagedRows.map((r) => (
                            <TableRow key={r.id} hover sx={{ '&:hover': { bgcolor: 'rgba(241,245,249,0.8)' } }}>
                              <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{r.id}</TableCell>
                              <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{r.username}</TableCell>
                              <TableCell>
                                {r.login_success ? (
                                  <Chip
                                    icon={<CheckCircleIcon />}
                                    label="成功"
                                    size="small"
                                    sx={{
                                      fontWeight: 800,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(16, 185, 129, 0.12)',
                                      color: '#065f46',
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    icon={<CancelIcon />}
                                    label="失敗"
                                    size="small"
                                    sx={{
                                      fontWeight: 800,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(239, 68, 68, 0.12)',
                                      color: '#7f1d1d',
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#334155' }}>
                                {new Date(r.login_time).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage="每頁筆數"
                    sx={{
                      borderTop: '1px solid rgba(148,163,184,0.25)',
                      bgcolor: 'rgba(248,250,252,0.7)',
                    }}
                  />
                </Paper>
              )}
            </Box>
          </Paper>
        </Container>
      </Fade>
    </Box>
  );
}
