'use client';

import { Box, Typography, Container, Paper } from '@mui/material';
import CategoryCSVUpload from '@/components/admin/CategoryCSVUpload';

export default function CSVUploadPage() {
  const handleUploadComplete = () => {
    // 업로드 완료 후 필요한 작업이 있다면 여기에 추가
    console.log('Upload completed');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          상품 CSV 업로드
        </Typography>
        <Typography variant="body1" color="text.secondary">
          카테고리별로 상품 데이터를 CSV 파일로 업로드할 수 있습니다.
        </Typography>
      </Box>

      <CategoryCSVUpload onUploadComplete={handleUploadComplete} />

      <Paper elevation={1} sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          사용 안내
        </Typography>
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>1단계:</strong> 업로드할 상품의 카테고리를 선택합니다.
        </Typography>
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>2단계:</strong> "템플릿 다운로드" 버튼을 클릭하여 해당 카테고리의 CSV 템플릿을 다운로드합니다.
        </Typography>
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>3단계:</strong> 다운로드한 템플릿에 상품 데이터를 입력합니다.
        </Typography>
        <Typography variant="body2" component="div" sx={{ mb: 2 }}>
          <strong>4단계:</strong> "CSV 파일 업로드" 버튼을 클릭하여 작성한 CSV 파일을 업로드합니다.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>참고:</strong> part_number가 동일한 제품이 이미 존재하는 경우 업데이트되며, 존재하지 않는 경우 새로 추가됩니다.
        </Typography>
      </Paper>
    </Container>
  );
}