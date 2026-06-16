import toast, { Toaster } from 'react-hot-toast'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
  useMap
} from 'react-leaflet'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js'
import { Car, MapPin, Shield, Moon, Sun, CreditCard, Activity, Users, ParkingCircle, LogOut } from 'lucide-react'
import { api, API_URL } from './api'
import './styles/index.css'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend)

const AuthContext = createContext(null)
const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const loadMe = async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }
    try { const { data } = await api.get('/users/me'); setUser(data) } catch { localStorage.clear(); setUser(null) }
    setLoading(false)
  }
  useEffect(() => { loadMe() }, [])
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    await loadMe()
  }
  const logout = () => { localStorage.clear(); setUser(null) }
  return <AuthContext.Provider value={{ user, loading, login, logout, reload: loadMe }}>{children}</AuthContext.Provider>
}

function Protected({ children, admin=false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-10">Загрузка...</div>
  if (!user) return <Navigate to="/login" />
  if (admin && !['ADMIN','MODERATOR'].includes(user.role)) return <Navigate to="/" />
  return children
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark')
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark':'light') }, [dark])
  return <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-black text-xl">
  <ParkingCircle className="text-blue-600"/>
  AlmaParking
</Link>
        <div className="hidden md:flex gap-5 text-sm font-medium">
<Link to="/">Главная</Link>

<Link to="/map">
  Карта
</Link>

<Link to="/profile">
  Кабинет
</Link>
<Link to="/payment-demo">
  Оплата
</Link>
{
  user &&
  ['ADMIN','MODERATOR'].includes(user.role) && (
    <Link to="/monitoring">
      Мониторинг
    </Link>
  )
}
{
  user &&
  ['ADMIN','MODERATOR'].includes(user.role) && (
    <Link to="/cameras">
      Камеры
    </Link>
  )
}

{
  user &&
  ['ADMIN','MODERATOR'].includes(user.role) && (
    <Link to="/analytics">
      Аналитика
    </Link>
  )
}

{
  user &&
  ['ADMIN','MODERATOR'].includes(user.role) && (
    <Link to="/violations">
      Нарушения
    </Link>
  )
}
{
  user &&
  ['ADMIN','MODERATOR'].includes(user.role) && (
    <Link to="/admin">
      Админ
    </Link>
  )
}        </div>
        <div className="flex gap-2 items-center">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">{dark ? <Sun/>:<Moon/>}</button>
{user ? (
  <div className="flex items-center gap-3">

    <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">

      {user.avatar ? (
        <img
          src={user.avatar}
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-500"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black">
          {user.first_name?.[0] || 'U'}
        </div>
      )}

      <span className="hidden md:block font-bold">
        {user.first_name}
      </span>

    </Link>

    <button
      onClick={logout}
      className="px-3 py-2 rounded-xl bg-red-600 text-white flex gap-1"
    >
      <LogOut size={18}/>
      Выйти
    </button>

  </div>
) : (
  <Link to="/login" className="px-4 py-2 rounded-xl bg-blue-600 text-white">
    Войти
  </Link>
)}        </div>
      </div>
    </nav>
    {children}
    <footer className="border-t border-slate-200 dark:border-slate-800 mt-16 py-8 text-center text-sm text-slate-500">
  AlmaParking Urban Control System · Almaty · 2026
</footer>
  </div>
}

function Home() {
  return <Layout><section className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-10 items-center">
    <div>
      <div className="inline-flex gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 text-sm mb-4"><Activity size={16}/> Realtime city parking</div>
      <h1 className="text-5xl md:text-7xl font-black leading-tight">Умная система управления парковками Алматы</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mt-5">Карта, бронирование, демо-оплата, QR-билет, админ-панель, аналитика и мониторинг мест в реальном времени.</p>
      <div className="flex gap-3 mt-8"><Link to="/map" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold">Найти парковку</Link><Link to="/register" className="px-6 py-3 bg-slate-200 dark:bg-slate-800 rounded-2xl font-bold">Регистрация</Link></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {[['120+','мест'],['5','зон'],['24/7','мониторинг'],['JWT','защита']].map(x=><div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow"><b className="text-2xl">{x[0]}</b><p className="text-slate-500">{x[1]}</p></div>)}
      </div>
    </div>
    <div className="relative"><div className="rounded-[36px] bg-gradient-to-br from-blue-600 to-cyan-400 p-2 shadow-2xl"><div className="rounded-[30px] bg-white dark:bg-slate-900 p-6"><ParkingPreview/></div></div></div>
  </section>
  <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-4">
    {[[Car,'Бронирование'],[CreditCard,'Демо-оплата'],[MapPin,'Карта'],[Shield,'Админ-панель']].map(([Icon,t])=><div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow"><Icon className="text-blue-600"/><h3 className="font-bold text-xl mt-3">{t}</h3><p className="text-slate-500 mt-2">Современный модуль системы для защиты диплома.</p></div>)}
  </section></Layout>
}

function ParkingPreview(){ return <div className="grid grid-cols-6 gap-2">{Array.from({length:36}).map((_,i)=><div key={i} className={`h-12 rounded-xl ${i%7===0?'bg-red-500':i%5===0?'bg-yellow-400':'bg-green-500'}`}></div>)}</div> }

function Login() {
  const { login } = useAuth()
  const nav = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const [form, setForm] = useState({
    email: 'admin@parking.kz',
    password: 'Admin12345'
  })

  const [err, setErr] = useState('')

  const submit = async e => {
    e.preventDefault()

    try {
      await login(form.email, form.password)
      nav('/map')
    } catch {
      setErr('Неверный email или пароль')
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow">

        <h1 className="text-4xl font-black mb-2">
          AlmaParking
        </h1>

        <p className="text-slate-500 mb-6">
          Вход в систему
        </p>

        <form onSubmit={submit} className="space-y-4">

          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({
              ...form,
              email: e.target.value
            })}
          />

          <div className="relative">

            <input
              className="input w-full pr-12"
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm({
                ...form,
                password: e.target.value
              })}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-slate-500"
            >
              {showPassword ? '🙈' : '👁'}
            </button>

          </div>

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Забыли пароль?
            </Link>
          </div>

          {err && (
            <p className="text-red-500">
              {err}
            </p>
          )}

          <button className="btn w-full">
            Войти
          </button>

        </form>

      </div>
    </Layout>
  )
}
function Register() {
  const nav = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  })

  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async e => {
    e.preventDefault()

    if (form.password.length < 6) {
      setErr('Пароль должен быть минимум 6 символов')
      return
    }

    if (form.password !== form.confirm_password) {
      setErr('Пароли не совпадают')
      return
    }

    try {
      await api.post('/auth/register', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        password: form.password
      })

      setErr('')
      setSuccess('Аккаунт успешно создан. Сейчас откроется вход...')

      setTimeout(() => {
        nav('/login')
      }, 1000)

    } catch (error) {
      setErr(error.response?.data?.detail || 'Ошибка регистрации')
      setSuccess('')
    }
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow">

        <h1 className="text-4xl font-black mb-2">
          Создать аккаунт
        </h1>

        <p className="text-slate-500 mb-6">
          Регистрация пользователя в системе AlmaParking
        </p>

        <form onSubmit={submit} className="space-y-4">

          <div className="grid md:grid-cols-2 gap-4">
            <input
              className="input"
              placeholder="Имя"
              value={form.first_name}
              onChange={e => setForm({ ...form, first_name: e.target.value })}
              required
            />

            <input
              className="input"
              placeholder="Фамилия"
              value={form.last_name}
              onChange={e => setForm({ ...form, last_name: e.target.value })}
              required
            />
          </div>

          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />

          <input
            className="input"
            placeholder="Телефон"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />

          <div className="relative">
            <input
              className="input w-full pr-12"
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-slate-500"
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>

          <div className="relative">
            <input
              className="input w-full pr-12"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Повторите пароль"
              value={form.confirm_password}
              onChange={e => setForm({ ...form, confirm_password: e.target.value })}
              required
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-3 text-slate-500"
            >
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>

          {err && (
            <div className="p-4 rounded-2xl bg-red-100 text-red-700">
              {err}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-green-100 text-green-700">
              {success}
            </div>
          )}

          <button className="btn w-full">
            Зарегистрироваться
          </button>

          <p className="text-center text-sm text-slate-500">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-blue-600 font-semibold">
              Войти
            </Link>
          </p>

        </form>
      </div>
    </Layout>
  )
}

