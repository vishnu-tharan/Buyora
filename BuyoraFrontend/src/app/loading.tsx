import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="bg-background/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <LoadingSpinner size={48} />
    </div>
  );
}
