
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search,
  MapPin,
  Plus,
  Heart,
  ArrowRight,
  Recycle,
  ShieldCheck,
  Truck,
  MessageCircle,
  Menu,
  X,
  User,
  Tag,
  Package,
  Send,
  Check,
  CheckCircle,
  XCircle,
  RefreshCw,
  IndianRupee,
  Wallet,
  Clock,
  ChevronLeft,
  LayoutDashboard,
  Users,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Trash2,
  Eye,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import './index.css';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const demoProducts = [
  {
    id: 1,
    title: 'Lenovo ThinkPad Laptop',
    category: 'Laptops',
    price: 18000,
    condition: 'Good',
    location: 'Patiala, Punjab',
    seller: 'Rahul S.',
    icon: '💻',
    color: 'blue',
    description:
      'Reliable Lenovo ThinkPad suitable for students and everyday work.',
    specs: 'Intel Core i5 · 8GB RAM · 256GB SSD'
  },
  {
    id: 2,
    title: 'Samsung Galaxy S21',
    category: 'Phones',
    price: 14500,
    condition: 'Like new',
    location: 'Amritsar, Punjab',
    seller: 'Aman K.',
    icon: '📱',
    color: 'purple',
    description:
      'A pre-owned Samsung Galaxy S21 in excellent working condition.',
    specs: '8GB RAM · 128GB Storage · 5G'
  },
  {
    id: 3,
    title: 'Dell 24-inch Monitor',
    category: 'Monitors',
    price: 6500,
    condition: 'Good',
    location: 'Chandigarh',
    seller: 'Neha M.',
    icon: '🖥️',
    color: 'green',
    description:
      'A Dell monitor ideal for study setups, offices, and gaming.',
    specs: '24-inch Display · Full HD · HDMI'
  },
  {
    id: 4,
    title: 'Mechanical Keyboard',
    category: 'Accessories',
    price: 1800,
    condition: 'Used',
    location: 'Ludhiana, Punjab',
    seller: 'Arjun P.',
    icon: '⌨️',
    color: 'orange',
    description:
      'Mechanical keyboard for typing, coding, and gaming.',
    specs: 'Mechanical Switches · USB Connection'
  },
  {
    id: 5,
    title: 'HP Laser Printer',
    category: 'Printers',
    price: 4200,
    condition: 'Fair',
    location: 'Jalandhar, Punjab',
    seller: 'Simran K.',
    icon: '🖨️',
    color: 'pink',
    description:
      'Used HP laser printer for home and small office requirements.',
    specs: 'Laser Printing · USB Connectivity'
  },
  {
    id: 6,
    title: 'Apple MacBook Air',
    category: 'Laptops',
    price: 42000,
    condition: 'Good',
    location: 'Mohali, Punjab',
    seller: 'Karan D.',
    icon: '💻',
    color: 'indigo',
    description:
      'Apple MacBook Air M1 for students, developers, and professionals.',
    specs: 'Apple M1 · 8GB RAM · 256GB SSD'
  }
];

const categories = [
  'All',
  'Laptops',
  'Phones',
  'Monitors',
  'Accessories',
  'Printers'
];

const initialMessages = [
  {
    id: 1,
    sender: 'seller',
    text: 'Hello! Thanks for your interest in this product.',
    time: '10:30 AM',
    type: 'text'
  },
  {
    id: 2,
    sender: 'buyer',
    text: 'Hi! Is the device working properly? Could you share more details about its condition?',
    time: '10:31 AM',
    type: 'text'
  },
  {
    id: 3,
    sender: 'seller',
    text: 'Yes, it is working properly. I can share more specifications and photos before we finalize the deal.',
    time: '10:32 AM',
    type: 'text'
  }
];

function formatPrice(value) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return `₹${safe.toLocaleString('en-IN')}`;
}

/** Sanitize user-generated text to prevent XSS via innerHTML (though React escapes by default, this guards any future use). */
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;", '&':'&amp;' }[c]));
}

