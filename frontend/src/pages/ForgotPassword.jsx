import { useState } from "react";
import { Mail, ParkingCircle, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <ParkingCircle />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">AlmaParking</h1>
            <p className="text-sm text-slate-500">Восстановление доступа</p>
          </div>
        </div>

        {!sent ? (
          <>
            <p className="text-slate-600 mb-5">
              Введите email, и система отправит инструкцию для восстановления пароля.
            </p>

            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative mt-2 mb-5">
              <Mail className="absolute left-4 top-3.5 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full rounded-2xl border px-12 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setSent(true)}
              className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white hover:bg-blue-700"
            >
              Отправить инструкцию
            </button>
          </>
        ) : (
          <div className="rounded-2xl bg-green-50 p-5 text-green-700 font-semibold">
            Инструкция по восстановлению отправлена. Проверьте почту.
          </div>
        )}

        <a href="/login" className="flex items-center gap-2 mt-6 text-sm text-blue-600 font-semibold">
          <ArrowLeft size={18} />
          Вернуться ко входу
        </a>
      </div>
    </div>
  );
}