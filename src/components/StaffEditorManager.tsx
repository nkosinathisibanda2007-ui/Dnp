import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  User,
  Power,
  RefreshCw,
  Lock,
  Edit,
  Check,
  X,
  Sliders,
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { EditorUser, EditorPermissions } from '../types';

export const StaffEditorManager: React.FC = () => {
  const {
    fetchEditors,
    createEditor,
    updateEditorPermissions,
    updateEditorStatus,
    resetEditorPassword,
  } = useCms();

  const [editors, setEditors] = useState<EditorUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<EditorUser | null>(null);
  const [resettingPasswordUser, setResettingPasswordUser] = useState<EditorUser | null>(null);

  // New Editor Form state
  const [newFullName, setNewFullName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<EditorPermissions>({
    manageProducts: true,
    manageServices: true,
    manageProjects: true,
    manageOperations: true,
    manageLocations: true,
    manageMedia: true,
    editContent: true,
  });

  // Password reset state
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const loadEditors = async () => {
    setIsLoading(true);
    try {
      const res = await fetchEditors();
      if (res.success && res.editors) {
        setEditors(res.editors);
      } else {
        setErrorMessage(res.error || 'Failed to load editors.');
      }
    } catch {
      setErrorMessage('Network connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEditors();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const showError = (err: string) => {
    setErrorMessage(err);
    setTimeout(() => setErrorMessage(null), 4500);
  };

  // Handle Create Editor
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newUsername.trim() || !newEmail.trim() || !newPassword.trim()) {
      showError('All fields are required.');
      return;
    }

    try {
      const res = await createEditor({
        fullName: newFullName.trim(),
        username: newUsername.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        permissions: newPermissions,
      });

      if (res.success) {
        showToast(`Editor account for ${newFullName} created successfully.`);
        setIsCreateModalOpen(false);
        setNewFullName('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        loadEditors();
      } else {
        showError(res.error || 'Failed to create editor.');
      }
    } catch (err: any) {
      showError(err.message || 'Network error.');
    }
  };

  // Handle Toggle Status
  const handleToggleStatus = async (editor: EditorUser) => {
    const nextStatus = !editor.isActive;
    try {
      const res = await updateEditorStatus(editor.id, nextStatus);
      if (res.success) {
        showToast(`Editor ${editor.username} marked as ${nextStatus ? 'Active' : 'Suspended'}.`);
        loadEditors();
      } else {
        showError(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      showError(err.message || 'Network error.');
    }
  };

  // Handle Save Permissions
  const handleSavePermissions = async () => {
    if (!editingPermissionsUser) return;
    try {
      const res = await updateEditorPermissions(
        editingPermissionsUser.id,
        editingPermissionsUser.permissions
      );
      if (res.success) {
        showToast(`Permissions updated for ${editingPermissionsUser.username}.`);
        setEditingPermissionsUser(null);
        loadEditors();
      } else {
        showError(res.error || 'Failed to update permissions.');
      }
    } catch (err: any) {
      showError(err.message || 'Network error.');
    }
  };

  // Handle Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingPasswordUser || !newPasswordInput.trim()) return;

    try {
      const res = await resetEditorPassword(resettingPasswordUser.id, newPasswordInput.trim());
      if (res.success) {
        showToast(`Password successfully reset for ${resettingPasswordUser.username}.`);
        setResettingPasswordUser(null);
        setNewPasswordInput('');
      } else {
        showError(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      showError(err.message || 'Network error.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-emerald-900 border border-emerald-600 text-emerald-100 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-red-900 border border-red-600 text-red-100 text-xs font-semibold shadow-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="ml-2 underline text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#faf9f5]">Staff & Editor Management</h2>
          <p className="text-xs text-[#9bb09e] mt-1">
            Authorize and supervise subordinate employees. Editors can manage approved content sections without accessing system administration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadEditors}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#142417] hover:bg-[#1e3623] text-[#cad6cc] border border-[#2b4d32] text-xs transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#d39c4a]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Authorized Editor</span>
          </button>
        </div>
      </div>

      {/* Architecture Explanation Card */}
      <div className="p-4 rounded-xl bg-[#142317] border border-[#254029] flex items-start gap-3 text-xs text-[#cad6cc]">
        <ShieldCheck className="w-4 h-4 text-[#d39c4a] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">Employer / Employee Hierarchy Enforced</span>
          <span className="text-[#9bb09e]">
            You (Administrator) maintain full authority over all site data and staff accounts. Editors only have access to their designated workspace at <code className="text-[#e5a952]">/editor</code> and require valid authentication. Every edit made by an Editor is logged with their account details in the Audit Trail.
          </span>
        </div>
      </div>

      {/* Editors Table */}
      <div className="bg-[#142317] border border-[#254029] rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#7d9681]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#d39c4a]" />
            <span>Loading authorized editors...</span>
          </div>
        ) : editors.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9bb09e] space-y-2">
            <Users className="w-8 h-8 text-[#4a6b50] mx-auto mb-2" />
            <div className="font-medium text-white">No subordinate editors registered yet.</div>
            <p className="text-[#7d9681]">
              Click "Add Authorized Editor" above to provision accounts for farm managers, agronomists, or marketing employees.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1911] text-[#869f8a] uppercase font-mono text-[10px] tracking-wider border-b border-[#254029]">
                <tr>
                  <th className="px-4 py-3">Editor</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Permissions Scope</th>
                  <th className="px-4 py-3">Created / Login</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f3823] text-[#cad6cc]">
                {editors.map((editor) => {
                  const perms = editor.permissions || ({} as any);
                  const activeCount = Object.values(perms).filter(Boolean).length;
                  return (
                    <tr key={editor.id} className="hover:bg-[#182b1c] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1e3823] border border-[#305937] flex items-center justify-center font-bold text-[11px] text-[#e5a952]">
                            {editor.fullName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{editor.fullName}</div>
                            <div className="text-[11px] text-[#7d9681] font-mono">@{editor.username}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#a9bcae]">
                          <Mail className="w-3 h-3 text-[#7d9681]" />
                          <span>{editor.email}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase font-mono ${
                            editor.isActive
                              ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                              : 'bg-red-950/80 border border-red-700/60 text-red-300'
                          }`}
                        >
                          {editor.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setEditingPermissionsUser(editor)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#1e3823] hover:bg-[#284c30] text-[11px] text-[#faf9f5] border border-[#355c3c] cursor-pointer"
                        >
                          <Sliders className="w-3 h-3 text-[#d39c4a]" />
                          <span>{activeCount} / 7 Modules</span>
                        </button>
                      </td>

                      <td className="px-4 py-3 text-[11px] text-[#869f8a]">
                        <div>{new Date(editor.createdAt).toLocaleDateString()}</div>
                        {editor.lastLogin && (
                          <div className="text-[10px] text-[#6b8570]">
                            Last login: {new Date(editor.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(editor)}
                            className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              editor.isActive
                                ? 'bg-[#2b1818] hover:bg-[#3d2020] text-red-300 border-red-900/50'
                                : 'bg-[#182b1c] hover:bg-[#223d28] text-emerald-300 border-emerald-900/50'
                            }`}
                            title={editor.isActive ? 'Suspend account' : 'Reactivate account'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResettingPasswordUser(editor);
                              setNewPasswordInput('');
                            }}
                            className="p-1.5 rounded-lg bg-[#192b1d] hover:bg-[#243e2a] text-[#cad6cc] hover:text-white border border-[#2d4d34] text-xs cursor-pointer"
                            title="Reset password"
                          >
                            <Key className="w-3.5 h-3.5 text-[#d39c4a]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE NEW EDITOR */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#121e14] border border-[#26442b] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#cad6cc]">
            <div className="flex items-center justify-between border-b border-[#254029] pb-3">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                <UserPlus className="w-5 h-5 text-[#d39c4a]" />
                <span>Create Authorized Editor Account</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-[#869f8a] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tendai Moyo"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Username (for sign in)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tendai.moyo"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="tendai@dzinopona.co.zw"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>

                <div>
                  <label className="block text-[#9bb09e] mb-1 font-medium">Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                  />
                </div>
              </div>

              {/* Permissions Checklist */}
              <div className="space-y-2 pt-2 border-t border-[#254029]">
                <label className="block text-white font-medium">Assigned Module Permissions</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'manageProducts', label: 'Products Catalogue' },
                    { key: 'manageProjects', label: 'Strategic Projects & Video' },
                    { key: 'manageOperations', label: 'Farm Operations (11 Disciplines)' },
                    { key: 'manageServices', label: 'Commercial Services' },
                    { key: 'manageLocations', label: 'Farming Hubs (4 Locations)' },
                    { key: 'manageMedia', label: 'Media & Asset Uploads' },
                    { key: 'editContent', label: 'General Site Content & Story' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-xs cursor-pointer hover:bg-[#142317]"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean((newPermissions as any)[perm.key])}
                        onChange={(e) =>
                          setNewPermissions({
                            ...newPermissions,
                            [perm.key]: e.target.checked,
                          })
                        }
                        className="rounded border-[#28422c] text-[#b57a2c] focus:ring-0"
                      />
                      <span className="text-[#faf9f5]">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#254029]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#1a2d1d] hover:bg-[#25402a] text-[#cad6cc] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PERMISSIONS */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#121e14] border border-[#26442b] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-[#cad6cc]">
            <div className="flex items-center justify-between border-b border-[#254029] pb-3">
              <div>
                <h3 className="text-white font-serif font-bold text-base">Adjust Editor Permissions</h3>
                <p className="text-xs text-[#869f8a]">
                  Editing for <strong>{editingPermissionsUser.fullName}</strong> (@{editingPermissionsUser.username})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="p-1 text-[#869f8a] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'manageProducts', label: 'Products Catalogue' },
                { key: 'manageProjects', label: 'Strategic Projects & Video' },
                { key: 'manageOperations', label: 'Farm Operations (11 Disciplines)' },
                { key: 'manageServices', label: 'Commercial Services' },
                { key: 'manageLocations', label: 'Farming Hubs (4 Locations)' },
                { key: 'manageMedia', label: 'Media & Asset Uploads' },
                { key: 'editContent', label: 'General Site Content & Story' },
              ].map((perm) => (
                <label
                  key={perm.key}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#0e1710] border border-[#28422c] cursor-pointer hover:bg-[#142317]"
                >
                  <span className="text-[#faf9f5] font-medium">{perm.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean((editingPermissionsUser.permissions as any)?.[perm.key])}
                    onChange={(e) =>
                      setEditingPermissionsUser({
                        ...editingPermissionsUser,
                        permissions: {
                          ...editingPermissionsUser.permissions,
                          [perm.key]: e.target.checked,
                        },
                      })
                    }
                    className="rounded border-[#28422c] text-[#b57a2c] focus:ring-0"
                  />
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#254029]">
              <button
                type="button"
                onClick={() => setEditingPermissionsUser(null)}
                className="px-4 py-2 rounded-lg bg-[#1a2d1d] hover:bg-[#25402a] text-[#cad6cc] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="px-4 py-2 rounded-lg bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {resettingPasswordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#121e14] border border-[#26442b] rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-[#cad6cc]">
            <div className="flex items-center justify-between border-b border-[#254029] pb-3">
              <div className="flex items-center gap-2 text-white font-serif font-bold text-base">
                <Key className="w-5 h-5 text-[#d39c4a]" />
                <span>Reset Editor Password</span>
              </div>
              <button
                type="button"
                onClick={() => setResettingPasswordUser(null)}
                className="p-1 text-[#869f8a] hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <p className="text-[#9bb09e] mb-2">
                  Set a new password for <strong>{resettingPasswordUser.fullName}</strong> (@{resettingPasswordUser.username}).
                </p>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="New password (min 6 chars)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0e1710] border border-[#28422c] text-white focus:outline-hidden focus:border-[#d39c4a]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingPasswordUser(null)}
                  className="px-4 py-2 rounded-lg bg-[#1a2d1d] hover:bg-[#25402a] text-[#cad6cc] text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#b57a2c] hover:bg-[#c68936] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