function FlyToZone({ selected }) {
  const map = useMap()

  useEffect(() => {
    if (selected) {
      map.flyTo(
        [selected.latitude, selected.longitude],
        18,
        { duration: 1.2 }
      )
    }
  }, [selected])

  return null
}
function ParkingSpotMarkers({ selected, onSelectSpot, bookedSpots }) {
  if (!selected) return null

  const baseLat = selected.latitude
  const baseLng = selected.longitude

  const spots = Array.from({ length: 18 }).map((_, i) => {
    const row = Math.floor(i / 9)
    const col = i % 9

    return {
      id: i + 1,
      number: `A-${String(i + 1).padStart(2, '0')}`,
      status: bookedSpots.includes(`A-${String(i + 1).padStart(2, '0')}`)
  ? 'OCCUPIED'
  : [3, 8, 13].includes(i)
  ? 'OCCUPIED'
  : 'FREE',
      bounds: [
        [
          baseLat + 0.00008 + row * 0.00007,
          baseLng - 0.00020 + col * 0.000045
        ],
        [
          baseLat + 0.00012 + row * 0.00007,
          baseLng - 0.00016 + col * 0.000045
        ]
      ]
    }
  })

  return (
    <>
      {spots.map(spot => (
        <Rectangle
          key={spot.id}
          bounds={spot.bounds}
eventHandlers={{
  click: () => {

    if (spot.status === 'OCCUPIED') {
      alert('Это место уже занято')
      return
    }

    onSelectSpot(spot)

  }
}}
          pathOptions={{
            color: spot.status === 'FREE' ? '#22c55e' : '#ef4444',
            fillColor: spot.status === 'FREE' ? '#22c55e' : '#ef4444',
            fillOpacity: 0.9,
            weight: 2
          }}
        >
          <Popup>
            <div className="text-center">
              <h3 className="font-bold">{spot.number}</h3>
              <p>{spot.status === 'FREE' ? 'Свободно' : 'Занято'}</p>
            </div>
          </Popup>
        </Rectangle>
      ))}
    </>
  )
}
function MiniParkingGrid({ zone }) {
  return (
    <div className="mt-5 p-5 rounded-3xl bg-white dark:bg-slate-900 shadow">

      <h2 className="text-2xl font-black mb-4">
        Парковочные места
      </h2>

      <div className="grid grid-cols-8 gap-2">

        {Array.from({ length: 24 }).map((_, i) => (
          <button
            key={i}
            className={`h-12 rounded-xl text-white font-bold ${
              [3, 8, 13].includes(i)
                ? 'bg-red-500'
                : 'bg-green-500'
            }`}
          >
            A-{String(i + 1).padStart(2, '0')}
          </button>
        ))}

      </div>

    </div>
  )
}

