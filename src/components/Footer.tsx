interface FooterProps {
  t: any;
}

export default function Footer({ t }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            {currentYear} Andrés Almeida. {t.footer.rights}.
          </p>
          <a
            href="#"
            className="text-gray-400 hover:text-white transition"
          >
            {t.footer.privacy}
          </a>
        </div>
      </div>
    </footer>
  );
}
