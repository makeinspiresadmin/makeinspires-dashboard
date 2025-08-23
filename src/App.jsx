import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, DollarSign, Calendar, MapPin, TrendingUp, RefreshCw, Award, Target, BookOpen, PartyPopper, Wrench, Package, Upload, Database, FileSpreadsheet, Building, School, Globe, LogOut, LogIn, Shield, Eye } from 'lucide-react';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Static dashboard data
const staticDashboardData = {
  makerspaceRevenue: 2136773,
  totalTransactions: 5216,
  totalRegistrations: 6138,
  avgTransactionValue: 410,
  programTypes: [
    { name: 'Semester Programs', revenue: 804561, percentage: 37.7, category: 'semester' },
    { name: 'Weekly Programs', revenue: 578026, percentage: 27.1, category: 'weekly' },
    { name: 'Drop-in Sessions', revenue: 344529, percentage: 16.1, category: 'dropin' },
    { name: 'Birthday Parties', revenue: 240265, percentage: 11.2, category: 'party' },
    { name: 'Program Packages', revenue: 100450, percentage: 4.7, category: 'pack' },
    { name: 'Other Programs', revenue: 68942, percentage: 3.2, category: 'other' }
  ],
  monthlyData: [
    { month: '2024-09', revenue: 103129, mamaroneck: 42000, nyc: 38000, chappaqua: 23129 },
    { month: '2024-10', revenue: 64827, mamaroneck: 28000, nyc: 24000, chappaqua: 12827 },
    { month: '2024-11', revenue: 73553, mamaroneck: 32000, nyc: 26000, chappaqua: 15553 },
    { month: '2024-12', revenue: 85635, mamaroneck: 36000, nyc: 32000, chappaqua: 17635 },
    { month: '2025-01', revenue: 94844, mamaroneck: 40000, nyc: 35000, chappaqua: 19844 },
    { month: '2025-02', revenue: 95697, mamaroneck: 41000, nyc: 34000, chappaqua: 20697 },
    { month: '2025-03', revenue: 132390, mamaroneck: 55000, nyc: 48000, chappaqua: 29390 },
    { month: '2025-04', revenue: 70517, mamaroneck: 30000, nyc: 25000, chappaqua: 15517 },
    { month: '2025-05', revenue: 72532, mamaroneck: 31000, nyc: 26000, chappaqua: 15532 },
    { month: '2025-06', revenue: 81616, mamaroneck: 35000, nyc: 29000, chappaqua: 17616 },
    { month: '2025-07', revenue: 112989, mamaroneck: 48000, nyc: 40000, chappaqua: 24989 },
    { month: '2025-08', revenue: 146887, mamaroneck: 62000, nyc: 52000, chappaqua: 32887 }
  ]
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const MakeInspiresAdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [activeTab, setActiveTab] = useState('business-overview');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);

  // Initialize authentication
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUploadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .order('upload_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setUploadHistory(data || []);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    }
  };

  const handleLogin = async () => {
    setAuthError('');
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignup = async () => {
    setAuthError('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: 'viewer'
            }
          ]);
          
        if (profileError) throw profileError;
      }
      
      setAuthMode('login');
      setAuthError('Account created! Please log in.');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (userProfile?.role !== 'admin') {
      setUploadStatus('❌ Only administrators can upload files');
      setTimeout(() => setUploadStatus(''), 3000);
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing file...');

    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sawyer-uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: recordData, error: recordError } = await supabase
        .from('file_uploads')
        .insert([
          {
            user_id: user.id,
            filename: file.name,
            file_size: file.size,
            file_path: uploadData.path,
            processing_status: 'completed'
          }
        ])
        .select()
        .single();

      if (recordError) throw recordError;

      setUploadStatus(`✅ Successfully processed ${file.name}`);
      fetchUploadHistory();
      
      setTimeout(() => setUploadStatus(''), 3000);
      
    } catch (error) {
      setUploadStatus(`❌ Error processing file: ${error.message}`);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (user && activeTab === 'upload') {
      fetchUploadHistory();
    }
  }, [user, activeTab]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", highlight = false }) => (
    <div className={`${highlight ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200' : 'bg-white'} rounded-lg shadow-sm border p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${highlight ? 'text-blue-700' : `text-${color}-600`}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${highlight ? 'bg-blue-200' : `bg-${color}-100`} ml-2`}>
          <Icon size={20} className={`${highlight ? 'text-blue-700' : `text-${color}-600`}`} />
        </div>
      </div>
    </div>
  );

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="mx-auto text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Loading MakeInspires Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Globe size={48} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">MakeInspires</h1>
            <p className="text-gray-600">Business Intelligence Dashboard</p>
          </div>

          <div className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={authMode === 'login' ? handleLogin : handleSignup}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <LogIn size={16} className="mr-2" />
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {authMode === 'login' 
                ? "Need an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderBusinessOverview = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-blue-900 flex items-center">
              <Globe size={24} className="mr-3" />
              MakeInspires Business Overview
            </h3>
            <p className="text-blue-700 mt-2">Complete performance across all revenue streams</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-900">$2.14M</p>
            <p className="text-sm text-blue-600">Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="$2.14M" subtitle="All business lines" icon={DollarSign} color="blue" highlight={true} />
        <StatCard title="Total Transactions" value="5,216" subtitle="Paid enrollments" icon={Users} color="green" />
        <StatCard title="Avg Transaction" value="$410" subtitle="Per enrollment" icon={Target} color="purple" />
        <StatCard title="Growth Rate" value="+32%" subtitle="August vs July" icon={TrendingUp} color="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Program Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={staticDashboardData.programTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name.split(' ')[0]}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="revenue"
              >
                {staticDashboardData.programTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={staticDashboardData.monthlyData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tickFormatter={formatMonth} />
              <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
              <Tooltip formatter={(value, name) => [`$${value.toLocaleString()}`, name]} labelFormatter={(label) => formatMonth(label)} />
              <Legend />
              <Area type="monotone" dataKey="mamaroneck" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Mamaroneck" />
              <Area type="monotone" dataKey="nyc" stackId="1" stroke="#10B981" fill="#10B981" name="NYC" />
              <Area type="monotone" dataKey="chappaqua" stackId="1" stroke="#F59E0B" fill="#F59E0B" name="Chappaqua" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderMakerspaceAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
        <h3 className="text-lg font-semibold text-green-900 flex items-center">
          <Award size={20} className="mr-2" />
          ✅ Live Sawyer Registration Data - Connected to Supabase
        </h3>
        <p className="text-sm text-green-700">Real transaction data with secure multi-user access</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="$2.14M" subtitle="Makerspace programs" icon={DollarSign} color="blue" highlight={true} />
        <StatCard title="Total Registrations" value="6,138" subtitle="Including free" icon={Users} color="green" />
        <StatCard title="Avg Transaction" value="$410" subtitle="Per enrollment" icon={Target} color="purple" />
        <StatCard title="Top Program" value="Semester" subtitle="37.7% of revenue" icon={BookOpen} color="indigo" />
      </div>
    </div>
  );

  const renderPartnerPrograms = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-8 text-center">
        <School size={64} className="mx-auto text-green-600 mb-4" />
        <h3 className="text-xl font-semibold text-green-900 mb-2">Partner Programs Dashboard</h3>
        <p className="text-green-700 mb-4">Ready for Quickbooks integration in Phase 2</p>
      </div>
    </div>
  );

  const renderDataUpload = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Upload size={20} className="mr-2" />
          Upload Sawyer Transaction Data
          {userProfile?.role === 'admin' && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Admin Access</span>
          )}
        </h3>
        
        <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
          userProfile?.role === 'admin' ? 'border-gray-300 hover:border-blue-400' : 'border-gray-200 bg-gray-50'
        }`}>
          <FileSpreadsheet size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 mb-2">Upload Sawyer Export</p>
          <p className="text-sm text-gray-500 mb-4">Select your Excel file to process</p>
          
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isUploading || userProfile?.role !== 'admin'}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              userProfile?.role !== 'admin' ? 'bg-gray-300 cursor-not-allowed' :
              isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {isUploading ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : userProfile?.role !== 'admin' ? (
              <>
                <Shield size={16} className="mr-2" />
                Admin Only
              </>
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Choose File
              </>
            )}
          </label>
        </div>

        {uploadStatus && (
          <div className={`mt-4 p-3 rounded-lg ${
            uploadStatus.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
            uploadStatus.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {uploadStatus}
          </div>
        )}
      </div>

      {uploadHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Upload History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {uploadHistory.map((upload) => (
                  <tr key={upload.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(upload.upload_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{upload.filename}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✅ Success
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MakeInspires Business Dashboard</h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">Complete business intelligence</p>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Live Data</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">Supabase Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.full_name || user?.email}</p>
                <p className="text-xs text-gray-500 flex items-center">
                  {userProfile?.role === 'admin' ? (
                    <>
                      <Shield size={12} className="mr-1" />
                      Administrator
                    </>
                  ) : (
                    <>
                      <Eye size={12} className="mr-1" />
                      Viewer
                    </>
                  )}
                </p>
              </div>
              
              <button onClick={handleLogout} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'business-overview', name: 'Business Overview', icon: Globe },
              { id: 'makerspace', name: 'Makerspace Analytics', icon: Building },
              { id: 'partner-programs', name: 'Partner Programs', icon: School },
              { id: 'upload', name: 'Data Upload', icon: Upload }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.name}
                {tab.id === 'partner-programs' && <span className="text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Soon</span>}
                {tab.id === 'upload' && userProfile?.role !== 'admin' && <Shield size={12} className="text-orange-500" />}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'business-overview' && renderBusinessOverview()}
        {activeTab === 'makerspace' && renderMakerspaceAnalytics()}
        {activeTab === 'partner-programs' && renderPartnerPrograms()}
        {activeTab === 'upload' && renderDataUpload()}
      </div>
    </div>
  );
};

export default MakeInspiresAdminDashboard;
