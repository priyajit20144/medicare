import React from 'react';
import { AlertCircle } from 'lucide-react';

interface HealthcareDisclaimerProps {
  type?: 'general' | 'prescription' | 'emergency';
  className?: string;
}

export const HealthcareDisclaimer: React.FC<HealthcareDisclaimerProps> = ({
  type = 'general',
  className = '',
}) => {
  if (type === 'emergency') {
    return (
      <div className={`p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 ${className}`}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold block text-red-900 mb-0.5">Medical Emergency Notice</strong>
          If you are experiencing a life-threatening medical emergency, acute chest pain, severe shortness of breath, or bleeding, please call emergency services (911) or visit the nearest hospital emergency room immediately.
        </div>
      </div>
    );
  }

  if (type === 'prescription') {
    return (
      <div className={`p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 ${className}`}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold block text-amber-900 mb-0.5">Prescription Verification Requirement</strong>
          Prescription medications can only be dispensed following review and validation of a legitimate prescription issued by a licensed healthcare professional. Medicare does not provide autonomous clinical prescribing.
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-3 ${className}`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 text-slate-500 mt-0.5" />
      <p className="text-xs leading-relaxed">
        <strong>Healthcare Disclaimer:</strong> Content and services provided on Medicare are for informational and facilitative purposes and do not substitute for professional medical diagnosis, advice, or treatment from a qualified healthcare practitioner.
      </p>
    </div>
  );
};
