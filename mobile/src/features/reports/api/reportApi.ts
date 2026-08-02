import api from '../../../lib/axios';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const exportTransactionsCSVApi = async (month?: number, year?: number) => {
  const params: any = {};
  if (month) params.month = month;
  if (year) params.year = year;

  // On Web, we can just trigger a download directly using an anchor tag
  if (Platform.OS === 'web') {
    const response = await api.get('/reports/export', { params, responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${year || 'all'}${month ? `_${month}` : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    return true;
  }

  // On iOS/Android, we download to filesystem and share
  try {
    // Generate auth token manually or rely on axios interceptor?
    // Wait, expo-file-system doesn't use axios interceptors, but we can fetch the blob with axios first!
    const response = await api.get('/reports/export', { params, responseType: 'text' });
    
    const fileName = `transactions_${year || 'all'}${month ? `_${month}` : ''}.csv`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, response.data, {
      encoding: FileSystem.EncodingType.UTF8
    });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
      return true;
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    throw error;
  }
};
