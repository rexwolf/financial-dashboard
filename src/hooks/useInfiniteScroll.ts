import { useState, useEffect, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  threshold?: number;
}

const useInfiniteScroll = ({
  hasNextPage,
  fetchNextPage,
  threshold = 100
}: UseInfiniteScrollOptions) => {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (
      scrollTop + clientHeight >= scrollHeight - threshold &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      setIsFetchingNextPage(true);
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, threshold]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (isFetchingNextPage) {
      const timer = setTimeout(() => setIsFetchingNextPage(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isFetchingNextPage]);

  return { isFetchingNextPage };
};

export default useInfiniteScroll;