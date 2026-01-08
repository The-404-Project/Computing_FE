import { colors } from '../design-system/colors';

interface ComingSoonProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

const ComingSoon = ({ title, description, onBack }: ComingSoonProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.neutral.white }}>
      <div className="text-center px-4">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.primary.main }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4" style={{ color: '#1f2937' }}>
          {title}
        </h1>
        <p className="text-lg mb-6" style={{ color: '#6b7280' }}>
          {description || 'Fitur ini sedang dalam pengembangan'}
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-lg font-semibold transition-all"
            style={{ backgroundColor: colors.primary.main, color: colors.neutral.white }}
          >
            Kembali ke Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default ComingSoon;








