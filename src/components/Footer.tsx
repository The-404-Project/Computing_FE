import { colors } from '../design-system/colors';

const Footer = () => {
  return (
    <footer className="sticky bottom-0 px-6 py-4 text-center z-10" style={{ backgroundColor: colors.primary.dark }}>
      <p className="text-sm text-white">© 2025 Fakultas Informatika, Telkom University</p>
    </footer>
  );
};

export default Footer;
