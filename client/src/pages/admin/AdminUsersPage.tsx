import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  Filter,
  Shield,
  Stethoscope,
  Pill,
  UserCheck,
  UserX,
  Edit,
  X,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { api } from '../../api/client';
import { User } from '../../types';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', roleFilter, searchTerm, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', String(page));
      params.append('limit', '20');
      return api.get<{ users: User[]; pagination: { total: number; totalPages: number } }>(
        `/admin/users?${params.toString()}`
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (vars: { id: string; role: string; isActive: boolean }) =>
      api.patch(`/admin/users/${vars.id}/status`, {
        role: vars.role,
        isActive: vars.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminAnalyticsOverview'] });
      setSelectedUser(null);
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Failed to update user security profile');
    },
  });

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsActive(user.isActive !== false);
    setActionError(null);
  };

  const users = data?.users || [];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-0.5 rounded-full">
            <Shield className="w-3 h-3" /> ADMIN
          </span>
        );
      case 'DOCTOR':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-0.5 rounded-full">
            <Stethoscope className="w-3 h-3" /> DOCTOR
          </span>
        );
      case 'PHARMACIST':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-0.5 rounded-full">
            <Pill className="w-3 h-3" /> PHARMACIST
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 bg-slate-800/60 border border-slate-700/40 px-2.5 py-0.5 rounded-full">
            USER / PATIENT
          </span>
        );
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading directory profiles..." minHeight="min-h-[50vh]" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Identity & Access Management</h1>
          <p className="text-sm text-slate-400">
            Control platform roles, clinician licenses, user activity states, and access governance.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Roles</option>
            <option value="USER">Patient / User</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="ADMIN">System Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <EmptyState
          title="No users match query"
          description="Try broadening your search term or clearing the role filters."
          icon={Users}
        />
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full text-left text-sm text-slate-300 min-w-[700px]">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-xs font-bold border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="py-4 px-6">User / Identity</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Contact</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6">Registered</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{u.fullName || u.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> {u.email}
                      </div>
                    </td>
                    <td className="py-4 px-6">{getRoleBadge(u.role)}</td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-slate-300 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {u.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {u.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                          <UserCheck className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400 font-semibold bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-800/40">
                          <UserX className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Role / Status Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" /> Manage Security Identity
                </h3>
                <p className="text-xs text-slate-400">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                {actionError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Platform Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="USER">USER (Patient / Consumer)</option>
                  <option value="DOCTOR">DOCTOR (Physician & Clinical)</option>
                  <option value="PHARMACIST">PHARMACIST (Prescription Review)</option>
                  <option value="ADMIN">ADMIN (Full Security Officer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Account Activity State
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-200">
                    <input
                      type="radio"
                      name="isActive"
                      checked={isActive === true}
                      onChange={() => setIsActive(true)}
                      className="accent-emerald-500"
                    />
                    Active (Granted Access)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-red-300">
                    <input
                      type="radio"
                      name="isActive"
                      checked={isActive === false}
                      onChange={() => setIsActive(false)}
                      className="accent-red-500"
                    />
                    Suspended (Revoke Access)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateUserMutation.isPending}
                onClick={() =>
                  updateUserMutation.mutate({
                    id: selectedUser._id || selectedUser.id || '',
                    role: newRole,
                    isActive,
                  })
                }
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Update Permissions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
