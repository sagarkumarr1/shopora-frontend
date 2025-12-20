'use client';

import { useEffect, useState } from 'react';
import authService from '@/services/authService';
import { toast } from 'react-toastify';
import { FaSpinner, FaUser, FaUserShield } from 'react-icons/fa';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await authService.getAllUsers();
                setUsers(data.data || []);
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch users");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (isLoading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Users Management</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F5F5F0] border-b border-[#E5E0D8]">
                                <th className="p-4 font-semibold text-gray-600">User</th>
                                <th className="p-4 font-semibold text-gray-600">Email</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                                <th className="p-4 font-semibold text-gray-600">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors border-[#E5E0D8]">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-[#F5F5F0] rounded-full flex items-center justify-center text-[#C08C6C] font-bold border border-[#E5E0D8]">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-gray-800">{user.name}</span>
                                    </td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.role === 'admin' ? <FaUserShield /> : <FaUser />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
