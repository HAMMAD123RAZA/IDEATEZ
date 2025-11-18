import { useMemo } from 'react';

export const useReadStatusFilter = (data, showUnreadOnly, showReadOnly) => {
  return useMemo(() => {
    if (showUnreadOnly) {
      return data.filter(item => !item.isRead);
    } else if (showReadOnly) {
      return data.filter(item => item.isRead === true);
    }
    return data;
  }, [data, showUnreadOnly, showReadOnly]);
};