function MapPage() {

  const [zones, setZones] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [bookedSpots, setBookedSpots] = useState([])

  const load = async () => {
    const { data } = await api.get('/parking/zones')
    setZones(data)

    if (!selected && data[0]) {
      setSelected(data[0])
    }
  }

  useEffect(() => {
    load()
  }, [])

  const icon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  })

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-black mb-6">Карта парковок</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MapContainer
  center={[43.238949, 76.945625]}
  zoom={15}
  style={{ height: '600px', width: '100%' }}
>
              <FlyToZone selected={selected} />

              <TileLayer
  attribution="OSM"
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>

<ParkingSpotMarkers
  selected={selected}
  onSelectSpot={setSelectedSpot}
  bookedSpots={bookedSpots}
/>

{zones.map(z => (
                <Marker
                  key={z.id}
                  position={[z.latitude, z.longitude]}
                  icon={icon}
                  eventHandlers={{ click: () => setSelected(z) }}
                >
                  <Popup>
                    <b>{z.name}</b>
                    <br />
                    {z.address}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="space-y-4">
            {zones.map(z => (
              <button
                key={z.id}
                onClick={() => setSelected(z)}
                className="w-full text-left p-5 rounded-3xl bg-white dark:bg-slate-900 shadow"
              >
                <h3 className="font-bold text-xl">{z.name}</h3>
                <p className="text-slate-500">{z.address}</p>
              </button>
            ))}
</div>
</div>

{/* 
{selected && (
  <MiniParkingGrid zone={selected} />
)}
*/}

{selectedSpot && (
  <div className="mt-6 p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
<h2 className="text-2xl font-black">
  Бронирование места {selectedSpot.number}
</h2>

<div className="grid md:grid-cols-2 gap-4 mt-5">

  <input
    className="input"
    placeholder="Госномер"
  />

  <input
    className="input"
    placeholder="Марка автомобиля"
  />

  <input
    className="input"
    type="datetime-local"
  />

  <input
    className="input"
    type="datetime-local"
  />

</div>

<div className="mt-5 flex items-center justify-between">

  <div>

    <p className="text-slate-500">
      Стоимость
    </p>

    <h3 className="text-3xl font-black">
      1200 ₸
    </h3>

  </div>

<button
  className="btn"
  onClick={() => {

    if (!bookedSpots.includes(selectedSpot.number)) {

      setBookedSpots(prev => [
        ...prev,
        selectedSpot.number
      ])

    }

    alert(`Место ${selectedSpot.number} успешно забронировано`)

    setSelectedSpot(null)

  }}
>
  Оплатить и забронировать
</button>

</div>
  </div>
)}

</main>
    </Layout>
  )
}

function Profile() {
  const { user, reload } = useAuth()

  const [items, setItems] = useState([])

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: ''
  })

  const [message, setMessage] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    api.get('/bookings/my').then(r => setItems(r.data))

    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const saveProfile = async e => {
  e.preventDefault()

  try {
    await api.put('/users/update-profile', form)
    await reload()

    toast.success('Профиль успешно обновлён')
    setErr('')
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Ошибка сохранения профиля')
    setMessage('')
  }
}

  const changePassword = async e => {
  e.preventDefault()

  if (passwords.new_password.length < 6) {
    setErr('Новый пароль слишком короткий')
    return
  }

  try {
    await api.put('/users/change-password', passwords)

    toast.success('Пароль успешно изменён')
    setErr('')
    setPasswords({
      old_password: '',
      new_password: ''
    })
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Ошибка смены пароля')
    setMessage('')
  }
}

  return (
    <Layout>

      <main className="max-w-6xl mx-auto px-4 py-10">

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow h-fit">

            <div className="flex flex-col items-center text-center">

              <div className="flex flex-col items-center">

  {
    user?.avatar ? (
      <img
        src={user.avatar}
        className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
      />
    ) : (
      <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-black">
        {user?.first_name?.[0] || 'U'}
      </div>
    )
  }

  <label className="mt-4 cursor-pointer">

    <input
      type="file"
      className="hidden"
      accept="image/*"

      onChange={async e => {

        const file = e.target.files[0]

        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {

          setAvatarLoading(true)

          await api.post(
            '/users/upload-avatar',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )

          await reload()

          toast.success('Фото профиля обновлено')

        } catch {

          toast.error('Ошибка загрузки фото')

        } finally {

          setAvatarLoading(false)

        }

      }}
    />

    <div className="mt-3 px-4 py-2 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition">

      {
        avatarLoading
          ? 'Загрузка...'
          : 'Загрузить фото'
      }

    </div>

  </label>

</div>

              <h1 className="text-3xl font-black mt-5">
                {user?.first_name} {user?.last_name}
              </h1>

              <p className="text-slate-500 mt-1">
                {user?.email}
              </p>

              <div className="mt-4 px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 font-semibold">
                {user?.role}
              </div>

            </div>

          </div>

          <div className="lg:col-span-2 space-y-6">

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow">

              <h2 className="text-2xl font-black mb-5">
                Редактирование профиля
              </h2>

              <form onSubmit={saveProfile} className="space-y-4">

                <div className="grid md:grid-cols-2 gap-4">

                  <input
                    className="input"
                    placeholder="Имя"
                    value={form.first_name}
                    onChange={e => setForm({
                      ...form,
                      first_name: e.target.value
                    })}
                  />

                  <input
                    className="input"
                    placeholder="Фамилия"
                    value={form.last_name}
                    onChange={e => setForm({
                      ...form,
                      last_name: e.target.value
                    })}
                  />

                </div>

                <input
                  className="input"
                  placeholder="Email"
                  value={form.email}
                  onChange={e => setForm({
                    ...form,
                    email: e.target.value
                  })}
                />

                <input
                  className="input"
                  placeholder="Телефон"
                  value={form.phone}
                  onChange={e => setForm({
                    ...form,
                    phone: e.target.value
                  })}
                />

                <button className="btn">
                  Сохранить изменения
                </button>

              </form>

            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow">

              <h2 className="text-2xl font-black mb-5">
                Смена пароля
              </h2>

              <form onSubmit={changePassword} className="space-y-4">

                <input
                  className="input"
                  type="password"
                  placeholder="Старый пароль"
                  value={passwords.old_password}
                  onChange={e => setPasswords({
                    ...passwords,
                    old_password: e.target.value
                  })}
                />

                <input
                  className="input"
                  type="password"
                  placeholder="Новый пароль"
                  value={passwords.new_password}
                  onChange={e => setPasswords({
                    ...passwords,
                    new_password: e.target.value
                  })}
                />

                <button className="btn">
                  Обновить пароль
                </button>

              </form>

            </div>

            {message && (
              <div className="p-5 rounded-2xl bg-green-100 text-green-700 font-semibold">
                {message}
              </div>
            )}

            {err && (
              <div className="p-5 rounded-2xl bg-red-100 text-red-700">
                {err}
              </div>
            )}

            <div>

              <h2 className="text-3xl font-black mb-4">
                История бронирований
              </h2>

              <div className="space-y-3">

                {items.map(b => (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow flex justify-between items-center"
                  >

                    <div>
                      <b className="text-lg">
                        #{b.id} · {b.zone_name}
                      </b>

                      <p className="text-slate-500 mt-1">
                        {b.plate_number} · {b.spot_number}
                      </p>

                      <p className="mt-2 font-semibold">
                        {b.total_price} ₸
                      </p>
                    </div>

                    {b.qr_code && (
                      <img
                        src={b.qr_code}
                        className="w-24 rounded-xl"
                      />
                    )}

                  </div>
                ))}

              </div>

            </div>

          </div>

        </div>

      </main>

    </Layout>
  )
}


  function MonitoringPage() {
  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 py-10">

        <h1 className="text-4xl font-black mb-8">
          Мониторинг парковок
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <h2 className="text-2xl font-black text-green-600">
              42
            </h2>

            <p className="text-slate-500 mt-2">
              Свободных мест
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <h2 className="text-2xl font-black text-yellow-500">
              18
            </h2>

            <p className="text-slate-500 mt-2">
              Забронировано
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <h2 className="text-2xl font-black text-red-500">
              63
            </h2>

            <p className="text-slate-500 mt-2">
              Занято
            </p>
          </div>

        </div>

      </main>
    </Layout>
  )
}
 function CameraMonitoringPage() {

  const cameras = [
    {
      id: 1,
      zone: 'Арбат Parking',
      status: 'ONLINE',
      plate: '777AAA02',
      confidence: '98%',
      violation: 'Неправильная парковка'
    },

    {
      id: 2,
      zone: 'Mega Center',
      status: 'ONLINE',
      plate: '123KZT02',
      confidence: '95%',
      violation: 'Стоянка более 3 часов'
    },

    {
      id: 3,
      zone: 'Dostyk Plaza',
      status: 'OFFLINE',
      plate: '—',
      confidence: '—',
      violation: 'Камера недоступна'
    },

    {
      id: 4,
      zone: 'Forum Parking',
      status: 'ONLINE',
      plate: '555BMW02',
      confidence: '97%',
      violation: 'Парковка вне зоны'
    }
  ]

  return (
    <Layout>

      <main className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-black">
              Camera Monitoring
            </h1>

            <p className="text-slate-500 mt-2">
              AI-мониторинг нарушений и камер парковки
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-red-100 text-red-700 font-bold animate-pulse">
            ● LIVE CAMERAS
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {
            cameras.map(camera => (

              <div
                key={camera.id}
                className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow"
              >

                <div className="relative">

                  <img
                    src={`https://picsum.photos/800/400?random=${camera.id}`}
                    className="w-full h-64 object-cover"
                  />

                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/70 text-white font-bold">
                    CAMERA #{camera.id}
                  </div>

                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-xl font-bold ${
                    camera.status === 'ONLINE'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {camera.status}
                  </div>

                </div>

                <div className="p-6">

                  <div className="flex items-center justify-between">

                    <div>
                      <h2 className="text-2xl font-black">
                        {camera.zone}
                      </h2>

                      <p className="text-slate-500">
                        AI Detection System
                      </p>
                    </div>

                    <div className="text-right">

                      <p className="text-sm text-slate-500">
                        Confidence
                      </p>

                      <b className="text-2xl text-blue-600">
                        {camera.confidence}
                      </b>

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">

                    <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">

                      <p className="text-slate-500 text-sm">
                        Номер машины
                      </p>

                      <b className="text-xl">
                        {camera.plate}
                      </b>

                    </div>

                    <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950">

                      <p className="text-red-700 text-sm">
                        Нарушение
                      </p>

                      <b className="text-red-700">
                        {camera.violation}
                      </b>

                    </div>

                  </div>

                </div>

              </div>

            ))
          }

        </div>

      </main>

    </Layout>
  )
}
 function PaymentDemoPage() {
  const [method, setMethod] = useState('Kaspi')
  const [paid, setPaid] = useState(false)

  return (
    <Layout>
      <main className="max-w-6xl mx-auto px-4 py-10">

        <h1 className="text-4xl font-black mb-2">
          Онлайн оплата
        </h1>

        <p className="text-slate-500 mb-8">
          Демонстрационная страница оплаты парковочного места
        </p>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 shadow">

            <h2 className="text-2xl font-black mb-5">
              Способ оплаты
            </h2>

            <div className="grid gap-3">

              {['Kaspi', 'Halyk', 'Freedom', 'Visa / Mastercard'].map(item => (
                <button
                  key={item}
                  onClick={() => setMethod(item)}
                  className={`p-4 rounded-2xl text-left font-bold border transition ${
                    method === item
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow">

            <p className="text-white/70">
              AlmaParking Payment
            </p>

            <h2 className="text-3xl font-black mt-2">
              {method}
            </h2>

            <div className="mt-10 text-4xl font-black">
              1 200 ₸
            </div>

            <p className="text-white/70 mt-2">
              Парковка · 2 часа · Алматы
            </p>

            <button
              onClick={() => setPaid(true)}
              className="mt-8 w-full py-4 rounded-2xl bg-white text-blue-700 font-black"
            >
              Оплатить
            </button>

          </div>

        </div>

        {paid && (
          <div className="mt-8 p-6 rounded-3xl bg-green-100 text-green-800 shadow">
            <h2 className="text-2xl font-black">
              Оплата успешно выполнена
            </h2>

            <p className="mt-2">
              Метод оплаты: {method}. Чек сформирован. Бронирование активно.
            </p>
          </div>
        )}

      </main>
    </Layout>
  )
} 
function AnalyticsPage() {

  const revenueData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Доход ₸',
        data: [12000, 19000, 15000, 24000, 31000, 27000, 22000]
      }
    ]
  }

  const loadData = {
    labels: ['Арбат', 'Mega', 'Dostyk', 'Forum', 'Esentai'],
    datasets: [
      {
        label: 'Загрузка %',
        data: [91, 74, 83, 68, 97]
      }
    ]
  }

  return (
    <Layout>

      <main className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-4xl font-black">
              City Analytics
            </h1>

            <p className="text-slate-500 mt-2">
              Аналитика парковочной системы Алматы
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-blue-100 text-blue-700 font-bold">
            AI Analytics
          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <p className="text-slate-500">
              Доход за месяц
            </p>

            <b className="text-3xl">
              2.4M ₸
            </b>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <p className="text-slate-500">
              Бронирований
            </p>

            <b className="text-3xl">
              12 842
            </b>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <p className="text-slate-500">
              Средняя загрузка
            </p>

            <b className="text-3xl">
              84%
            </b>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">
            <p className="text-slate-500">
              AI Confidence
            </p>

            <b className="text-3xl text-blue-600">
              97%
            </b>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">

            <h2 className="text-2xl font-black mb-5">
              Доход по дням
            </h2>

            <Line data={revenueData} />

          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow">

            <h2 className="text-2xl font-black mb-5">
              Загруженность зон
            </h2>

            <Bar data={loadData} />

          </div>

        </div>

      </main>

    </Layout>
  )
} 
function ViolationsPage() {

  const violations = [
    {
      id: 1,
      plate: '777AAA02',
      zone: 'Арбат Parking',
      type: 'Парковка вне зоны',
      fine: '15 000 ₸',
      status: 'OPEN'
    },

    {
      id: 2,
      plate: '123KZT02',
      zone: 'Mega Center',
      type: 'Превышение времени',
      fine: '8 000 ₸',
      status: 'PAID'
    },

    {
      id: 3,
      plate: '555BMW02',
      zone: 'Forum Parking',
      type: 'Блокировка проезда',
      fine: '25 000 ₸',
      status: 'OPEN'
    }
  ]

  return (
    <Layout>

      <main className="max-w-7xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">

          <div>

            <h1 className="text-4xl font-black">
              Parking Violations
            </h1>

            <p className="text-slate-500 mt-2">
              AI система обнаружения нарушений
            </p>

          </div>

          <div className="px-4 py-2 rounded-2xl bg-red-100 text-red-700 font-bold">
            AI DETECTED
          </div>

        </div>

        <div className="space-y-5">

          {
            violations.map(v => (

              <div
                key={v.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow"
              >

                <div className="grid lg:grid-cols-5 gap-4 items-center">

                  <div>
                    <p className="text-slate-500 text-sm">
                      Госномер
                    </p>

                    <b className="text-2xl">
                      {v.plate}
                    </b>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">
                      Локация
                    </p>

                    <b>
                      {v.zone}
                    </b>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">
                      Нарушение
                    </p>

                    <b className="text-red-600">
                      {v.type}
                    </b>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">
                      Штраф
                    </p>

                    <b className="text-xl">
                      {v.fine}
                    </b>
                  </div>

                  <div>

                    <div className={`px-4 py-2 rounded-2xl text-center font-bold ${
                      v.status === 'OPEN'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>

                      {v.status}

                    </div>

                  </div>

                </div>

              </div>

            ))
          }

        </div>

      </main>

    </Layout>
  )
}
 function Admin(){ 
  const [stats,setStats]=useState(null); const [zones,setZones]=useState([]); const [bookings,setBookings]=useState([]); const load=async()=>{setStats((await api.get('/admin/statistics')).data); setZones((await api.get('/parking/zones')).data); setBookings((await api.get('/bookings/all')).data)}; useEffect(()=>{load()},[]); if(!stats)return <Layout><div className="p-10">Загрузка...</div></Layout>
 const lineData={labels:stats.revenue_by_day.map(x=>x.day),datasets:[{label:'Доход',data:stats.revenue_by_day.map(x=>x.amount)}]}; const barData={labels:stats.zones_load.map(x=>x.zone),datasets:[{label:'Загрузка %',data:stats.zones_load.map(x=>x.load)}]}; const dough={labels:['Свободно','Бронь','Занято'],datasets:[{data:[stats.free_spots,stats.booked_spots,stats.occupied_spots]}]}
 return <Layout><main className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-4xl font-black">Админ-панель</h1><div className="grid md:grid-cols-4 gap-4 mt-6">{[['Пользователи',stats.total_users],['Зоны',stats.total_zones],['Места',stats.total_spots],['Доход',stats.revenue_total+' ₸']].map(x=><div className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow"><p className="text-slate-500">{x[0]}</p><b className="text-3xl">{x[1]}</b></div>)}</div><div className="grid lg:grid-cols-3 gap-5 mt-6"><div className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow"><Line data={lineData}/></div><div className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow"><Bar data={barData}/></div><div className="p-5 rounded-3xl bg-white dark:bg-slate-900 shadow"><Doughnut data={dough}/></div></div><h2 className="text-2xl font-bold mt-8">Последние бронирования</h2><div className="overflow-auto mt-3 rounded-3xl bg-white dark:bg-slate-900 shadow"><table className="w-full text-sm"><tbody>{bookings.map(b=><tr className="border-b border-slate-200 dark:border-slate-800"><td className="p-3">#{b.id}</td><td>{b.zone_name}</td><td>{b.plate_number}</td><td>{b.total_price} ₸</td><td>{b.payment_status}</td></tr>)}</tbody></table></div></main></Layout> }

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [err, setErr] = useState('')

  const submit = async e => {
    e.preventDefault()

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      setResetLink(data.reset_link)
      setErr('')
    } catch (error) {
      setErr(error.response?.data?.detail || 'Ошибка восстановления')
      setResetLink('')
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow">
        <h1 className="text-4xl font-black mb-2">Восстановление</h1>
        <p className="text-slate-500 mb-6">
          Введите email аккаунта. Система создаст ссылку для сброса пароля.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            placeholder="Введите email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {err && <p className="text-red-500">{err}</p>}

          <button className="btn w-full">
            Создать ссылку
          </button>
        </form>

        {resetLink && (
          <div className="mt-5 p-4 rounded-2xl bg-green-100 text-green-800">
            <p className="font-bold mb-2">Ссылка создана:</p>
            <a href={resetLink} className="break-all underline">
              {resetLink}
            </a>
          </div>
        )}
      </div>
    </Layout>
  )
}

function ResetPassword() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')

  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')

  const submit = async e => {
    e.preventDefault()

    try {
      const { data } = await api.post('/auth/reset-password', {
        token,
        new_password: password
      })

      setMessage(data.message)
      setErr('')
    } catch (error) {
      setErr(error.response?.data?.detail || 'Ошибка восстановления пароля')
      setMessage('')
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-16 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow">
        <h1 className="text-4xl font-black mb-2">Новый пароль</h1>
        <p className="text-slate-500 mb-6">Придумайте новый пароль для входа</p>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            type="password"
            placeholder="Новый пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          {message && <p className="text-green-600 font-semibold">{message}</p>}
          {err && <p className="text-red-500">{err}</p>}

          <button className="btn w-full">
            Сохранить новый пароль
          </button>
        </form>

        <Link to="/login" className="block text-center mt-5 text-blue-600">
          Вернуться ко входу
        </Link>
      </div>
    </Layout>
  )
}

function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
      <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password" element={<ResetPassword/>}/>
          <Route path="/map" element={<Protected><MapPage/></Protected>}/>
          <Route path="/profile" element={<Protected><Profile/></Protected>}/>
          <Route path="/payment-demo" element={<Protected><PaymentDemoPage/></Protected>}/>
          <Route path="/monitoring" element={<Protected admin><MonitoringPage/></Protected>}/>
          <Route path="/analytics" element={<Protected admin><AnalyticsPage/></Protected>}/>
          <Route path="/violations" element={<Protected admin><ViolationsPage/></Protected>}/>
          <Route path="/cameras" element={<Protected admin><CameraMonitoringPage/></Protected>}/>
          <Route path="/admin" element={<Protected admin><Admin/></Protected>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
} 

createRoot(document.getElementById('root')).render(<App />)

// Tailwind utility classes for inputs/buttons
const style = document.createElement('style')
style.innerHTML = `.input{width:100%;padding:.8rem 1rem;border-radius:1rem;border:1px solid rgb(203 213 225);background:transparent}.btn{padding:.85rem 1.2rem;border-radius:1rem;background:#2563eb;color:white;font-weight:800}`
document.head.appendChild(style) 