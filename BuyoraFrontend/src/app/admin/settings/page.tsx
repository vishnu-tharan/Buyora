'use client';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminSettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage store configuration" />
      <div className="grid max-w-2xl gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name</Label>
              <Input value="Buyora" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value="LKR (Rs.)" readOnly />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
