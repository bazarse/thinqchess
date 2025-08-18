"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const DiscountCodes = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [newCode, setNewCode] = useState({
    code: '',
    discount_percent: '',
    usage_limit: '',
    is_active: true,
    code_type: 'manual'
  });

  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDiscountCodes();
    }
  }, [user]);

  const fetchDiscountCodes = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/discount-codes');
      if (!response.ok) {
        throw new Error('Failed to fetch discount codes');
      }

      const data = await response.json();

      if (data.success) {
        setDiscountCodes(data.discountCodes);
        setMessage('');
      } else {
        throw new Error(data.error || 'Failed to fetch discount codes');
      }
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      setMessage('Error loading discount codes');
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCode = async () => {
    if (!newCode.code || !newCode.discount_percent || !newCode.usage_limit) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const codeUpper = newCode.code.toUpperCase();

      // Detect if this is a prefix code (ends with underscore)
      const isPrefix = codeUpper.endsWith('_');

      const requestBody = {
        code: codeUpper,
        discount_percent: parseFloat(newCode.discount_percent),
        usage_limit: parseInt(newCode.usage_limit),
        is_active: newCode.is_active,
        code_type: isPrefix ? 'prefix' : 'manual'
      };

      // If it's a prefix code, add prefix field
      if (isPrefix) {
        requestBody.prefix = codeUpper;
      }

      const response = await fetch('/api/admin/discount-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        setDiscountCodes(prev => [...prev, data.discountCode]);
        setNewCode({ code: '', discount_percent: '', usage_limit: '', is_active: true, code_type: 'manual' });
        setMessage(`${isPrefix ? 'Prefix' : 'Discount'} code added successfully!`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to add discount code");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error('Error adding discount code:', error);
      setMessage("Error adding discount code");
      setTimeout(() => setMessage(""), 5000);
    }
  };




  const toggleCodeStatus = async (id) => {
    const code = discountCodes.find(c => c.id === id);
    if (!code) return;

    try {
      const response = await fetch('/api/admin/discount-codes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: code.id,
          is_active: !code.is_active
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDiscountCodes(prev =>
          prev.map(c =>
            c.id === id ? { ...c, is_active: !c.is_active } : c
          )
        );
        setMessage(`Discount code ${!code.is_active ? 'activated' : 'deactivated'} successfully!`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Failed to update discount code status");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error) {
      console.error('Error updating discount code status:', error);
      setMessage("Error updating discount code status");
      setTimeout(() => setMessage(""), 5000);
    }
  };

  const deleteCode = async (id) => {
    if (confirm("Are you sure you want to delete this discount code?")) {
      try {
        const response = await fetch(`/api/admin/discount-codes?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setDiscountCodes(prev => prev.filter(code => code.id !== id));
          setMessage("Discount code deleted successfully!");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setMessage(data.error || "Failed to delete discount code");
          setTimeout(() => setMessage(""), 5000);
        }
      } catch (error) {
        console.error('Error deleting discount code:', error);
        setMessage("Error deleting discount code");
        setTimeout(() => setMessage(""), 5000);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
      router.push('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2B3AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Codes</h1>
        <p className="text-gray-600">Create and manage promotional discount codes</p>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Add New Code */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-[#2B3AA0] mb-4">🎫 Add New Discount Code</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
              <input
                type="text"
                value={newCode.code}
                onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                placeholder="NEWCODE or TC1_"
              />
              <p className="text-xs text-gray-500 mt-1">Use underscore for prefix codes (e.g., TC1_)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
              <input
                type="number"
                value={newCode.discount_percent}
                onChange={(e) => setNewCode(prev => ({ ...prev, discount_percent: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                placeholder="10"
                min="1"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
              <input
                type="number"
                value={newCode.usage_limit}
                onChange={(e) => setNewCode(prev => ({ ...prev, usage_limit: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B3AA0]"
                placeholder="100"
                min="1"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddCode}
                className="w-full bg-[#2B3AA0] hover:bg-[#1e2a70] text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Add Code
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">💡 Simple Prefix Codes:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Regular Code:</strong> SAVE10 - Exact match required</li>
              <li>• <strong>Prefix Code:</strong> TC1_ - Works for any code starting with TC1_</li>
              <li>• <strong>Example:</strong> TC1_ with 10% discount allows TC1_STUDENT, TC1_TEACHER, etc.</li>
            </ul>
          </div>
        </div>



        {/* Existing Codes */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Existing Discount Codes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {discountCodes.map((code) => (
                  <tr key={code.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{code.code}</div>
                      {code.code_type === 'prefix' && (
                        <div className="text-xs text-gray-500">
                          {code.match_type === 'domain' && code.email_domain && (
                            <span>Domain: {code.email_domain}</span>
                          )}
                          {code.match_type === 'email_prefix' && code.email_prefix && (
                            <span>Email contains: {code.email_prefix}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.code_type === 'prefix'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {code.code_type === 'prefix' ? 'Email Prefix' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{code.discount_percent}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {code.used_count} / {code.usage_limit}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(code.used_count / code.usage_limit) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        code.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleCodeStatus(code.id)}
                        className={`mr-2 px-3 py-1 rounded text-xs ${
                          code.is_active 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {code.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscountCodes;
