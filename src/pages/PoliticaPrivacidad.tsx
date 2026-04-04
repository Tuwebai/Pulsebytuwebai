import LegalDocumentPage from '@/features/legal/LegalDocumentPage';
import { privacyPolicyContent } from '@/features/legal/legalContent';

export default function PoliticaPrivacidad() {
  return <LegalDocumentPage content={privacyPolicyContent} />;
}
