import LegalDocumentPage from '@/features/legal/LegalDocumentPage';
import { termsAndConditionsContent } from '@/features/legal/legalContent';

export default function TermsAndConditionsPage() {
  return <LegalDocumentPage content={termsAndConditionsContent} />;
}
