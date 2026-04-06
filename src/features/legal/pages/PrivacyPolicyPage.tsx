import LegalDocumentPage from '@/features/legal/LegalDocumentPage';
import { privacyPolicyContent } from '@/features/legal/legalContent';

export default function PrivacyPolicyPage() {
  return <LegalDocumentPage content={privacyPolicyContent} />;
}
