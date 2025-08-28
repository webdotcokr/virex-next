'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Paper
} from '@mui/material';
import { CloudUpload, TableChart, CheckCircle } from '@mui/icons-material';

interface CSVImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (results: { success: number; failed: number; total: number }) => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  required: boolean;
}

const DB_COLUMNS = [
  { key: 'title', label: 'Title', required: true },
  { key: 'file_name', label: 'File Name', required: true },
  { key: 'file_url', label: 'File URL', required: true },
  { key: 'category_id', label: 'Category ID', required: true },
  { key: 'hit_count', label: 'Hit Count', required: false }
];

const steps = ['파일 업로드', '컬럼 매핑', '데이터 미리보기', '임포트 실행'];

export default function CSVImportDialog({ open, onClose, onImportComplete }: CSVImportDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV 파일 파싱
  const parseCSV = useCallback((csvText: string): { data: CSVRow[]; columns: string[] } => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('CSV 파일이 비어있습니다.');

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return { data, columns: headers };
  }, []);

  // 파일 업로드 핸들러
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('CSV 파일만 업로드 가능합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const { data, columns } = parseCSV(text);
      
      setCsvData(data);
      setCsvColumns(columns);
      
      // 자동 컬럼 매핑 시도
      const autoMappings: ColumnMapping[] = DB_COLUMNS.map(dbCol => {
        const matchedCsvCol = columns.find(csvCol => 
          csvCol.toLowerCase().includes(dbCol.key.toLowerCase()) ||
          dbCol.key.toLowerCase().includes(csvCol.toLowerCase())
        );
        
        return {
          csvColumn: matchedCsvCol || '',
          dbColumn: dbCol.key,
          required: dbCol.required
        };
      });
      
      setColumnMappings(autoMappings);
      setActiveStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파일 파싱 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [parseCSV]);

  // 컬럼 매핑 변경
  const handleMappingChange = useCallback((dbColumn: string, csvColumn: string) => {
    setColumnMappings(prev => prev.map(mapping => 
      mapping.dbColumn === dbColumn 
        ? { ...mapping, csvColumn }
        : mapping
    ));
  }, []);

  // 매핑 검증
  const validateMappings = useCallback(() => {
    const errors: string[] = [];
    const requiredMappings = columnMappings.filter(m => m.required);
    
    requiredMappings.forEach(mapping => {
      if (!mapping.csvColumn) {
        const dbColLabel = DB_COLUMNS.find(col => col.key === mapping.dbColumn)?.label;
        errors.push(`필수 컬럼 "${dbColLabel}"의 매핑을 설정해주세요.`);
      }
    });

    return errors;
  }, [columnMappings]);

  // 데이터 변환
  const transformData = useCallback(() => {
    return csvData.map((row, index) => {
      const transformed: any = {};
      
      columnMappings.forEach(mapping => {
        if (mapping.csvColumn && mapping.csvColumn in row) {
          let value = row[mapping.csvColumn];
          
          // 타입 변환
          if (mapping.dbColumn === 'category_id' || mapping.dbColumn === 'hit_count') {
            value = parseInt(value) || (mapping.dbColumn === 'hit_count' ? 0 : undefined);
          }
          
          if (value !== undefined && value !== '') {
            transformed[mapping.dbColumn] = value;
          }
        }
      });

      // 기본값 설정
      if (!transformed.hit_count) {
        transformed.hit_count = 0;
      }

      return { ...transformed, _originalRowIndex: index + 2 }; // Excel row number (1-based + header)
    });
  }, [csvData, columnMappings]);

  // 임포트 실행
  const executeImport = useCallback(async () => {
    setLoading(true);
    setImportProgress(0);
    
    const transformedData = transformData();
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      const response = await fetch('/api/admin/downloads-csv-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: transformedData,
          table: 'downloads'
        }),
      });

      if (!response.ok) {
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      results.success = result.success || 0;
      results.failed = result.failed || 0;
      results.errors = result.errors || [];

      setImportResults(results);
      setImportProgress(100);
      setActiveStep(3);
      
      // 부모 컴포넌트에 결과 전달
      onImportComplete({
        success: results.success,
        failed: results.failed,
        total: transformedData.length
      });

    } catch (error) {
      results.failed = transformedData.length;
      results.errors.push(error instanceof Error ? error.message : '알 수 없는 오류');
      setImportResults(results);
    } finally {
      setLoading(false);
    }
  }, [transformData, onImportComplete]);

  // 다이얼로그 닫기
  const handleClose = useCallback(() => {
    // 초기화
    setActiveStep(0);
    setCsvData([]);
    setCsvColumns([]);
    setColumnMappings([]);
    setImportProgress(0);
    setImportResults(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onClose();
  }, [onClose]);

  // 다음 단계로
  const handleNext = useCallback(() => {
    if (activeStep === 1) {
      const errors = validateMappings();
      if (errors.length > 0) {
        setError(errors.join('\n'));
        return;
      }
      setError(null);
    }
    
    setActiveStep(prev => prev + 1);
  }, [activeStep, validateMappings]);

  // 이전 단계로
  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
    setError(null);
  }, []);

  const previewData = csvData.slice(0, 5); // 처음 5행만 미리보기

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TableChart color="primary" />
          CSV 파일 임포트
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 500 }}>
        {/* 스테퍼 */}
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.split('\n').map((line, i) => (
              <Typography key={i} variant="body2">{line}</Typography>
            ))}
          </Alert>
        )}

        {/* Step 0: 파일 업로드 */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              CSV 파일을 업로드하세요
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              첫 번째 행은 헤더로 인식됩니다.
            </Typography>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={loading}
            />
            
            <Button
              variant="contained"
              size="large"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              파일 선택
            </Button>
            
            {loading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        )}

        {/* Step 1: 컬럼 매핑 */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              컬럼 매핑 설정
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              CSV 파일의 컬럼을 데이터베이스 필드에 매핑하세요.
            </Typography>
            
            <Paper sx={{ p: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>데이터베이스 컬럼</TableCell>
                    <TableCell>CSV 컬럼</TableCell>
                    <TableCell>필수 여부</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {columnMappings.map((mapping) => {
                    const dbCol = DB_COLUMNS.find(col => col.key === mapping.dbColumn);
                    return (
                      <TableRow key={mapping.dbColumn}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {dbCol?.label}
                            {mapping.required && <Chip size="small" color="error" label="필수" />}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={mapping.csvColumn}
                              onChange={(e) => handleMappingChange(mapping.dbColumn, e.target.value)}
                              displayEmpty
                            >
                              <MenuItem value="">선택하지 않음</MenuItem>
                              {csvColumns.map(col => (
                                <MenuItem key={col} value={col}>{col}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          {mapping.required ? (
                            <Chip size="small" color="error" label="필수" />
                          ) : (
                            <Chip size="small" color="default" label="선택사항" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Step 2: 데이터 미리보기 */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                데이터 미리보기
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 {csvData.length}개 레코드 (처음 5개 표시)
              </Typography>
            </Box>
            
            <Paper sx={{ overflow: 'hidden' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {DB_COLUMNS.filter(col => columnMappings.find(m => m.dbColumn === col.key)?.csvColumn).map(col => (
                      <TableCell key={col.key}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transformData().slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {DB_COLUMNS.filter(col => columnMappings.find(m => m.dbColumn === col.key)?.csvColumn).map(col => (
                        <TableCell key={col.key}>
                          {row[col.key] ?? '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Step 3: 임포트 결과 */}
        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              임포트 완료
            </Typography>
            
            {importResults && (
              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                  <Chip color="success" label={`성공: ${importResults.success}개`} />
                  {importResults.failed > 0 && (
                    <Chip color="error" label={`실패: ${importResults.failed}개`} />
                  )}
                </Box>
                
                {importResults.errors.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                    <Typography variant="subtitle2" gutterBottom>오류 세부사항:</Typography>
                    {importResults.errors.map((error, index) => (
                      <Typography key={index} variant="body2">• {error}</Typography>
                    ))}
                  </Alert>
                )}
              </Box>
            )}
            
            {loading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {activeStep === 3 ? '닫기' : '취소'}
        </Button>
        
        {activeStep > 0 && activeStep < 3 && (
          <Button onClick={handleBack} disabled={loading}>
            이전
          </Button>
        )}
        
        {activeStep < 2 && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading || (activeStep === 0 && csvData.length === 0)}
          >
            다음
          </Button>
        )}
        
        {activeStep === 2 && (
          <Button 
            variant="contained" 
            onClick={executeImport}
            disabled={loading}
          >
            임포트 실행
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}