/** Clamp a value between min and max */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function AdminDashboard({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewingDispute, setViewingDispute] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [realOrders, setRealOrders] = useState([]);

  const [users, setUsers] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', status: 'Active' },
    { id: 2, name: 'Aman Kumar', email: 'aman@example.com', status: 'Active' },
    { id: 3, name: 'Neha Mehta', email: 'neha@example.com', status: 'Blocked' }
  ]);

  const [listings, setListings] = useState([
    { id: 1, name: 'Lenovo ThinkPad Laptop', seller: 'Rahul Sharma', status: 'Approved' },
    { id: 2, name: 'Samsung Galaxy S21', seller: 'Aman Kumar', status: 'Pending' },
    { id: 3, name: 'Dell Monitor', seller: 'Neha Mehta', status: 'Approved' }
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const fetchAdminData = async () => {
      setAdminLoading(true);
      try {
        const [{ data: profs }, { data: prods }, { data: ords }] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*, profiles(full_name)').order('created_at', { ascending: false }),
          supabase.from('orders').select('*, products(title)').order('created_at', { ascending: false }),
        ]);
        if (profs && profs.length > 0) {
          setUsers(profs.map(p => ({
            id: p.id,
            name: p.full_name || 'Member',
            email: p.email || 'No email',
            status: p.status === 'blocked' ? 'Blocked' : 'Active',
            role: p.role,
          })));
        }
        if (prods && prods.length > 0) {
          setListings(prods.map(pr => ({
            id: pr.id,
            name: pr.title,
            seller: pr.profiles?.full_name || 'Seller',
            status: pr.status === 'available' ? 'Approved' : pr.status,
            price: pr.price,
          })));
        }
        if (ords) {
          setRealOrders(ords);
        }
      } catch (err) {
        console.warn('Admin live data notice:', err);
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const blockUser = async (id) => {
    const target = users.find(u => u.id === id);
    const newStatus = target?.status === 'Blocked' ? 'active' : 'blocked';
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({ status: newStatus }).eq('id', id);
    }
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status: user.status === 'Blocked' ? 'Active' : 'Blocked'
            }
          : user
      )
    );
  };

  const approveListing = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('products').update({ status: 'available' }).eq('id', id);
    }
    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.id === id
          ? { ...listing, status: 'Approved' }
          : listing
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <span className="section-kicker">ECOTRACK CONTROL CENTER</span>
          <h1>Admin Dashboard</h1>
          <p>Manage users, listings, orders, and platform activity.</p>
        </div>

        <button className="secondary-button" onClick={onBack}>
          <ArrowRight size={17} />
          Back to Marketplace
        </button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button
            className={activeTab === 'overview' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className={activeTab === 'users' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users
          </button>

          <button
            className={activeTab === 'listings' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('listings')}
          >
            <ShoppingBag size={18} />
            Listings
          </button>

          <button
            className={activeTab === 'orders' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            Orders
          </button>

          <button
            className={activeTab === 'payments' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} />
            Payments
          </button>

          <button
            className={activeTab === 'disputes' ? 'admin-nav active' : 'admin-nav'}
            onClick={() => setActiveTab('disputes')}
          >
            <AlertTriangle size={18} />
            Disputes
          </button>
        </aside>

        <section className="admin-content">
          {activeTab === 'overview' && (
            <>
              <h2>Platform Overview</h2>

              <div className="admin-stat-grid">
                <div className="admin-stat-card">
                  <Users size={24} />
                  <span>Total Users</span>
                  <strong>{users.length.toLocaleString('en-IN')}</strong>
                  <small>{isSupabaseConfigured ? 'Synced from database' : '+12% this month'}</small>
                </div>

                <div className="admin-stat-card">
                  <ShoppingBag size={24} />
                  <span>Total Listings</span>
                  <strong>{listings.length.toLocaleString('en-IN')}</strong>
                  <small>{listings.filter(l => l.status === 'Pending').length} pending approval</small>
                </div>

                <div className="admin-stat-card">
                  <IndianRupee size={24} />
                  <span>Total Revenue</span>
                  <strong>₹{((realOrders.length > 0 ? realOrders.reduce((acc, o) => acc + (Number(o.platform_fee) || 11), 0) : 84520)).toLocaleString('en-IN')}</strong>
                  <small>Platform fees collected</small>
                </div>

                <div className="admin-stat-card">
                  <Truck size={24} />
                  <span>Active Orders</span>
                  <strong>{(realOrders.length > 0 ? realOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length : 128).toLocaleString('en-IN')}</strong>
                  <small>Currently in progress</small>
                </div>
              </div>

              <div className="admin-panel">
                <BarChart3 size={24} />
                <h3>Monthly Activity</h3>
                <p>
                  Marketplace activity and user engagement statistics will
                  appear here after backend integration.
                </p>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="admin-panel">
              <h2>User Management</h2>

              {users.map((user) => (
                <div className="admin-list-row" key={user.id}>
                  <div>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>

                  <span className={`admin-status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>

                  <button
                    className="admin-action-button"
                    onClick={() => blockUser(user.id)}
                  >
                    {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="admin-panel">
              <h2>Listing Management</h2>

              {listings.map((listing) => (
                <div className="admin-list-row" key={listing.id}>
                  <div>
                    <strong>{listing.name}</strong>
                    <small>Seller: {listing.seller}</small>
                  </div>

                  <span className={`admin-status ${listing.status.toLowerCase()}`}>
                    {listing.status}
                  </span>

                  {listing.status === 'Pending' && (
                    <button
                      className="admin-action-button"
                      onClick={() => approveListing(listing.id)}
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="admin-panel">
              <h2>Order Monitoring</h2>
              {realOrders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {realOrders.map(o => (
                    <div className="admin-list-row" key={o.id}>
                      <div>
                        <strong>{o.order_number || o.id.substring(0, 8)}</strong>
                        <small>{o.products?.title || 'Product'} · {formatPrice(o.total_paid)}</small>
                      </div>
                      <span className={`admin-status ${o.status?.replace(/_/g, '-')}`}>
                        {o.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p>Active orders: 128</p>
                  <p>Orders awaiting delivery: 42</p>
                  <p>Orders completed: 486</p>
                </>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="admin-panel">
              <h2>Payment Tracking</h2>
              <p>Total processed payments: ₹12,45,800</p>
              <p>Pending payouts: ₹32,500</p>
              <p>Platform fees collected: ₹84,520</p>
            </div>
          )}

          {activeTab === 'disputes' && (
            <div className="admin-panel">
              <h2>Dispute Management</h2>
              <div className="admin-list-row">
                <div>
                  <strong>Order #ET1024</strong>
                  <small>Product condition dispute · Lenovo ThinkPad</small>
                </div>

                <span className="admin-status pending">Under Review</span>

                <button
                  className="admin-action-button"
                  onClick={() => setViewingDispute(!viewingDispute)}
                >
                  <Eye size={16} />
                  {viewingDispute ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {viewingDispute && (
                <div style={{ padding: '16px 20px', background: '#f8faf9', borderTop: '1px solid #edf1ef', fontSize: '13px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Buyer Claim</span>
                      <strong>Battery health is 68%, listing said 'Good condition'</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Seller Response</span>
                      <span>Offered ₹1,500 battery credit or full return</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Escrow Status</span>
                      <strong style={{ color: '#d97706' }}>₹18,000 Frozen in Escrow</strong>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="admin-action-button" onClick={() => setViewingDispute(false)}>Resolve: Approve Return</button>
                    <button className="admin-action-button danger" onClick={() => setViewingDispute(false)}>Dismiss Claim</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}


function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Safe demo authentication mode when Supabase credentials are not configured
        if (mode === 'signup' && !fullName.trim()) {
          throw new Error('Please enter your full name.');
        }
        if (password.length < 6) {
          throw new Error('Password must contain at least 6 characters.');
        }
        const mockUser = {
          id: 'demo-' + (mode === 'signup' ? role : 'user') + '-' + Math.random().toString(36).substring(2, 8),
          email: email.trim(),
          user_metadata: {
            full_name: fullName.trim() || email.split('@')[0],
            phone: phone.trim() || '',
            location: location.trim() || 'Patiala, Punjab',
            role: (mode === 'signup' && (role === 'buyer' || role === 'seller')) ? role : 'buyer',
          },
        };
        await onAuthenticated(mockUser);
        return;
      }

      if (mode === 'signup') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        if (password.length < 6) {
          throw new Error('Password must contain at least 6 characters.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone: phone.trim() || null,
              location: location.trim() || null,
              role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user && data.session) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              email: email.trim(),
              phone: phone.trim() || null,
              location: location.trim() || null,
              role,
            });

          if (profileError) throw profileError;
          await onAuthenticated(data.user);
          return;
        }

        setSuccess(
          'Account created. Check your email to confirm your account, then log in.'
        );
        setMode('login');
        setPassword('');
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (loginError) throw loginError;
        await onAuthenticated(data.user);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className="auth-modal"
        style={{
          width: 'min(520px, calc(100vw - 32px))',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.22)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            border: 0,
            background: '#f1f5f9',
            borderRadius: 10,
            width: 38,
            height: 38,
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        <div style={{ paddingRight: 45 }}>
          <div className="eyebrow">ECOTRACK ACCOUNT</div>
          <h2 style={{ margin: '8px 0 6px', fontSize: 30 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            {mode === 'login'
              ? 'Log in to manage your EcoTrack activity.'
              : 'Join EcoTrack and start giving electronics a second life.'}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            margin: '24px 0 20px',
            background: '#f1f5f9',
            padding: 5,
            borderRadius: 12,
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              border: 0,
              borderRadius: 9,
              padding: '11px 8px',
              cursor: 'pointer',
              background: mode === 'login' ? '#fff' : 'transparent',
              fontWeight: 700,
            }}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            style={{
              border: 0,
              borderRadius: 9,
              padding: '11px 8px',
              cursor: 'pointer',
              background: mode === 'signup' ? '#fff' : 'transparent',
              fontWeight: 700,
            }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Full name</span>
                <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" required />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={{ display: 'block', marginBottom: 14 }}>
                  <span className="field-label">Phone</span>
                  <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
                </label>
                <label style={{ display: 'block', marginBottom: 14 }}>
                  <span className="field-label">Location</span>
                  <input className="form-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / State" />
                </label>
              </div>

              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Account role</span>
                <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
            </>
          )}

          <label style={{ display: 'block', marginBottom: 14 }}>
            <span className="field-label">Email</span>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </label>

          <label style={{ display: 'block', marginBottom: 18 }}>
            <span className="field-label">Password</span>
            <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
          </label>

          {error && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '11px 13px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#f0fdf4', color: '#15803d', padding: '11px 13px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>
              {success}
            </div>
          )}

          <button className="primary-button" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}


function productPresentation(category = '') {
  const value = category.toLowerCase();
  if (value.includes('laptop') || value.includes('computer')) return { icon: '💻', color: 'blue' };
  if (value.includes('phone') || value.includes('mobile')) return { icon: '📱', color: 'purple' };
  if (value.includes('monitor') || value.includes('display')) return { icon: '🖥️', color: 'green' };
  if (value.includes('keyboard') || value.includes('access')) return { icon: '⌨️', color: 'orange' };
  if (value.includes('printer')) return { icon: '🖨️', color: 'pink' };
  return { icon: '♻️', color: 'indigo' };
}

function ListingModal({ profile, onClose, onCreated, editingProduct = null }) {
  const [form, setForm] = useState({
    title: editingProduct?.title || '',
    category: editingProduct?.category || 'Laptops',
    price: editingProduct?.price ? String(editingProduct.price) : '',
    condition: editingProduct?.condition || 'Good',
    location: editingProduct?.location || profile?.location || '',
    description: editingProduct?.description || '',
    specs: editingProduct?.specs || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!profile?.id) {
      setError('Please log in before creating a listing.');
      return;
    }
    if (profile.role !== 'seller') {
      setError('Your account is currently a Buyer account. Create or use a Seller account to list an item.');
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (form.title.trim().length < 3) {
      setError('Product title must be at least 3 characters.');
      return;
    }

    if (price > 10000000) {
      setError('Price cannot exceed ₹1,00,00,000.');
      return;
    }

    setSaving(true);

    if (!isSupabaseConfigured) {
      const presentation = productPresentation(form.category);
      if (editingProduct) {
        const updatedProduct = {
          ...editingProduct,
          title: form.title.trim(),
          category: form.category,
          price,
          condition: form.condition,
          location: form.location.trim() || 'Patiala, Punjab',
          description: form.description.trim() || 'Pre-owned electronic device ready for reuse.',
          specs: form.specs.trim() || 'Specifications not provided',
          icon: presentation.icon,
          color: presentation.color,
        };
        setSaving(false);
        onCreated(updatedProduct, true);
        onClose();
        return;
      }
      const newProduct = {
        id: Date.now(),
        seller_id: profile.id,
        title: form.title.trim(),
        category: form.category,
        price,
        condition: form.condition,
        location: form.location.trim() || 'Patiala, Punjab',
        description: form.description.trim() || 'Pre-owned electronic device ready for reuse.',
        specs: form.specs.trim() || 'Specifications not provided',
        status: 'available',
        seller: profile.full_name || 'You (Seller)',
        icon: presentation.icon,
        color: presentation.color,
      };
      setSaving(false);
      onCreated(newProduct, false);
      onClose();
      return;
    }

    // Always get the currently authenticated Supabase user here.
    // This prevents an RLS mismatch between the loaded profile and auth.uid().
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      setSaving(false);
      setError('Your login session has expired. Please log in again.');
      return;
    }

    const authenticatedUserId = authData.user.id;

    if (editingProduct) {
      const { data, error: updateError } = await supabase
        .from('products')
        .update({
          title: form.title.trim(),
          category: form.category,
          price,
          condition: form.condition,
          location: form.location.trim() || null,
          description: form.description.trim() || null,
          specs: form.specs.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingProduct.id)
        .eq('seller_id', authenticatedUserId)
        .select('*, profiles(full_name)')
        .single();

      setSaving(false);
      if (updateError) {
        console.error('Product update failed:', updateError);
        setError(updateError.message);
        return;
      }
      const presentation = productPresentation(data.category);
      onCreated({
        ...data,
        seller: data.profiles?.full_name || profile?.full_name || 'Seller',
        icon: presentation.icon,
        color: presentation.color,
      }, true);
      onClose();
      return;
    }

    const { data, error: insertError } = await supabase
      .from('products')
      .insert({
        seller_id: authenticatedUserId,
        title: form.title.trim(),
        category: form.category,
        price,
        condition: form.condition,
        location: form.location.trim() || null,
        description: form.description.trim() || null,
        specs: form.specs.trim() || null,
        status: 'available',
      })
      .select('*, profiles(full_name)')
      .single();

    setSaving(false);

    if (insertError) {
      console.error('Product insert failed:', insertError);
      setError(insertError.message);
      return;
    }

    onCreated(data, false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close listing form">
          <X size={20} />
        </button>
        <div className="modal-content" style={{ paddingTop: 10 }}>
          <div className="section-kicker">SELL ON ECOTRACK</div>
          <h2 style={{ marginBottom: 8 }}>{editingProduct ? 'Edit product listing' : 'Create a new listing'}</h2>
          <p style={{ color: '#64748b', marginTop: 0 }}>
            {editingProduct ? 'Update your device specs, condition, or asking price.' : 'Add your unused electronics and make them available to buyers.'}
          </p>

          <form onSubmit={submit}>
            <label style={{ display: 'block', marginBottom: 14 }}>
              <span className="field-label">Product title</span>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lenovo ThinkPad Laptop" required />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Category</span>
                <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {categories.filter((item) => item !== 'All').map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Price (₹)</span>
                <input className="form-input" type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="18000" required />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Condition</span>
                <select className="form-input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                  <option>Like new</option>
                  <option>Good</option>
                  <option>Used</option>
                  <option>Fair</option>
                </select>
              </label>
              <label style={{ display: 'block', marginBottom: 14 }}>
                <span className="field-label">Location</span>
                <input className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Patiala, Punjab" />
              </label>
            </div>

            <label style={{ display: 'block', marginBottom: 14 }}>
              <span className="field-label">Specifications</span>
              <input className="form-input" value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder="Intel i5 · 8GB RAM · 256GB SSD" />
            </label>

            <label style={{ display: 'block', marginBottom: 18 }}>
              <span className="field-label">Description</span>
              <textarea className="form-input" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe condition, usage, accessories, etc." style={{ resize: 'vertical' }} />
            </label>

            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '11px 13px', borderRadius: 10, marginBottom: 14, fontSize: 14 }}>{error}</div>}

            <button className="primary-button modal-action" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              {editingProduct ? <Check size={18} /> : <Plus size={18} />}
              {saving ? 'Saving...' : editingProduct ? 'Save changes' : 'Publish listing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


function MessagesCenter({ user, profile, initialProduct, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [offers, setOffers] = useState([]);
  const [people, setPeople] = useState({});
  const [products, setProducts] = useState({});
  const [draft, setDraft] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const myRole = profile?.role || 'buyer';

  const loadInbox = async () => {
    if (!user?.id) return;
    setLoading(true); setError('');
    const { data, error: inboxError } = await supabase.from('conversations')
      .select('*').or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false });
    if (inboxError) { setError(inboxError.message); setLoading(false); return; }
    const rows = data || [];
    setConversations(rows);
    const productIds = [...new Set(rows.map(x => x.product_id).filter(Boolean))];
    const personIds = [...new Set(rows.flatMap(x => [x.buyer_id, x.seller_id]).filter(Boolean))];
    if (productIds.length) {
      const { data: ps } = await supabase.from('products').select('id,title,price,category,status').in('id', productIds);
      setProducts(Object.fromEntries((ps || []).map(x => [x.id, x])));
    }
    if (personIds.length) {
      const { data: us } = await supabase.from('profiles').select('id,full_name,email,role').in('id', personIds);
      setPeople(Object.fromEntries((us || []).map(x => [x.id, x])));
    }
    setLoading(false);
  };

  const openConversation = async (conversation) => {
    setActive(conversation); setError('');
    const [{ data: ms, error: me }, { data: os, error: oe }] = await Promise.all([
      supabase.from('messages').select('*').eq('conversation_id', conversation.id).order('created_at', { ascending: true }),
      supabase.from('price_offers').select('*').eq('conversation_id', conversation.id).order('created_at', { ascending: true })
    ]);
    if (me || oe) setError((me || oe).message);
    setMessages(ms || []); setOffers(os || []);
  };

  useEffect(() => { loadInbox(); }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    const begin = async () => {
      if (!initialProduct || !user?.id) return;
      if (initialProduct.seller_id === user.id) { setError('You cannot start a buyer conversation on your own listing. Open Messages to view buyer enquiries.'); return; }
      const { data, error: createError } = await supabase.from('conversations').upsert({
        product_id: initialProduct.id, buyer_id: user.id, seller_id: initialProduct.seller_id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'product_id,buyer_id' }).select().single();
      if (cancelled) return;
      if (createError) { setError(createError.message); return; }
      await loadInbox();
      if (!cancelled) await openConversation(data);
    };
    begin();
    return () => { cancelled = true; };
  }, [initialProduct?.id, user?.id]);

  useEffect(() => {
    if (!active?.id || !isSupabaseConfigured) return;
    const channel = supabase.channel(`ecotrack-conversation-${active.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active.id}` }, payload => {
        if (payload.eventType === 'INSERT') setMessages(current => current.some(x => x.id === payload.new.id) ? current : [...current, payload.new]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'price_offers', filter: `conversation_id=eq.${active.id}` }, payload => {
        if (payload.eventType === 'INSERT') setOffers(current => current.some(x => x.id === payload.new.id) ? current : [...current, payload.new]);
        if (payload.eventType === 'UPDATE') setOffers(current => current.map(x => x.id === payload.new.id ? payload.new : x));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [active?.id]);

  const sendText = async () => {
    const body = draft.trim();
    if (!body || !active) return;
    setDraft(''); // optimistic clear for instant UX
    setBusy(true); setError('');
    const { error: e } = await supabase
      .from('messages')
      .insert({ conversation_id: active.id, sender_id: user.id, body });
    if (e) {
      setError(e.message);
      setDraft(body); // restore on error
    } else {
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', active.id);
    }
    setBusy(false);
  };

  const submitOffer = async () => {
    const n = Number(amount);
    if (!active || !Number.isFinite(n) || n <= 0) {
      setError('Enter a valid offer amount (must be greater than 0).');
      return;
    }
    setBusy(true); setError('');
    const { error: e } = await supabase.from('price_offers').insert({
      conversation_id: active.id,
      sender_id: user.id,
      amount: n,
      status: 'pending',
    });
    if (e) setError(e.message);
    else {
      setAmount('');
      await openConversation(active);
    }
    setBusy(false);
  };

  const respondOffer = async (offer, action) => {
    let counter = null;
    if (action === 'counter') { counter = Number(amount); if (!Number.isFinite(counter) || counter <= 0) { setError('Enter a valid counteroffer amount first.'); return; } }
    setBusy(true); setError('');
    const { error: e } = await supabase.rpc('respond_to_price_offer', { p_offer_id: offer.id, p_action: action, p_counter_amount: counter });
    if (e) setError(e.message); else { setAmount(''); await openConversation(active); await loadInbox(); }
    setBusy(false);
  };

  const latestPending = [...offers].reverse().find(x => x.status === 'pending');
  const otherId = active ? (active.buyer_id === user.id ? active.seller_id : active.buyer_id) : null;
  const otherName = people[otherId]?.full_name || 'EcoTrack member';
  const product = active ? products[active.product_id] : null;
  const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`;

  return <div className="messages-overlay">
    <section className="messages-center">
      <header className="messages-topbar"><div><span className="messages-kicker">ECOTRACK CONNECT</span><h2><MessageCircle size={22}/> Messages</h2></div><button className="chat-close" onClick={onClose} aria-label="Close messages"><X/></button></header>
      {error && <div className="messages-error">{error}</div>}
      <div className="messages-layout">
        <aside className="messages-inbox"><div className="inbox-heading"><strong>Your conversations</strong><button onClick={loadInbox}>Refresh</button></div>
          {loading ? <p className="messages-empty">Loading conversations…</p> : conversations.length === 0 ? <p className="messages-empty">No conversations yet. Open a product and choose Start Negotiation to contact its seller.</p> : conversations.map(c => {
            const pid = c.product_id, other = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
            return <button key={c.id} className={`conversation-item ${active?.id === c.id ? 'selected' : ''}`} onClick={() => openConversation(c)}><span className="conversation-avatar">{(people[other]?.full_name || 'E').charAt(0).toUpperCase()}</span><span className="conversation-copy"><strong>{products[pid]?.title || 'Product conversation'}</strong><small>{people[other]?.full_name || 'EcoTrack member'}</small></span><span className="conversation-chevron">›</span></button>;
          })}
        </aside>
        <section className="messages-chat">
          {!active ? <div className="messages-placeholder"><MessageCircle size={42}/><h3>Select a conversation</h3><p>Choose a chat from your inbox to view messages and negotiate.</p></div> : <>
            <div className="messages-chat-head"><div><strong>{product?.title || 'Product discussion'}</strong><small>Chatting with {otherName} · {myRole}</small></div><span className="chat-product-price">{product ? fmt(product.price) : ''}</span></div>
            <div className="persistent-message-list">{messages.length === 0 && <p className="messages-empty">Say hello and start the conversation.</p>}{messages.map(m => <div key={m.id} className={`persistent-message ${m.sender_id === user.id ? 'mine' : ''}`}><p>{m.body}</p><time>{new Date(m.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</time></div>)}
              {offers.map(o => <div className={`persistent-offer ${o.sender_id === user.id ? 'mine' : ''}`} key={`offer-${o.id}`}><strong>{o.sender_id === user.id ? 'Your offer' : 'Offer received'} · {fmt(o.amount)}</strong><small>Status: {o.status}</small>
                {o.status === 'pending' && o.sender_id !== user.id && <div className="offer-controls">{myRole === 'seller' && active.seller_id === user.id && o.sender_id === active.buyer_id && <><button onClick={() => respondOffer(o, 'accept')} disabled={busy}>Accept</button><button className="decline" onClick={() => respondOffer(o, 'reject')} disabled={busy}>Reject</button><input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Counter ₹"/><button onClick={() => respondOffer(o, 'counter')} disabled={busy}>Counter</button></>}{myRole === 'buyer' && active.buyer_id === user.id && o.sender_id === active.seller_id && <><button onClick={() => respondOffer(o, 'accept')} disabled={busy}>Accept counter</button><button className="decline" onClick={() => respondOffer(o, 'reject')} disabled={busy}>Reject counter</button></>}{myRole === 'buyer' && active.buyer_id === user.id && o.sender_id === active.buyer_id && <span>Waiting for the seller's response.</span>}</div>}
                {o.status === 'pending' && o.sender_id === user.id && <small>Waiting for the other participant.</small>}
                {o.status === 'countered' && o.sender_id !== user.id && <div className="offer-controls"><button onClick={() => respondOffer(o, 'accept')} disabled={busy}>Accept counter</button><button className="decline" onClick={() => respondOffer(o, 'reject')} disabled={busy}>Reject</button></div>}
              </div>)}
              {active.final_price && <div className="deal-finalized">Deal agreed at {fmt(active.final_price)}. Continue to the payment stage.</div>}
            </div>
            <div className="messages-composer"><input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendText()} placeholder="Write a message…"/><button onClick={sendText} disabled={busy || !draft.trim()}><Send size={17}/> Send</button></div>
            <div className="offer-composer"><span>Make a price offer</span><input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount in ₹"/><button onClick={submitOffer} disabled={busy || !amount}>Send offer</button></div>
          </>}
        </section>
      </div>
    </section>
  </div>;
}


function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [liked, setLiked] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [globalError, setGlobalError] = useState('');
  const [notice, setNotice] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [dbProducts, setDbProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showListingModal, setShowListingModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showMessagesCenter, setShowMessagesCenter] = useState(false);
  const [messagesStartProduct, setMessagesStartProduct] = useState(null);
  const [showOrdersPanel, setShowOrdersPanel] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [negotiatingProduct, setNegotiatingProduct] = useState(null);

  // Negotiation state
  const [messages, setMessages] = useState(initialMessages);
  const [messageText, setMessageText] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [currentOffer, setCurrentOffer] = useState(null);
  const [negotiationStatus, setNegotiationStatus] = useState('ongoing');
  const [finalPrice, setFinalPrice] = useState(null);
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [viewerRole, setViewerRole] = useState('buyer');

  const [deliveryFee, setDeliveryFee] = useState(200);

  useEffect(() => {
    let mounted = true;

    // Enable smooth scrolling for anchor links
    document.documentElement.style.scrollBehavior = 'smooth';

    const loadProfile = async (user) => {
      if (!user) {
        if (mounted) setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Could not load profile:', error);
        return;
      }

      if (mounted) {
        setProfile(data);
        if (data?.role === 'buyer' || data?.role === 'seller') {
          setViewerRole(data.role);
        }
      }
    };

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data?.session ?? null);
      if (data?.session?.user) await loadProfile(data.session.user);
      if (mounted) setAuthLoading(false);
    }).catch((err) => {
      console.warn('Session check fallback:', err);
      if (mounted) setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      await loadProfile(nextSession?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const loadProducts = async () => {
    setProductsLoading(true);
    if (!isSupabaseConfigured) {
      setDbProducts(demoProducts);
      setProductsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(full_name)')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('Supabase products query failed, using fallback catalog:', error.message);
      setDbProducts(demoProducts);
    } else {
      const normalized = (data || []).map((item) => {
        const presentation = productPresentation(item.category);
        return {
          ...item,
          seller: item.profiles?.full_name || 'EcoTrack Seller',
          icon: presentation.icon,
          color: presentation.color,
          description: item.description || 'No description provided yet.',
          specs: item.specs || 'Specifications not provided',
        };
      });
      setDbProducts(normalized);
    }
    setProductsLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  /** Load orders for the current user from the orders table */
  const loadOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !session?.user) return;
    setOrdersLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title, category)')
      .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Could not load orders:', error.message);
    } else {
      setOrders(data || []);
    }
    setOrdersLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user && isSupabaseConfigured) loadOrders();
  }, [session?.user?.id, loadOrders]);

  /** Create an escrow order using the server-side RPC (prevents race conditions) */
  const createEscrowOrder = async (product, agreedPrice, currentDeliveryFee) => {
    if (!isSupabaseConfigured) {
      // Demo mode: simulate order placement
      setPaymentDone(true);
      setNotice('Order initiated! Product marked for delivery escrow. (Demo mode — no real payment)');
      return;
    }
    if (!session?.user) {
      setGlobalError('Please log in to place an order.');
      return;
    }
    try {
      const { data, error } = await supabase.rpc('create_escrow_order', {
        p_product_id: product.id,
        p_agreed_price: agreedPrice,
        p_delivery_fee: currentDeliveryFee,
        p_delivery_address: profile?.location || null,
      });
      if (error) throw error;
      setPaymentDone(true);
      setNotice(`Order ${data.order_number} placed! Total: ${formatPrice(data.total_paid)}. Funds held in escrow.`);
      // Refresh products so status changes from 'available' to 'reserved'
      loadProducts();
      loadOrders();
    } catch (err) {
      setGlobalError(err.message || 'Could not create order. Please try again.');
    }
  };

  /** Delete a product listing (seller only) */
  const deleteProduct = async (productId) => {
    if (!isSupabaseConfigured) {
      setDbProducts(current => current.filter(p => p.id !== productId));
      setNotice('Listing removed. (Demo mode)');
      return;
    }
    if (!session?.user) return;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', session.user.id);
    if (error) {
      setGlobalError(error.message);
    } else {
      setNotice('Listing deleted.');
      loadProducts();
    }
  };

  /** Mark order as buyer-approved upon delivery receipt */
  const markBuyerApproved = async (order) => {
    if (!isSupabaseConfigured || !session?.user) return;
    if (order.buyer_id !== session.user.id) {
      setGlobalError('Only the buyer can approve a delivery.');
      return;
    }
    const { error } = await supabase
      .from('orders')
      .update({ buyer_approved: true, status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', order.id);
    if (error) setGlobalError(error.message);
    else {
      setNotice('Delivery approved! Seller payout will be released.');
      loadOrders();
    }
  };

  const handleAuthenticated = async (user) => {
    if (!isSupabaseConfigured) {
      const demoRole = user.user_metadata?.role;
      // In demo mode, only allow 'buyer' or 'seller' - never 'admin'
      const safeRole = (demoRole === 'buyer' || demoRole === 'seller') ? demoRole : 'buyer';
      const mockProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || 'Demo User',
        email: user.email || 'user@example.com',
        phone: user.user_metadata?.phone || '',
        location: user.user_metadata?.location || 'Patiala, Punjab',
        role: safeRole,
      };
      setProfile(mockProfile);
      setSession({ user });
      setViewerRole(mockProfile.role);
      setShowAuthModal(false);
      setNotice(`Signed in as ${mockProfile.full_name} (${mockProfile.role})`);
      return;
    }

    let { data: existingProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (!existingProfile) {
      const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'EcoTrack User';
      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: fallbackName,
          email: user.email || '',
          phone: user.user_metadata?.phone || null,
          location: user.user_metadata?.location || null,
          role: user.user_metadata?.role === 'seller' ? 'seller' : 'buyer',
        })
        .select()
        .single();

      if (createError) throw createError;
      existingProfile = createdProfile;
    }

    setProfile(existingProfile);
    setSession((current) => current || { user });
    if (existingProfile.role === 'buyer' || existingProfile.role === 'seller') {
      setViewerRole(existingProfile.role);
    }
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setSession(null);
      setProfile(null);
      setShowAdminDashboard(false);
      setShowOrdersPanel(false);
      setOrders([]);
      setViewerRole('buyer');
      setNotice('Logged out successfully.');
    } catch (err) {
      setGlobalError(err.message || 'Error signing out.');
    }
  };

  const filteredProducts = useMemo(() => {
    const list = dbProducts.filter((product) => {
      const matchesCategory =
        category === 'All' || product.category === category;

      const text = `${product.title || ''} ${product.location || ''} ${product.category || ''} ${product.seller || ''}`
        .toLowerCase();

      return matchesCategory && text.includes(query.toLowerCase());
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    return list;
  }, [dbProducts, query, category, sortBy]);

  const toggleLike = (id) => {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const closeDetails = () => {
    setSelectedProduct(null);
  };

  const resetNegotiation = () => {
    setMessages(initialMessages);
    setMessageText('');
    setOfferAmount('');
    setCurrentOffer(null);
    setNegotiationStatus('ongoing');
    setFinalPrice(null);
    setShowPaymentPreview(false);
    setViewerRole('buyer');
  };

  const startNegotiation = (product) => {
    closeDetails();
    if (isSupabaseConfigured && session?.user) {
      if (product.seller_id === session.user.id) {
        setGlobalError('You cannot negotiate on your own listing.');
        return;
      }
      setMessagesStartProduct(product);
      setShowMessagesCenter(true);
    } else {
      resetNegotiation();
      setPaymentDone(false);
      setNegotiatingProduct(product);
    }
  };

  const closeNegotiation = () => {
    setNegotiatingProduct(null);
    setShowPaymentPreview(false);
  };

  const sendMessage = () => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage) return;

    const newMessage = {
      id: Date.now(),
      sender: viewerRole,
      text: trimmedMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      type: 'text'
    };

    setMessages((current) => [...current, newMessage]);
    setMessageText('');
  };

  const sendOffer = () => {
    if (viewerRole !== 'buyer') {
      setGlobalError('Only the buyer can send a new price offer. Switch your view to "Buyer" above.');
      return;
    }

    const amount = Number(offerAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setGlobalError('Please enter a valid offer amount (must be greater than ₹0).');
      return;
    }

    if (!negotiatingProduct) return;

    const newOffer = {
      id: Date.now(),
      sender: 'buyer',
      amount,
      status: 'pending'
    };

    setCurrentOffer(newOffer);
    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        sender: 'buyer',
        type: 'offer',
        amount,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
    setOfferAmount('');
  };

  const acceptOffer = () => {
    if (!currentOffer) return;

    setFinalPrice(currentOffer.amount);
    setNegotiationStatus('accepted');

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'seller',
        type: 'system',
        text: `Offer accepted. Final agreed price: ${formatPrice(
          currentOffer.amount
        )}.`,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
  };

  const rejectOffer = () => {
    if (!currentOffer) return;

    setCurrentOffer((current) =>
      current ? { ...current, status: 'rejected' } : null
    );

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'seller',
        type: 'system',
        text: 'The current offer was declined. You can make another offer.',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
  };

  const counterOffer = () => {
    if (viewerRole !== 'buyer') {
      setGlobalError('Switch to "Buyer" view above to request a counteroffer.');
      return;
    }

    if (!negotiatingProduct) return;

    const counterAmount = Math.round(
      negotiatingProduct.price * 0.95
    );

    setCurrentOffer({
      id: Date.now(),
      sender: 'seller',
      amount: counterAmount,
      status: 'countered'
    });

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        sender: 'seller',
        type: 'offer',
        amount: counterAmount,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
  };

  const acceptCounterOffer = () => {
    if (!currentOffer) return;

    setFinalPrice(currentOffer.amount);
    setNegotiationStatus('accepted');

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: 'buyer',
        type: 'system',
        text: `Counteroffer accepted. Final agreed price: ${formatPrice(
          currentOffer.amount
        )}.`,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);
  };

  const handleSellClick = () => {
    setMobileOpen(false);
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    if (profile?.role === 'buyer') {
      setGlobalError('Your current account is registered as a Buyer. To list items for sale, please sign in with or register a Seller account.');
      return;
    }
    setEditingProduct(null);
    setShowListingModal(true);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'inherit' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="brand-mark" style={{ margin: '0 auto 12px' }}><Recycle size={22} /></div>
          <strong>Loading EcoTrack...</strong>
        </div>
      </div>
    );
  }

  // Show the admin dashboard as a separate full-screen view.
  // Guard: only admin-role profiles may access this.
  if (showAdminDashboard) {
    if (!session || !profile || profile.role !== 'admin') {
      setShowAdminDashboard(false);
      return null;
    }
    return (
      <AdminDashboard
        onBack={() => setShowAdminDashboard(false)}
      />
    );
  }

  const paymentAmount = finalPrice ?? 0;
  const buyerDeliveryShare = deliveryFee / 2;
  const platformFee = 11;
  const buyerTotal = paymentAmount + buyerDeliveryShare + platformFee;
  const sellerPayout = Math.max(0,
    paymentAmount - buyerDeliveryShare - platformFee
  );
  const negativePayout = (paymentAmount - buyerDeliveryShare - platformFee) < 0;

  return (
    <div className="app-shell">
      {/* Accessibility: skip to main content */}
      <a className="skip-link" href="#marketplace">Skip to marketplace</a>

      {/* NAVBAR */}
      <header className="navbar">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <Recycle size={22} />
          </span>
          <span>
            Eco<span className="brand-accent">Track</span>
          </span>
        </a>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

        <nav className={mobileOpen ? 'nav-links open' : 'nav-links'}>
          <a href="#marketplace" onClick={() => setMobileOpen(false)}>
            Marketplace
          </a>
          <a href="#how-it-works" onClick={() => setMobileOpen(false)}>
            How it works
          </a>
          <a href="#impact" onClick={() => setMobileOpen(false)}>
            Our impact
          </a>
          {session && <button className="messages-nav-button" type="button" onClick={() => { setMobileOpen(false); setMessagesStartProduct(null); setShowMessagesCenter(true); }}><MessageCircle size={17}/> Messages</button>}
          {session && <button className="messages-nav-button" type="button" onClick={() => { setMobileOpen(false); setShowOrdersPanel(true); loadOrders(); }}><ShoppingCart size={17}/> Orders</button>}
          <button
            className="nav-sell"
            type="button"
            onClick={handleSellClick}
          >
            <Plus size={17} />
            Sell an item
          </button>
          {session && profile?.role === 'admin' && (
            <button
              className="admin-nav-button"
              onClick={() => {
                setMobileOpen(false);
                setShowAdminDashboard(true);
              }}
            >
              <LayoutDashboard size={17} />
              Admin
            </button>
          )}

          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="login-button" style={{ cursor: 'default' }}>
                <User size={17} />
                {profile?.full_name || session.user?.email?.split('@')[0] || 'Account'}
              </span>
              <button className="login-button" onClick={handleLogout}>
                <LogOut size={15} />
                Log out
              </button>
            </div>
          ) : (
            <button className="login-button" onClick={() => setShowAuthModal(true)}>
              <User size={17} />
              Log in / Sign up
            </button>
          )}
        </nav>
      </header>

      {!isSupabaseConfigured && (
        <div className="demo-banner">
          <span>⚡ <strong>Interactive Preview Mode:</strong> Running with local demo catalog &amp; in-memory simulation. Add credentials to <code>.env.local</code> to connect live Supabase backend.</span>
        </div>
      )}

      {globalError && (
        <div className="alert error">
          <span>{globalError}</span>
          <button onClick={() => setGlobalError('')} aria-label="Dismiss error"><X size={16} /></button>
        </div>
      )}

      {notice && (
        <div className="alert success">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={16} /></button>
        </div>
      )}

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A smarter way to give tech a second life
            </div>

            <h1>
              Give your old tech
              <br />
              <span>
                a new <em>purpose.</em>
              </span>
            </h1>

            <p>
              Buy, sell, and reuse electronics with people around you.
              EcoTrack makes responsible e-waste exchange simple,
              transparent, and rewarding.
            </p>

            <div className="hero-actions">
              <a href="#marketplace" className="primary-button">
                Explore marketplace
                <ArrowRight size={18} />
              </a>
              <button
                type="button"
                className="secondary-button"
                onClick={handleSellClick}
              >
                <Plus size={18} />
                List your e-waste
              </button>
            </div>

            <div className="trust-row">
              <div className="avatars">
                <span>R</span>
                <span>A</span>
                <span>N</span>
                <span>+</span>
              </div>
              <div>
                <strong>Built for conscious communities</strong>
                <small>Reuse more. Waste less.</small>
              </div>
            </div>
          </div>

          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="device-card laptop-card">
              <div className="device-top">
                <span className="tiny-label">FEATURED DROP</span>
                <span className="status-pill">● Available</span>
              </div>
              <div className="device-emoji">💻</div>
              <div className="device-info">
                <h3>MacBook Air M1</h3>
                <p>8GB RAM · 256GB SSD</p>
                <div>
                  <strong>₹42,000</strong>
                  <span>Good condition</span>
                </div>
              </div>
            </div>

            <div className="floating-card impact-card">
              <span className="floating-icon">♻</span>
              <div>
                <strong>2,480+</strong>
                <small>Devices recirculated</small>
              </div>
            </div>

            <div className="floating-card location-card">
              <MapPin size={17} />
              <div>
                <strong>Find nearby</strong>
                <small>Trusted local sellers</small>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="stats-strip" id="impact">
          <div>
            <strong>100%</strong>
            <span>Community-driven</span>
          </div>
          <div>
            <strong>6+</strong>
            <span>Device categories</span>
          </div>
          <div>
            <strong>₹11</strong>
            <span>Simple platform fee</span>
          </div>
          <div>
            <strong>1 goal</strong>
            <span>Less e-waste</span>
          </div>
        </section>

        {/* MARKETPLACE */}
        <section className="market-section" id="marketplace">
          <div className="section-heading">
            <div>
              <div className="section-kicker">DISCOVER & REUSE</div>
              <h2>
                Find your next <span>tech treasure.</span>
              </h2>
              <p>
                Explore pre-owned electronics from people in your community.
              </p>
            </div>

            <a href="#marketplace" className="text-link">
              View all listings
              <ArrowRight size={17} />
            </a>
          </div>

          <div className="search-row">
            <div className="search-box">
              <Search size={20} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search laptops, phones, monitors..."
              />
            </div>

            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item}
                  className={
                    category === item ? 'category active' : 'category'
                  }
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="sort-box">
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort listings"
              >
                <option value="newest">Sort: Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {productsLoading ? (
            <div className="empty-state">Loading live listings from EcoTrack...</div>
          ) : (
            <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className={`product-visual ${product.color}`}>
                  <span className="condition-tag">{product.condition}</span>

                  <button
                    className="like-button"
                    onClick={() => toggleLike(product.id)}
                    aria-label="Save listing"
                  >
                    <Heart
                      size={18}
                      fill={
                        liked.includes(product.id) ? 'currentColor' : 'none'
                      }
                    />
                  </button>

                  <div className="product-icon">{product.icon}</div>
                </div>

                <div className="product-content">
                  <div className="product-category">{product.category}</div>
                  <h3>{product.title}</h3>

                  <div className="product-meta">
                    <MapPin size={14} />
                    {product.location}
                  </div>

                  <div className="product-bottom">
                    <div>
                      <strong>{formatPrice(product.price)}</strong>
                      <small>Seller: {product.seller}</small>
                    </div>

                    <button
                      className="chat-button"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View Details
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            </div>
          )}

          {!productsLoading && filteredProducts.length === 0 && (
            <div className="empty-state">
              No live listings match your search. Sellers can add the first listing using "Sell an item".
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <div className="section-kicker">SIMPLE BY DESIGN</div>
          <h2>
            From unused to <span>useful.</span>
          </h2>
          <p className="section-intro">
            A straightforward way to keep electronics in use for longer.
          </p>

          <div className="steps">
            <div className="step">
              <div className="step-icon">
                <Plus />
              </div>
              <span>01</span>
              <h3>List your device</h3>
              <p>Add photos, specs, condition, and your asking price.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <MessageCircle />
              </div>
              <span>02</span>
              <h3>Connect & agree</h3>
              <p>Chat with interested buyers and finalize the deal.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <Truck />
              </div>
              <span>03</span>
              <h3>We manage delivery</h3>
              <p>Pay securely and track the delivery through EcoTrack.</p>
            </div>

            <div className="step">
              <div className="step-icon">
                <ShieldCheck />
              </div>
              <span>04</span>
              <h3>Verify & complete</h3>
              <p>Approve the product after delivery and release the seller payout.</p>
            </div>
          </div>
        </section>

        {/* SELL BANNER */}
        <section className="sell-banner" id="sell">
          <div>
            <div className="section-kicker">HAVE UNUSED TECH?</div>
            <h2>
              Someone out there
              <br />
              needs what you have.
            </h2>
            <p>
              Turn your unused electronics into value while helping reduce
              e-waste.
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={handleSellClick}
          >
            Start selling
            <ArrowRight size={18} />
          </button>
        </section>

        {/* PRODUCT DETAILS MODAL */}
        {selectedProduct && (
          <div className="modal-overlay" onClick={closeDetails}>
            <div
              className="product-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={closeDetails}
                aria-label="Close details"
              >
                <X size={20} />
              </button>

              <div className={`product-visual ${selectedProduct.color}`}>
                <div className="product-icon">{selectedProduct.icon}</div>
              </div>

              <div className="modal-content">
                <div className="product-category">
                  {selectedProduct.category}
                </div>

                <h2>{selectedProduct.title}</h2>
                <h3>{formatPrice(selectedProduct.price)}</h3>

                <div className="modal-detail">
                  <Tag size={17} />
                  <span>
                    <strong>Condition:</strong> {selectedProduct.condition}
                  </span>
                </div>

                <div className="modal-detail">
                  <MapPin size={17} />
                  <span>
                    <strong>Location:</strong> {selectedProduct.location}
                  </span>
                </div>

                <div className="modal-detail">
                  <User size={17} />
                  <span>
                    <strong>Seller:</strong> {selectedProduct.seller}
                  </span>
                </div>

                <div className="modal-detail">
                  <Package size={17} />
                  <span>
                    <strong>Specifications:</strong> {selectedProduct.specs}
                  </span>
                </div>

                <p className="modal-description">
                  {selectedProduct.description}
                </p>

                {/* Buyer action: Start Negotiation */}
                {(!session || !profile || selectedProduct.seller_id !== profile.id) ? (
                  <button
                    className="primary-button modal-action"
                    onClick={() => startNegotiation(selectedProduct)}
                  >
                    <MessageCircle size={18} />
                    Start Negotiation
                  </button>
                ) : (
                  /* Seller controls for own listing: Edit and Delete */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <button
                      className="primary-button modal-action"
                      onClick={() => {
                        const target = selectedProduct;
                        closeDetails();
                        setEditingProduct(target);
                        setShowListingModal(true);
                      }}
                    >
                      <Plus size={16} />
                      Edit this listing
                    </button>
                    <button
                      className="secondary-button modal-action"
                      style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fecaca' }}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this listing?')) {
                          deleteProduct(selectedProduct.id);
                          closeDetails();
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Delete this listing
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CHAT AND NEGOTIATION MODAL */}
        {negotiatingProduct && (
          <div className="modal-overlay chat-overlay">
            <div
              className="chat-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* CHAT HEADER */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <button
                    className="back-button"
                    onClick={closeNegotiation}
                    aria-label="Close chat"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <div className="seller-avatar">
                    {negotiatingProduct.seller.charAt(0)}
                  </div>

                  <div>
                    <h2>{negotiatingProduct.seller}</h2>
                    <span>
                      <span className="online-dot" />
                      Seller · EcoTrack
                    </span>
                  </div>
                </div>

                <button
                  className="chat-close"
                  onClick={closeNegotiation}
                  aria-label="Close negotiation"
                >
                  <X size={21} />
                </button>
              </div>

              {/* DEMO ROLE SWITCH
                  In the production version this will come from the logged-in user. */}
              <div className="role-switch">
                <span>Viewing as:</span>
                <button
                  className={viewerRole === 'buyer' ? 'role-button active' : 'role-button'}
                  onClick={() => setViewerRole('buyer')}
                >
                  Buyer
                </button>
                <button
                  className={viewerRole === 'seller' ? 'role-button active' : 'role-button'}
                  onClick={() => setViewerRole('seller')}
                >
                  Seller
                </button>
              </div>

              {/* PRODUCT SUMMARY */}
              <div className="chat-product-summary">
                <div className={`mini-product-icon ${negotiatingProduct.color}`}>
                  {negotiatingProduct.icon}
                </div>

                <div className="chat-product-info">
                  <strong>{negotiatingProduct.title}</strong>
                  <span>Listed price: {formatPrice(negotiatingProduct.price)}</span>
                </div>

                <div className="chat-product-status">
                  <span>●</span> Available
                </div>
              </div>

              {/* NEGOTIATION STATUS */}
              <div className="negotiation-status-bar">
                <div className="status-label">
                  <span className="status-icon">
                    {negotiationStatus === 'accepted' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </span>

                  <div>
                    <strong>
                      {negotiationStatus === 'accepted'
                        ? 'Deal finalized'
                        : 'Negotiation in progress'}
                    </strong>
                    <small>
                      {negotiationStatus === 'accepted'
                        ? `Agreed price: ${formatPrice(finalPrice)}`
                        : 'Discuss the price and product details'}
                    </small>
                  </div>
                </div>

                {negotiationStatus === 'accepted' && (
                  <span className="agreed-badge">Agreed</span>
                )}
              </div>

              {/* MESSAGES */}
              <div className="messages-area">
                <div className="date-divider">
                  <span>Today</span>
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-row ${
                      message.sender === 'buyer' ? 'buyer-row' : 'seller-row'
                    } ${message.type === 'system' ? 'system-row' : ''}`}
                  >
                    {message.type === 'system' ? (
                      <div className="system-message">
                        <CheckCircle size={15} />
                        {message.text}
                      </div>
                    ) : message.type === 'offer' ? (
                      <div className="offer-message">
                        <div className="offer-heading">
                          <Wallet size={18} />
                          <strong>
                            {message.sender === 'buyer'
                              ? 'Your price offer'
                              : 'Seller counteroffer'}
                          </strong>
                        </div>

                        <div className="offer-amount">
                          {formatPrice(message.amount)}
                        </div>

                        <span className="offer-caption">
                          {message.sender === 'buyer'
                            ? 'Proposed purchase price'
                            : 'Seller proposed price'}
                        </span>

                        <span className="message-time">{message.time}</span>
                      </div>
                    ) : (
                      <div className="message-bubble">
                        <p>{message.text}</p>
                        <span className="message-time">
                          {message.time}
                          {message.sender === 'buyer' && (
                            <Check size={14} />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {negotiationStatus === 'accepted' && (
                  <div className="deal-complete-card">
                    <CheckCircle size={24} />
                    <h3>Price finalized!</h3>
                    <strong>{formatPrice(finalPrice)}</strong>
                    <p>
                      Both parties can now proceed to the payment and delivery
                      stage.
                    </p>
                    <button
                      className="primary-button"
                      onClick={() => setShowPaymentPreview(true)}
                    >
                      Continue to payment
                      <ArrowRight size={17} />
                    </button>
                  </div>
                )}
              </div>

              {/* OFFER ACTIONS */}
              {negotiationStatus !== 'accepted' && (
                <div className="negotiation-actions">
                  {viewerRole === 'seller' && (
                    <p className="seller-only-note">Seller controls: accept or reject buyer offers above.</p>
                  )}

                  <div className="offer-input-row">
                    <div className="offer-input">
                      <IndianRupee size={16} />
                      <input
                        type="number"
                        min="1"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="Enter your offer"
                      />
                    </div>

                    <button
                      className="send-offer-button"
                      onClick={sendOffer}
                      disabled={viewerRole !== 'buyer'}
                    >
                      Send offer
                    </button>
                  </div>

                  {currentOffer && currentOffer.status !== 'rejected' && (
                    <div className="offer-decision">
                      <div>
                        <small>
                          {currentOffer.sender === 'buyer'
                            ? 'Latest buyer offer'
                            : 'Latest seller counteroffer'}
                        </small>
                        <strong>{formatPrice(currentOffer.amount)}</strong>
                        <span className="offer-caption">
                          Status: {currentOffer.status}
                        </span>
                      </div>

                      {viewerRole === 'seller' && currentOffer.sender === 'buyer' && (
                        <div className="offer-decision-buttons">
                          <button
                            className="accept-button"
                            onClick={acceptOffer}
                            disabled={negotiationStatus === 'accepted'}
                          >
                            <Check size={15} />
                            Accept
                          </button>

                          <button
                            className="reject-button"
                            onClick={rejectOffer}
                            disabled={negotiationStatus === 'accepted'}
                          >
                            <XCircle size={15} />
                            Reject
                          </button>
                        </div>
                      )}

                      {viewerRole === 'buyer' && currentOffer.sender === 'buyer' && (
                        <span className="buyer-note">
                          Waiting for the seller to accept or reject this offer.
                        </span>
                      )}

                      {viewerRole === 'buyer' && currentOffer.sender === 'seller' && (
                        <div className="offer-decision-buttons">
                          <button
                            className="accept-button"
                            onClick={acceptCounterOffer}
                            disabled={negotiationStatus === 'accepted'}
                          >
                            <Check size={15} />
                            Accept counter
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {viewerRole === 'buyer' && (
                    <button
                      className="counter-button"
                      onClick={counterOffer}
                    >
                      <RefreshCw size={15} />
                      Ask seller for a counteroffer
                    </button>
                  )}
                </div>
              )}

              {/* MESSAGE INPUT */}
              {negotiationStatus !== 'accepted' && (
                <div className="message-input-area">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage();
                    }}
                    placeholder="Write a message..."
                  />

                  <button
                    className="send-message-button"
                    onClick={sendMessage}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              )}

              {/* PAYMENT PREVIEW */}
              {showPaymentPreview && finalPrice !== null && (
                <div
                  className="payment-overlay"
                  onClick={() => setShowPaymentPreview(false)}
                >
                  <div
                    className="payment-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="modal-close"
                      onClick={() => setShowPaymentPreview(false)}
                    >
                      <X size={20} />
                    </button>

                    <div className="payment-icon">
                      <Wallet size={28} />
                    </div>

                    <div className="section-kicker">PAYMENT SUMMARY</div>
                    <h2>Review your order</h2>
                    <p className="payment-subtitle">
                      This is a payment preview. No real money will be charged.
                    </p>

                    <div className="payment-product">
                      <span>{negotiatingProduct.title}</span>
                      <strong>{formatPrice(finalPrice)}</strong>
                    </div>

                    <div className="payment-lines">
                      <div>
                        <span>Finalized product price</span>
                        <strong>{formatPrice(finalPrice)}</strong>
                      </div>
                      <div>
                        <span>50% delivery fee</span>
                        <strong>{formatPrice(buyerDeliveryShare)}</strong>
                      </div>
                      <div>
                        <span>EcoTrack development fee</span>
                        <strong>{formatPrice(platformFee)}</strong>
                      </div>
                    </div>

                    <div className="delivery-edit">
                      <label htmlFor="delivery-fee">
                        Estimated total delivery fee
                      </label>
                      <div className="delivery-input">
                        <IndianRupee size={16} />
                        <input
                          id="delivery-fee"
                          type="number"
                          min="0"
                          max="5000"
                          value={deliveryFee}
                          onChange={(e) =>
                            setDeliveryFee(clamp(Math.round(Number(e.target.value) || 0), 0, 5000))
                          }
                        />
                      </div>
                      <small>
                        The buyer pays half of the delivery fee (capped at ₹5,000).
                      </small>
                    </div>

                    <div className="payment-total">
                      <span>Total payable by buyer</span>
                      <strong>{formatPrice(buyerTotal)}</strong>
                    </div>

                    <div className="seller-payout-preview">
                      <div>
                        <span>Estimated seller payout</span>
                        <strong>{formatPrice(sellerPayout)}</strong>
                      </div>
                      <small>
                        Includes deduction of half the delivery fee and ₹11
                        platform fee, as specified in your current prototype.
                      </small>
                      {negativePayout && (
                        <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertTriangle size={14} />
                          Warning: Product price is too low to cover fees. Seller payout is ₹0.
                        </div>
                      )}
                    </div>

                    {paymentDone ? (
                      <div style={{ textAlign: 'center', padding: '16px 0', color: '#16a34a' }}>
                        <CheckCircle size={36} style={{ margin: '0 auto 8px', color: '#16a34a' }} />
                        <h3 style={{ margin: '0 0 6px', color: '#15803d' }}>Order Placed Successfully!</h3>
                        <p style={{ margin: 0, fontSize: 13, color: '#4b5563' }}>
                          Delivery order initiated. Funds held securely in escrow until received & approved.
                        </p>
                      </div>
                    ) : (
                      <button
                        className="primary-button modal-action"
                        onClick={() => {
                          createEscrowOrder(negotiatingProduct, finalPrice, deliveryFee);
                        }}
                      >
                        Confirm & Place Order
                        <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showListingModal && session && profile && (
        <ListingModal
          profile={profile}
          editingProduct={editingProduct}
          onClose={() => {
            setShowListingModal(false);
            setEditingProduct(null);
          }}
          onCreated={(savedProduct, isEdit) => {
            if (isEdit && savedProduct) {
              setDbProducts((current) =>
                current.map((p) => (p.id === savedProduct.id ? { ...p, ...savedProduct } : p))
              );
              setNotice(`Listing "${savedProduct.title}" updated successfully!`);
            } else if (savedProduct) {
              setDbProducts((current) => [savedProduct, ...current]);
              setNotice(`Listing "${savedProduct.title}" created successfully!`);
            } else {
              loadProducts();
            }
            setEditingProduct(null);
          }}
        />
      )}

      {showMessagesCenter && session?.user && profile && <MessagesCenter user={session.user} profile={profile} initialProduct={messagesStartProduct} onClose={() => { setShowMessagesCenter(false); setMessagesStartProduct(null); }} />}

      {/* ORDERS PANEL */}
      {showOrdersPanel && session && (
        <div className="messages-overlay">
          <section className="messages-center">
            <header className="messages-topbar">
              <div>
                <span className="messages-kicker">ECOTRACK ORDERS</span>
                <h2><ShoppingCart size={22}/> My Orders</h2>
              </div>
              <button className="chat-close" onClick={() => setShowOrdersPanel(false)} aria-label="Close orders"><X/></button>
            </header>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {ordersLoading ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px 0' }}>Loading orders…</p>
              ) : !isSupabaseConfigured ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <ShoppingCart size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <h3 style={{ margin: '0 0 6px', color: '#334155' }}>Orders require database</h3>
                  <p style={{ fontSize: 13 }}>Connect Supabase in <code>.env.local</code> to use the orders system. Demo mode uses simulated order placement only.</p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <h3 style={{ margin: '0 0 6px', color: '#334155' }}>No orders yet</h3>
                  <p style={{ fontSize: 13 }}>Orders will appear here after you place or receive one.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.map(order => {
                    const isBuyer = order.buyer_id === session.user.id;
                    const statusColors = {
                      awaiting_payment: '#d97706',
                      escrow_held: '#2563eb',
                      shipped: '#7c3aed',
                      delivered: '#059669',
                      approved: '#16a34a',
                      completed: '#16a34a',
                      cancelled: '#dc2626',
                      disputed: '#dc2626',
                    };
                    return (
                      <div key={order.id} style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '16px 18px',
                        fontSize: 14,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <strong style={{ fontSize: 15 }}>{order.products?.title || 'Product'}</strong>
                            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                              {order.order_number} · {isBuyer ? 'You are the buyer' : 'You are the seller'}
                            </div>
                          </div>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            color: '#fff',
                            background: statusColors[order.status] || '#64748b',
                            textTransform: 'capitalize',
                          }}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 13, color: '#475569' }}>
                          <div><small style={{ color: '#94a3b8', display: 'block' }}>Total paid</small><strong>{formatPrice(order.total_paid)}</strong></div>
                          <div><small style={{ color: '#94a3b8', display: 'block' }}>Seller payout</small><strong>{formatPrice(order.seller_payout)}</strong></div>
                          <div><small style={{ color: '#94a3b8', display: 'block' }}>Platform fee</small><strong>{formatPrice(order.platform_fee)}</strong></div>
                        </div>
                        {isBuyer && order.status === 'delivered' && !order.buyer_approved && (
                          <button
                            className="primary-button"
                            style={{ marginTop: 12, width: '100%', justifyContent: 'center', fontSize: 13 }}
                            onClick={() => markBuyerApproved(order)}
                          >
                            <CheckCircle size={16} />
                            Approve Delivery & Release Payout
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showAuthModal && !authLoading && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <a className="brand" href="#top">
            <span className="brand-mark">
              <Recycle size={20} />
            </span>
            <span>
              Eco<span className="brand-accent">Track</span>
            </span>
          </a>
          <nav className="footer-links">
            <a href="#marketplace">Marketplace</a>
            <a href="#how-it-works">How it works</a>
            <a href="#impact">Impact</a>
            <a href="#sell">Sell</a>
          </nav>
        </div>
        <p>Building a more circular future, one device at a time.</p>
        <span>© 2026 EcoTrack · Sustainable Electronics Marketplace</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);