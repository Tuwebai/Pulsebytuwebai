import { useNavigate } from 'react-router-dom';
import GoogleConnectionCard from '../components/GoogleConnectionCard';
import GoogleModulePreviewCard from '../components/GoogleModulePreviewCard';
import GooglePageHeader from '../components/GooglePageHeader';
import { useGooglePageState } from '../hooks/useGooglePageState';

export default function GooglePage() {
  const navigate = useNavigate();
  const { connectionCopy, connectionState, domain, hasProject } = useGooglePageState();

  const handlePrimaryAction = () => {
    if (connectionState === 'missing_site' || !hasProject) {
      navigate('/dashboard/configuracion');
      return;
    }

    navigate('/dashboard/soporte');
  };

  return (
    <div className="space-y-6">
      <GooglePageHeader
        badgeLabel={connectionCopy.badgeLabel}
        badgeVariant={connectionCopy.badgeVariant}
        domain={domain}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GoogleConnectionCard
          actionLabel={connectionCopy.actionLabel}
          description={connectionCopy.description}
          onAction={handlePrimaryAction}
          title={connectionCopy.title}
        />
        <GoogleModulePreviewCard />
      </div>
    </div>
  );
}

