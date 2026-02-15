'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlusCircle, TrendingUp, DollarSign, Calendar, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'food', label: 'Ăn uống', color: '#FF6B6B' },
  { value: 'entertainment', label: 'Giải trí', color: '#4ECDC4' },
  { value: 'study', label: 'Học tập', color: '#45B7D1' },
  { value: 'transport', label: 'Di chuyển', color: '#FFA07A' },
  { value: 'other', label: 'Khác', color: '#95E1D3' }
];

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('expenses');
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load expenses:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mounted && expenses.length >= 0) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, mounted]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newExpense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      votes: { reasonable: 0, unreasonable: 0 },
      userVotes: {}
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleVote = (expenseId, voteType) => {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    
    const updatedExpenses = expenses.map(expense => {
      if (expense.id === expenseId) {
        const currentVote = expense.userVotes[userId];
        const newUserVotes = { ...expense.userVotes };
        const newVotes = { ...expense.votes };

        if (currentVote) {
          newVotes[currentVote]--;
        }

        if (currentVote !== voteType) {
          newVotes[voteType]++;
          newUserVotes[userId] = voteType;
        } else {
          delete newUserVotes[userId];
        }

        return {
          ...expense,
          votes: newVotes,
          userVotes: newUserVotes
        };
      }
      return expense;
    });

    setExpenses(updatedExpenses);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  // Calculate statistics
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const categoryData = CATEGORIES.map(cat => ({
    name: cat.label,
    value: expenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + exp.amount, 0),
    color: cat.color
  })).filter(cat => cat.value > 0);

  const monthlyData = {};
  expenses.forEach(exp => {
    const month = exp.date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + exp.amount;
  });

  const chartMonthlyData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  const uniqueDates = new Set(expenses.map(e => e.date)).size;
  const avgPerDay = expenses.length > 0 ? Math.round(totalSpent / Math.max(1, uniqueDates)) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            💰 Quản Lý Chi Tiêu FPT
          </h1>
          <p className="text-gray-600">Theo dõi và học cách quản lý tiền thông minh</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng chi tiêu</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {totalSpent.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-indigo-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Số giao dịch</p>
                <p className="text-3xl font-bold text-green-600">{expenses.length}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Trung bình/ngày</p>
                <p className="text-3xl font-bold text-orange-600">
                  {avgPerDay.toLocaleString('vi-VN')}đ
                </p>
              </div>
              <Calendar className="w-12 h-12 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Expense Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle className="w-6 h-6 text-indigo-600" />
                Thêm khoản chi tiêu
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên khoản chi
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ví dụ: Ăn sáng..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số tiền (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Thêm chi tiêu
                </button>
              </form>
            </div>

            {/* Charts */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiêu theo danh mục</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiêu theo tháng</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartMonthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')}đ`} />
                      <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Expense List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Danh sách chi tiêu ({expenses.length})
              </h2>
              
              <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                {expenses.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Chưa có khoản chi nào. Thêm khoản chi đầu tiên của bạn! 🎯
                  </p>
                ) : (
                  expenses.map(expense => {
                    const category = CATEGORIES.find(c => c.value === expense.category);
                    return (
                      <div
                        key={expense.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800">{expense.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="text-xs px-2 py-1 rounded-full text-white"
                                style={{ backgroundColor: category?.color }}
                              >
                                {category?.label}
                              </span>
                              <span className="text-xs text-gray-500">{expense.date}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-indigo-600">
                              {expense.amount.toLocaleString('vi-VN')}đ
                            </p>
                            <button
                              onClick={() => deleteExpense(expense.id)}
                              className="text-red-500 hover:text-red-700 mt-1"
                              aria-label="Xóa khoản chi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Voting Section */}
                        <div className="border-t pt-3 mt-3">
                          <p className="text-xs text-gray-600 mb-2">Đánh giá khoản chi này:</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVote(expense.id, 'reasonable')}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 border-green-500 text-green-600 hover:bg-green-50 transition-colors"
                              aria-label="Vote hợp lý"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span className="font-semibold">{expense.votes.reasonable}</span>
                              <span className="text-xs">Hợp lý</span>
                            </button>
                            <button
                              onClick={() => handleVote(expense.id, 'unreasonable')}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 border-red-500 text-red-600 hover:bg-red-50 transition-colors"
                              aria-label="Vote không hợp lý"
                            >
                              <ThumbsDown className="w-4 h-4" />
                              <span className="font-semibold">{expense.votes.unreasonable}</span>
                              <span className="text-xs">Không hợp lý</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}