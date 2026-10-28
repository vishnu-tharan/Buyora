import { toast } from '@/components/ui/toast';

export function useToast() {
  return { toast, dismiss: (id) => toast.close(id) };
}
