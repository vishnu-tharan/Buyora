import { Card, CardContent } from '@/components/ui/card';

export function StatCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="bg-primary/10 text-primary rounded-full p-3">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
