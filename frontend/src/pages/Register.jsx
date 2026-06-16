import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ParkingCircle, Phone, User } from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <ParkingCircle />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">AlmaParking</h1>
            <p className="text-sm text-slate-500">Регистрация пользователя</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field icon={<User size={20} />} label="Имя" placeholder="Арнай" />
          <Field icon={<User size={20} />} label="Фамилия" placeholder="Келбатыр" />
          <Field icon={<Mail size={20} />} label="Email" placeholder="example@mail.com" />
          <Field icon={<Phone size={20} />} label="Телефон" placeholder="+7 777 777 77 77" />
        </div>

        <PasswordField
          label="Пароль"
          show={showPassword}
          setShow={setShowPassword}
          placeholder="Придумайте пароль"
        />

        <PasswordField
          label="Повторите пароль"
          show={showPassword2}
          setShow={setShowPassword2}
          placeholder="Повторите пароль"
        />

        <button className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 mt-4">
          Создать аккаунт
        </button>

        <p className="text-center text-sm text-slate-500 mt-6">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}

function Field({ icon, label, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative mt-2 mb-4">
        <div className="absolute left-4 top-3.5 text-slate-400">{icon}</div>
        <input
          placeholder={placeholder}
          className="w-full rounded-2xl border px-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}

function PasswordField({ label, show, setShow, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative mt-2 mb-4">
        <Lock className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="w-full rounded-2xl border px-12 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-3.5 text-slate-500"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}