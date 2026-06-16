import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ParkingCircle } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <ParkingCircle />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">AlmaParking</h1>
            <p className="text-sm text-slate-500">Вход в систему</p>
          </div>
        </div>

        <label className="text-sm font-semibold text-slate-700">Email</label>
        <div className="relative mt-2 mb-4">
          <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="email"
            placeholder="example@mail.com"
            className="w-full rounded-2xl border px-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <label className="text-sm font-semibold text-slate-700">Пароль</label>
        <div className="relative mt-2 mb-3">
          <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Введите пароль"
            className="w-full rounded-2xl border px-12 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-3.5 text-slate-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <a href="/forgot-password" className="block text-right text-sm text-blue-600 hover:underline mb-5">
          Забыли пароль?
        </a>

        <button className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">
          Войти
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          Нет аккаунта?{" "}
          <a href="/register" className="text-blue-600 font-semibold hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}