'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';
import { FiSearch, FiPlus, FiDownload, FiMoreVertical } from 'react-icons/fi';

interface OrderItem {
  id: string;
  orderId: string;
  name: string;
  date: string;
  paymentStatus: 'Paid' | 'Refunded' | 'Cancel';
  total: number;
  orderStatus: 'Shipped' | 'In Progress' | 'Delivered';
}

export default function OrdersPage() {
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [orders, setOrders] = useState<OrderItem[]>([
    { id: '1', orderId: '#DU00017', name: 'Harold Gonzalez', date: '3 Oct, 2023 10:02 PM', paymentStatus: 'Paid', total: 120.00, orderStatus: 'Shipped' },
    { id: '2', orderId: '#DU00016', name: 'Anthony Anderson', date: '19 August, 2023 6:22 PM', paymentStatus: 'Paid', total: 220.00, orderStatus: 'In Progress' },
    { id: '3', orderId: '#DU00015', name: 'Gary Faulkner', date: '8 August, 2023 8:13 AM', paymentStatus: 'Paid', total: 113.42, orderStatus: 'Shipped' },
    { id: '4', orderId: '#DU00014', name: 'Steve Nelson', date: '26 July, 2023 10:19 AM', paymentStatus: 'Paid', total: 425.31, orderStatus: 'Delivered' },
    { id: '5', orderId: '#DU00013', name: 'Kimberly Sullivan', date: '18 July, 2023 9:52 PM', paymentStatus: 'Refunded', total: 113.00, orderStatus: 'Delivered' },
    { id: '6', orderId: '#DU00012', name: 'Susan Pugh', date: '2 July, 2023 8:00 AM', paymentStatus: 'Paid', total: 831.99, orderStatus: 'Delivered' },
    { id: '7', orderId: '#DU00011', name: 'Elliott Potts', date: '23 June, 2023 8:14 PM', paymentStatus: 'Cancel', total: 113.00, orderStatus: 'Delivered' },
    { id: '8', orderId: '#DU00010', name: 'Richard Beaudry', date: '13 June, 2023 4:12 PM', paymentStatus: 'Paid', total: 582.99, orderStatus: 'Delivered' },
    { id: '9', orderId: '#DU00009', name: 'Henry Saxton', date: '5 May, 2023 12:02 PM', paymentStatus: 'Paid', total: 0.00, orderStatus: 'Delivered' },
    { id: '10', orderId: '#DU00008', name: 'Juanita Diener', date: '4 April, 2023 5:02 PM', paymentStatus: 'Paid', total: 25.23, orderStatus: 'Delivered' },
  ]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Refunded': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Cancel': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getOrderBadge = (status: string) => {
    switch (status) {
      case 'Shipped': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-xl transition-colors duration-300 ${
      isDark ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      
      {/* Header & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold">Orders</h1>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/dashboard/shoping/order/add-order"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transition"
          >
            <FiPlus size={16} /> + Add New Order
          </Link>
          <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-300 hover:bg-slate-100'
          }`}>
            <FiDownload size={14} /> Export
          </button>
        </div>
      </div>

      {/* Baris Filter & Pencarian */}
      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 py-4 mb-4 text-xs ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3 top-3 opacity-50" size={14} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:border-indigo-500 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-300'
            }`}
            placeholder="Search Files..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="opacity-70">Status</span>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl border focus:outline-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300'
            }`}
          >
            <option value="All">All Status</option>
            <option value="Shipped">Shipped</option>
            <option value="In Progress">In Progress</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Tabel Orders */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b opacity-60 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <th className="pb-3 font-semibold w-10 text-center">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="pb-3 font-semibold">Order ID</th>
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 font-semibold">Payment Status</th>
              <th className="pb-3 font-semibold">Total</th>
              <th className="pb-3 font-semibold">Order Status</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
            {filteredOrders.map((order) => (
              <tr key={order.id} className={`transition ${isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-100/60'}`}>
                <td className="py-4 text-center">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="py-4 font-bold text-indigo-400">{order.orderId}</td>
                <td className="py-4 font-semibold">{order.name}</td>
                <td className="py-4 opacity-75">{order.date}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getPaymentBadge(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="py-4 font-semibold">${order.total.toFixed(2)}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${getOrderBadge(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <button className="p-1.5 rounded-lg opacity-60 hover:opacity-100 transition">
                    <FiMoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t text-xs ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <span className="opacity-60">Showing 1 to 8 of 12 entries</span>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className={`px-3 py-1.5 rounded-lg border transition ${
              isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
          >
            Previous
          </button>
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`w-8 h-8 rounded-lg font-semibold border transition ${
                currentPage === num
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white'
              }`}
            >
              {num}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
            className={`px-3 py-1.5 rounded-lg border transition ${
              isDark ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-300 bg-white hover:bg-slate-100'
            }`}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}