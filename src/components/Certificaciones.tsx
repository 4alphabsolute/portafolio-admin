import React from "react";
import { translations } from "../translations";

type CertificacionesProps = {
  t: typeof translations["es"];
};

export const Certificaciones: React.FC<CertificacionesProps> = ({ t }) => {
  const items = t.certificaciones.items;

  return (
    <section className="py-12 px-6 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        🎓 {t.certificaciones.title}
      </h2>
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-6 bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold text-blue-600">{item.titulo}</h3>
            <p className="text-gray-800 font-medium">{item.institucion}</p>
            <p className="text-sm text-gray-500">{item.fecha}</p>
            <p className="mt-2 text-gray-600">{item.detalle}</p>
          </div>
        ))}
      </div>
    </section>
  );
};