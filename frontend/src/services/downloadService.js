import api from './api';

class DownloadService {
  static async downloadReportsExcel() {
    try {
      const response = await api.get('/download/reports', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lecture-reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download reports error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Download failed' 
      };
    }
  }

  static async downloadComplaintsExcel() {
    try {
      const response = await api.get('/download/complaints', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'complaints.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download complaints error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Download failed' 
      };
    }
  }

  static async downloadMyData() {
    try {
      const response = await api.get('/download/my-data');
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download user data error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Download failed' 
      };
    }
  }
}

export default DownloadService;