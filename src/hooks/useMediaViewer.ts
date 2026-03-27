import { useState, useCallback } from 'react';

export interface MediaItem {
  id: number;
  url: string;
  mimeType: string;
  fileName?: string;
}

export interface MediaViewerState {
  isOpen: boolean;
  currentMedia: MediaItem | null;
  currentIndex: number;
  mediaList: MediaItem[];
}

export const useMediaViewer = () => {
  const [state, setState] = useState<MediaViewerState>({
    isOpen: false,
    currentMedia: null,
    currentIndex: -1,
    mediaList: [],
  });

  const openViewer = useCallback((media: MediaItem, allMedia: MediaItem[]) => {
    const index = allMedia.findIndex(m => m.id === media.id);
    setState({
      isOpen: true,
      currentMedia: media,
      currentIndex: index,
      mediaList: allMedia,
    });
  }, []);

  const closeViewer = useCallback(() => {
    setState({
      isOpen: false,
      currentMedia: null,
      currentIndex: -1,
      mediaList: [],
    });
  }, []);

  const nextMedia = useCallback(() => {
    if (state.currentIndex < state.mediaList.length - 1) {
      const nextIndex = state.currentIndex + 1;
      setState(prev => ({
        ...prev,
        currentMedia: prev.mediaList[nextIndex],
        currentIndex: nextIndex,
      }));
    }
  }, [state.currentIndex, state.mediaList]);

  const previousMedia = useCallback(() => {
    if (state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1;
      setState(prev => ({
        ...prev,
        currentMedia: prev.mediaList[prevIndex],
        currentIndex: prevIndex,
      }));
    }
  }, [state.currentIndex, state.mediaList]);

  return {
    ...state,
    openViewer,
    closeViewer,
    nextMedia,
    previousMedia,
    hasNext: state.currentIndex < state.mediaList.length - 1,
    hasPrevious: state.currentIndex > 0,
  };
};