'use client';
import { getErrorDetails } from '@/lib/api/errors';

import { AddressForm } from '@/components/account/AddressForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { accountService } from '@/services/account.service';
import { Address } from '@/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  const {
    data: addresses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => accountService.getAddresses(),
  });

  const handleOpenNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setAddressToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      await accountService.deleteAddress(addressToDelete);
      toast.add({ title: 'Address deleted' });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setIsDeleteDialogOpen(false);
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Failed to delete address',
        description: err.message || 'Please try again.',
      });
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setIsSettingDefault(id);
    try {
      await accountService.setDefaultAddress(id);
      toast.add({ title: 'Default address updated' });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    } catch (caught) {
      const err = getErrorDetails(caught);
      toast.add({
        title: 'Update failed',
        description: err.message || 'Please try again.',
      });
    } finally {
      setIsSettingDefault(null);
    }
  };

  const onFormSuccess = () => {
    setIsFormOpen(false);
    queryClient.invalidateQueries({ queryKey: ['addresses'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Addresses</h1>
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={32} />
        </div>
      ) : error ? (
        <ErrorState title="Failed to load addresses" />
      ) : addresses?.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">No addresses saved</h3>
          <p className="mb-6 text-gray-500">You haven&apos;t saved any delivery addresses yet.</p>
          <Button onClick={handleOpenNew}>Add Your First Address</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses?.map((address) => (
            <div
              key={address.id}
              className={`rounded-xl border bg-white p-5 ${address.isDefault ? 'border-primary shadow-sm' : 'border-gray-200'} relative flex flex-col`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {address.firstName} {address.lastName}
                  </h3>
                  {address.label && (
                    <Badge variant="outline" className="h-5 bg-gray-50 py-0 text-xs">
                      {address.label}
                    </Badge>
                  )}
                  {address.isDefault && (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 h-5 border-none py-0 text-xs">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500"
                    onClick={() => handleOpenEdit(address)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleOpenDelete(address.publicId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-4 flex-1 space-y-1 text-sm text-gray-600">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.city}, {address.district}
                </p>
                {address.postalCode && <p>{address.postalCode}</p>}
                <p>{address.country}</p>
                <p className="pt-2 text-gray-500">Phone: {address.phone}</p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  disabled={isSettingDefault === address.publicId}
                  onClick={() => handleSetDefault(address.publicId)}
                >
                  {isSettingDefault === address.publicId ? (
                    <LoadingSpinner size={16} className="mr-2" />
                  ) : null}
                  Set as Default
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <AddressForm
            initialData={editingAddress || undefined}
            onSuccess={onFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? <LoadingSpinner size={16} className="mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
