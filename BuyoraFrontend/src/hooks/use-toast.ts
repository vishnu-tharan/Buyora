import { toast } from '@/components/ui/toast';
export function useToast() {
  return { toast, dismiss: (id?: string) => toast.close(id) };
}
